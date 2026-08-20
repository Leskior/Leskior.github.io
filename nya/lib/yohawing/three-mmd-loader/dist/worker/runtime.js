import { DefaultMmdRuntime } from "../runtime/core.js";
import { sampleMmdCameraTrackInto, sampleMmdLightTrackInto } from "../runtime/animation.js";
import { applyMmdRuntimePoseToMesh, createMmdRuntimePoseApplyScratch } from "./applyPose.js";
import { serializeMmdRuntimeModelDescriptor } from "./modelDescriptor.js";
import { createMmdRuntimeSharedPoseReadBuffer, createMmdRuntimeSharedPoseSlots, readMmdRuntimeSharedPoseInto, releaseMmdRuntimeSharedPoseReadSlot } from "./sharedPose.js";
import { MmdRuntimeWorkerPool } from "./pool.js";
const emptyDebugState = {
    stages: {
        vmdInterpolation: { worldMatricesColumnMajor: [], morphWeights: [] },
        appendTransform: { worldMatricesColumnMajor: [], morphWeights: [] },
        ik: { worldMatricesColumnMajor: [], morphWeights: [] },
        physics: { worldMatricesColumnMajor: [], morphWeights: [] }
    }
};
/**
 * Main-thread proxy for one logical runtime worker. Worker messages are
 * asynchronous by design: tick returns the last published frame while the
 * worker evaluates the newest absolute time, and pose age reports the lag.
 */
export class WorkerMmdRuntime {
    mesh;
    runtimeOptions;
    applyScratch;
    frameStateScratch = {
        seconds: 0,
        frame: 0,
        frameRate: 30
    };
    cameraStateScratch = {
        distance: 0,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        fov: 1,
        perspective: true
    };
    cameraFrameHint = { index: 0 };
    lightStateScratch = {
        color: [0, 0, 0],
        direction: [0, 0, 0]
    };
    setAnimationCommand = {
        type: "setAnimation",
        epoch: 0
    };
    tickCommand = {
        type: "tick",
        epoch: 0,
        seconds: 0
    };
    seekCommand = {
        type: "seek",
        epoch: 0,
        seconds: 0
    };
    resetPoseCommand = {
        type: "resetPose",
        epoch: 0
    };
    clearAnimationCommand = {
        type: "clearAnimation",
        epoch: 0
    };
    workerEvaluateOptions = {};
    fallbackTickOptions;
    recycleCommand = {
        type: "recycle",
        pose: undefined
    };
    sharedReleaseCommand = { type: "sharedRelease" };
    onMessageBound = (event) => {
        this.handleEvent(event.data);
    };
    onNodeMessageBound = (event) => {
        this.handleEvent(event);
    };
    onErrorBound = (error) => {
        this.activateFallback(error);
    };
    worker;
    poolLease;
    sharedPoseSlots;
    sharedPoseReadBuffer;
    settledRequests = new Map();
    readyWaiters = [];
    fallbackRuntime;
    inlineFallbackAllowed;
    failed = false;
    animation;
    currentEpoch = 0;
    lastAppliedSequence = -1;
    lastPoseAgeSeconds = 0;
    lastRequestedSeconds = 0;
    nextRequestId = 1;
    failureError;
    ready = false;
    disposed = false;
    constructor(context, options = {}) {
        this.mesh = context.mesh;
        this.runtimeOptions = options.runtimeOptions ?? {};
        this.fallbackTickOptions = { mesh: this.mesh };
        this.inlineFallbackAllowed =
            options.fallback !== false &&
                (this.runtimeOptions.physics !== "external" || this.runtimeOptions.physicsBackend !== undefined);
        this.fallbackCallback = options.onFallback;
        this.applyScratch = createMmdRuntimePoseApplyScratch(this.mesh);
        this.poolLease = options.pool?.acquire(context, options.workerFactory);
        this.worker = this.poolLease?.worker ??
            (options.workerFactory ? options.workerFactory(context) : createDefaultWorker(options));
        if (!this.worker) {
            throw new Error("MMD runtime worker is unavailable");
        }
        this.attachWorker(this.worker);
        const descriptor = serializeMmdRuntimeModelDescriptor(this.mesh);
        const sharedMemory = resolveSharedMemoryMode(options.sharedMemory ?? "auto");
        this.sharedPoseSlots = sharedMemory
            ? createMmdRuntimeSharedPoseSlots(descriptor.bones.length, descriptor.morphCount)
            : undefined;
        this.sharedPoseReadBuffer = sharedMemory
            ? createMmdRuntimeSharedPoseReadBuffer(descriptor.bones.length, descriptor.morphCount)
            : undefined;
        this.worker.postMessage({
            type: "init",
            descriptor,
            runtimeOptions: workerRuntimeOptions(this.runtimeOptions),
            sharedPoseSlots: this.sharedPoseSlots,
            externalPhysics: options.externalPhysics
        });
        this.frameStateScratch.frameRate = this.runtimeOptions.frameRate ?? 30;
        this.frameStateScratch.seconds = this.runtimeOptions.initialSeconds ?? 0;
        this.frameStateScratch.frame = this.frameStateScratch.seconds * this.frameStateScratch.frameRate;
    }
    poseAgeSeconds() {
        return this.lastPoseAgeSeconds;
    }
    poseAgeFrames() {
        return this.lastPoseAgeSeconds * this.frameStateScratch.frameRate;
    }
    workerReady() {
        return this.ready && !this.disposed && this.fallbackRuntime === undefined;
    }
    /** Resolves after the Worker and its external physics backend are initialized. */
    whenReady() {
        if (this.workerReady()) {
            return Promise.resolve();
        }
        const inactiveError = this.inactiveError();
        if (inactiveError) {
            return Promise.reject(inactiveError);
        }
        return new Promise((resolve, reject) => {
            this.readyWaiters.push({ resolve, reject });
        });
    }
    sharedMemoryEnabled() {
        return this.sharedPoseSlots !== undefined;
    }
    setAnimation(animation, mesh) {
        this.assertMesh(mesh);
        this.assertActive();
        this.animation = animation;
        this.cameraFrameHint.index = 0;
        this.bumpEpoch();
        if (this.fallbackRuntime) {
            this.fallbackRuntime.setAnimation(animation, this.mesh);
            return;
        }
        this.setAnimationCommand.epoch = this.currentEpoch;
        this.setAnimationCommand.animation = animation;
        this.post(this.setAnimationCommand);
    }
    evaluate(seconds, options) {
        return this.tick(seconds, options);
    }
    tick(seconds, meshOrOptions, deprecatedOptions) {
        this.assertActive();
        const options = isObject3D(meshOrOptions)
            ? deprecatedOptions
            : meshOrOptions ?? undefined;
        if (this.fallbackRuntime) {
            this.fallbackTickOptions.physics = options?.physics;
            this.fallbackTickOptions.ik = options?.ik;
            const state = this.fallbackRuntime.tick(seconds, this.fallbackTickOptions);
            this.copyFrameState(state);
            this.lastPoseAgeSeconds = 0;
            return this.frameStateScratch;
        }
        if (this.failed) {
            this.lastRequestedSeconds = seconds;
            this.lastPoseAgeSeconds = Math.max(seconds - this.frameStateScratch.seconds, 0);
            return this.frameStateScratch;
        }
        this.lastRequestedSeconds = seconds;
        this.tickCommand.epoch = this.currentEpoch;
        this.tickCommand.seconds = seconds;
        this.workerEvaluateOptions.physics = options?.physics;
        this.workerEvaluateOptions.ik = options?.ik;
        this.tickCommand.options = this.workerEvaluateOptions;
        this.post(this.tickCommand);
        return this.frameStateScratch;
    }
    tickAsync(seconds, options) {
        this.assertActive();
        if (options?.signal?.aborted) {
            return Promise.reject(createAbortError());
        }
        if (this.fallbackRuntime) {
            this.fallbackTickOptions.physics = options?.physics;
            this.fallbackTickOptions.ik = options?.ik;
            const state = this.fallbackRuntime.tick(seconds, this.fallbackTickOptions);
            this.copyFrameState(state);
            this.lastPoseAgeSeconds = 0;
            return Promise.resolve(this.snapshotFrameState());
        }
        if (this.failed) {
            return Promise.reject(this.failureError ?? new Error("MMD runtime worker failed"));
        }
        const requestId = this.allocateRequestId();
        this.lastRequestedSeconds = seconds;
        return new Promise((resolve, reject) => {
            const signal = options?.signal;
            const onAbort = signal
                ? () => this.rejectSettledRequest(requestId, createAbortError())
                : undefined;
            this.settledRequests.set(requestId, {
                epoch: this.currentEpoch,
                resolve,
                reject,
                signal,
                onAbort
            });
            signal?.addEventListener("abort", onAbort, { once: true });
            this.post({
                type: "tick",
                epoch: this.currentEpoch,
                seconds,
                options: {
                    physics: options?.physics,
                    ik: options?.ik
                },
                requestId
            });
        });
    }
    seek(seconds) {
        this.assertActive();
        this.bumpEpoch();
        this.frameStateScratch.seconds = seconds;
        this.frameStateScratch.frame = seconds * this.frameStateScratch.frameRate;
        this.lastPoseAgeSeconds = 0;
        if (this.fallbackRuntime) {
            this.copyFrameState(this.fallbackRuntime.seek(seconds));
            return this.frameStateScratch;
        }
        this.seekCommand.epoch = this.currentEpoch;
        this.seekCommand.seconds = seconds;
        this.post(this.seekCommand);
        return this.frameStateScratch;
    }
    resetPose() {
        this.assertActive();
        this.bumpEpoch();
        if (this.fallbackRuntime) {
            this.fallbackRuntime.resetPose();
            return;
        }
        this.resetPoseCommand.epoch = this.currentEpoch;
        this.post(this.resetPoseCommand);
    }
    clearAnimation() {
        this.assertActive();
        this.animation = undefined;
        this.cameraFrameHint.index = 0;
        this.bumpEpoch();
        if (this.fallbackRuntime) {
            this.fallbackRuntime.clearAnimation();
            return;
        }
        this.clearAnimationCommand.epoch = this.currentEpoch;
        this.post(this.clearAnimationCommand);
    }
    cameraState() {
        if (this.fallbackRuntime) {
            return this.fallbackRuntime.cameraState();
        }
        const frames = this.animation?.cameraFrames;
        return frames ? sampleMmdCameraTrackInto(frames, this.frameStateScratch.frame, this.cameraStateScratch, this.cameraFrameHint) : undefined;
    }
    lightState() {
        if (this.fallbackRuntime) {
            return this.fallbackRuntime.lightState();
        }
        const frames = this.animation?.lightFrames;
        return frames ? sampleMmdLightTrackInto(frames, this.frameStateScratch.frame, this.lightStateScratch) : undefined;
    }
    reset(seconds = 0) {
        this.seek(seconds);
        this.resetPose();
        this.clearAnimation();
        return this.frameStateScratch;
    }
    frameState() {
        return this.snapshotFrameState();
    }
    debugState() {
        return this.fallbackRuntime?.debugState() ?? emptyDebugState;
    }
    dispose() {
        if (this.disposed) {
            return;
        }
        this.disposed = true;
        const disposeError = new Error("MMD runtime worker is disposed");
        this.rejectSettledRequests(disposeError);
        this.rejectReadyWaiters(disposeError);
        if (this.fallbackRuntime) {
            this.fallbackRuntime.clearAnimation();
        }
        else if (!this.poolLease) {
            this.worker.postMessage({ type: "dispose" });
        }
        this.poolLease?.dispose();
        this.detachWorker();
        if (!this.poolLease) {
            void this.worker.terminate?.();
        }
    }
    handleEvent(event) {
        if (this.disposed) {
            return;
        }
        if (event.type === "ready") {
            this.ready = true;
            this.resolveReadyWaiters();
            return;
        }
        if (event.type === "pose") {
            this.applyPose(event.pose, event.requestId);
            return;
        }
        if (event.type === "sharedPose") {
            this.applySharedPose(event.slot, event.requestId);
            return;
        }
        if (event.type === "error") {
            this.activateFallback(new Error(event.message));
        }
    }
    applyPose(pose, requestId) {
        const isCurrent = pose.epoch === this.currentEpoch && pose.sequence > this.lastAppliedSequence;
        if (isCurrent) {
            applyMmdRuntimePoseToMesh(pose, this.mesh, this.applyScratch);
            this.lastAppliedSequence = pose.sequence;
            this.copyPoseFrameState(pose);
            this.lastPoseAgeSeconds = Math.max(this.lastRequestedSeconds - pose.seconds, 0);
            this.resolveSettledRequest(requestId, pose.epoch);
        }
        this.recycleCommand.pose = pose;
        this.worker.postMessage(this.recycleCommand, [pose.worldMatricesColumnMajor.buffer, pose.morphWeights.buffer]);
    }
    applySharedPose(slotIndex, requestId) {
        const slot = this.sharedPoseSlots?.[slotIndex];
        const target = this.sharedPoseReadBuffer;
        if (!slot || !target) {
            this.activateFallback(new Error(`MMD runtime shared pose slot is invalid: ${slotIndex}`));
            return;
        }
        try {
            const pose = readMmdRuntimeSharedPoseInto(slot, target);
            if (!pose) {
                throw new Error(`MMD runtime shared pose slot is not ready: ${slotIndex}`);
            }
            const isCurrent = pose.epoch === this.currentEpoch && pose.sequence > this.lastAppliedSequence;
            if (isCurrent) {
                applyMmdRuntimePoseToMesh(pose, this.mesh, this.applyScratch);
                this.lastAppliedSequence = pose.sequence;
                this.copyPoseFrameState(pose);
                this.lastPoseAgeSeconds = Math.max(this.lastRequestedSeconds - pose.seconds, 0);
                this.resolveSettledRequest(requestId, pose.epoch);
            }
            releaseMmdRuntimeSharedPoseReadSlot(slot);
            this.post(this.sharedReleaseCommand);
        }
        catch (error) {
            this.activateFallback(error);
        }
    }
    activateFallback(error) {
        if (this.disposed || this.fallbackRuntime || this.failed) {
            return;
        }
        const failureError = normalizeError(error, "MMD runtime worker failed");
        this.failureError = failureError;
        this.rejectSettledRequests(failureError);
        this.rejectReadyWaiters(failureError);
        if (this.inlineFallbackAllowed) {
            this.fallbackRuntime = new DefaultMmdRuntime(this.runtimeOptions);
            if (this.animation) {
                this.fallbackRuntime.setAnimation(this.animation, this.mesh);
            }
        }
        else {
            this.failed = true;
        }
        this.ready = false;
        this.onFallback(error);
        this.detachWorker();
        if (this.poolLease) {
            this.poolLease.dispose();
        }
        else {
            void this.worker.terminate?.();
        }
    }
    onFallback(error) {
        // The callback is supplied through the factory wrapper by assigning it to
        // the private hook below. Keeping this method allocation-free on ticks also
        // makes crash handling independent from the render loop.
        this.fallbackCallback?.(error);
    }
    fallbackCallback;
    attachWorker(worker) {
        if (worker.addEventListener) {
            worker.addEventListener("message", this.onMessageBound);
            worker.addEventListener("error", this.onErrorBound);
            return;
        }
        if (worker.on) {
            worker.on("message", this.onNodeMessageBound);
            worker.on("error", this.onErrorBound);
            return;
        }
        worker.onmessage = this.onMessageBound;
        worker.onerror = this.onErrorBound;
    }
    detachWorker() {
        if (this.worker.removeEventListener) {
            this.worker.removeEventListener("message", this.onMessageBound);
            this.worker.removeEventListener("error", this.onErrorBound);
        }
        else if (this.worker.off) {
            this.worker.off("message", this.onNodeMessageBound);
            this.worker.off("error", this.onErrorBound);
        }
        else {
            this.worker.onmessage = undefined;
            this.worker.onerror = undefined;
        }
    }
    post(command) {
        try {
            this.worker.postMessage(command);
        }
        catch (error) {
            this.activateFallback(error);
        }
    }
    bumpEpoch() {
        this.rejectSettledRequests(new Error("MMD runtime settled request was invalidated by an epoch change"));
        this.currentEpoch += 1;
        this.lastAppliedSequence = -1;
    }
    allocateRequestId() {
        if (this.nextRequestId > Number.MAX_SAFE_INTEGER) {
            if (this.settledRequests.size > 0) {
                throw new Error("MMD runtime worker request id space is exhausted");
            }
            this.nextRequestId = 1;
        }
        const requestId = this.nextRequestId;
        this.nextRequestId += 1;
        return requestId;
    }
    resolveSettledRequest(requestId, epoch) {
        if (requestId === undefined) {
            return;
        }
        const request = this.settledRequests.get(requestId);
        if (!request || request.epoch !== epoch) {
            return;
        }
        this.settledRequests.delete(requestId);
        this.detachAbortListener(request);
        request.resolve(this.snapshotFrameState());
    }
    rejectSettledRequest(requestId, error) {
        const request = this.settledRequests.get(requestId);
        if (!request) {
            return;
        }
        this.settledRequests.delete(requestId);
        this.detachAbortListener(request);
        request.reject(error);
    }
    rejectSettledRequests(error) {
        for (const [requestId, request] of this.settledRequests) {
            this.settledRequests.delete(requestId);
            this.detachAbortListener(request);
            request.reject(error);
        }
    }
    detachAbortListener(request) {
        if (request.signal && request.onAbort) {
            request.signal.removeEventListener("abort", request.onAbort);
        }
    }
    resolveReadyWaiters() {
        for (let index = 0; index < this.readyWaiters.length; index += 1) {
            this.readyWaiters[index]?.resolve();
        }
        this.readyWaiters.length = 0;
    }
    rejectReadyWaiters(error) {
        for (let index = 0; index < this.readyWaiters.length; index += 1) {
            this.readyWaiters[index]?.reject(error);
        }
        this.readyWaiters.length = 0;
    }
    inactiveError() {
        if (this.disposed) {
            return new Error("MMD runtime worker is disposed");
        }
        if (this.fallbackRuntime || this.failed) {
            return this.failureError ?? new Error("MMD runtime worker failed");
        }
        return undefined;
    }
    snapshotFrameState() {
        return {
            seconds: this.frameStateScratch.seconds,
            frame: this.frameStateScratch.frame,
            frameRate: this.frameStateScratch.frameRate
        };
    }
    copyPoseFrameState(pose) {
        this.frameStateScratch.seconds = pose.seconds;
        this.frameStateScratch.frame = pose.frame;
        this.frameStateScratch.frameRate = pose.frameRate;
    }
    copyFrameState(state) {
        this.frameStateScratch.seconds = state.seconds;
        this.frameStateScratch.frame = state.frame;
        this.frameStateScratch.frameRate = state.frameRate;
    }
    assertMesh(mesh) {
        if (mesh !== this.mesh) {
            throw new Error("MMD runtime worker mesh does not match its factory context");
        }
    }
    assertActive() {
        if (this.disposed) {
            throw new Error("MMD runtime worker is disposed");
        }
    }
}
export function createWorkerMmdRuntimeFactory(options = {}) {
    let internalPool;
    const factory = (context) => {
        try {
            if (options.runtimeOptions?.physics === "external" && !options.externalPhysics) {
                throw new Error("MMD runtime worker does not support external physics");
            }
            const pool = options.pool ?? (internalPool ??= new MmdRuntimeWorkerPool({
                size: options.poolSize,
                workerFactory: options.workerFactory,
                workerUrl: options.workerUrl,
                workerOptions: options.workerOptions
            }));
            const runtime = new WorkerMmdRuntime(context, { ...options, pool });
            return runtime;
        }
        catch (error) {
            options.onFallback?.(error);
            if (options.fallback === false) {
                throw error;
            }
            return new DefaultMmdRuntime(options.runtimeOptions);
        }
    };
    factory.dispose = () => {
        if (!options.pool) {
            internalPool?.dispose();
        }
    };
    return factory;
}
export function createWorkerMmdRuntime(context, options = {}) {
    return createWorkerMmdRuntimeFactory(options)(context);
}
function createDefaultWorker(options) {
    const WorkerConstructor = globalThis.Worker;
    if (!WorkerConstructor) {
        throw new Error("MMD runtime worker is unavailable in this environment");
    }
    const workerUrl = options.workerUrl ?? new URL("./entry.js", import.meta.url);
    return new WorkerConstructor(workerUrl, {
        type: "module",
        ...options.workerOptions
    });
}
function workerRuntimeOptions(options) {
    return {
        frameRate: options.frameRate,
        initialSeconds: options.initialSeconds,
        physics: options.physics,
        ikTolerance: options.ikTolerance,
        ikMaxIterationsCap: options.ikMaxIterationsCap
    };
}
function resolveSharedMemoryMode(mode) {
    if (mode === "disabled") {
        return false;
    }
    const available = typeof SharedArrayBuffer !== "undefined" &&
        typeof Atomics !== "undefined" &&
        globalThis.crossOriginIsolated === true;
    if (mode === "required" && !available) {
        throw new Error("MMD runtime shared memory requires cross-origin isolation and SharedArrayBuffer");
    }
    return available;
}
function isObject3D(value) {
    return Boolean(value && typeof value === "object" && "isObject3D" in value);
}
function normalizeError(error, fallbackMessage) {
    return error instanceof Error ? error : new Error(error === undefined ? fallbackMessage : String(error));
}
function createAbortError() {
    const error = new Error("MMD runtime settled request was aborted");
    error.name = "AbortError";
    return error;
}
