import { MmdRuntimeWorkerHost } from "./host.js";
import { copyMmdRuntimePoseInto } from "./protocol.js";
import { MmdRuntimeTransferablePosePool } from "./transferablePool.js";
import { acquireMmdRuntimeSharedPoseWriteSlot, publishMmdRuntimeSharedPose } from "./sharedPose.js";
import { createWorkerExternalPhysicsBackend } from "./externalPhysics.js";
const maxPreReadyCommands = 32;
const maxPendingSettledTicks = 32;
/** Owns one logical character runtime behind any Worker-like message port. */
export class MmdRuntimeWorkerEndpoint {
    port;
    createExternalPhysicsBackend;
    preReadyCommands = [];
    poseEvent = {
        type: "pose",
        pose: undefined
    };
    settledPoseEvent = {
        type: "pose",
        pose: undefined,
        requestId: 0
    };
    poseTransferList = new Array(2);
    sharedPoseSlots;
    sharedPoseEvents = [];
    host;
    pool;
    preReadyTick;
    pendingTick;
    pendingSettledTicks = [];
    pendingSettledTickIndex = 0;
    disposed = false;
    initializing = false;
    ownedPhysicsBackend;
    constructor(port, options = {}) {
        this.port = port;
        this.createExternalPhysicsBackend =
            options.createExternalPhysicsBackend ?? createWorkerExternalPhysicsBackend;
    }
    handle(command) {
        if (this.disposed) {
            return;
        }
        try {
            if (command.type === "init") {
                this.initialize(command);
                return;
            }
            if (!this.host || !this.pool) {
                this.queueBeforeReady(command);
                return;
            }
            this.handleReadyCommand(command);
        }
        catch (error) {
            this.port.postMessage({
                type: "error",
                message: error instanceof Error ? error.message : String(error)
            });
        }
    }
    initialize(command) {
        if (this.host || this.initializing) {
            throw new Error("MMD runtime worker endpoint is already initialized");
        }
        if (command.runtimeOptions?.physics === "external") {
            if (!command.externalPhysics) {
                throw new Error("External MMD physics worker configuration is required");
            }
            this.initializing = true;
            void this.initializeExternal(command);
            return;
        }
        if (command.externalPhysics) {
            throw new Error("External MMD physics worker configuration requires physics mode external");
        }
        this.finishInitialize(command);
    }
    async initializeExternal(command) {
        let backend;
        try {
            const config = command.externalPhysics;
            if (!config) {
                throw new Error("External MMD physics worker configuration is required");
            }
            backend = await this.createExternalPhysicsBackend(config);
            if (this.disposed) {
                backend.dispose?.();
                return;
            }
            this.ownedPhysicsBackend = backend;
            this.finishInitialize(command, backend);
        }
        catch (error) {
            backend?.dispose?.();
            if (this.ownedPhysicsBackend === backend) {
                this.ownedPhysicsBackend = undefined;
            }
            this.host?.dispose();
            this.host = undefined;
            this.pool = undefined;
            this.preReadyCommands.length = 0;
            this.preReadyTick = undefined;
            this.clearPendingSettledTicks();
            if (!this.disposed) {
                this.port.postMessage({
                    type: "error",
                    message: error instanceof Error ? error.message : String(error)
                });
            }
        }
        finally {
            this.initializing = false;
        }
    }
    finishInitialize(command, physicsBackend) {
        this.host = new MmdRuntimeWorkerHost(command.descriptor, {
            runtimeOptions: physicsBackend
                ? { ...command.runtimeOptions, physicsBackend }
                : command.runtimeOptions
        });
        this.pool = new MmdRuntimeTransferablePosePool(command.descriptor.bones.length, command.descriptor.morphCount);
        if (command.sharedPoseSlots) {
            validateSharedPoseSlots(command.sharedPoseSlots, command.descriptor.bones.length, command.descriptor.morphCount);
            this.sharedPoseSlots = command.sharedPoseSlots;
            this.sharedPoseEvents = command.sharedPoseSlots.map((_, slot) => ({
                type: "sharedPose",
                slot
            }));
        }
        this.port.postMessage({ type: "ready", epoch: this.host.epoch() });
        for (let index = 0; index < this.preReadyCommands.length; index += 1) {
            const queued = this.preReadyCommands[index];
            if (queued) {
                this.handleReadyCommand(queued);
            }
        }
        this.preReadyCommands.length = 0;
        const preReadyTick = this.preReadyTick;
        this.preReadyTick = undefined;
        if (preReadyTick) {
            this.handleReadyCommand(preReadyTick);
        }
    }
    queueBeforeReady(command) {
        if (command.type === "dispose") {
            this.dispose();
            return;
        }
        if (command.type === "tick") {
            this.assertRequestId(command.requestId);
            if (command.requestId !== undefined) {
                this.queuePreReadyCommand(command);
                return;
            }
            this.preReadyTick = command;
            return;
        }
        this.queuePreReadyCommand(command);
    }
    queuePreReadyCommand(command) {
        if (this.preReadyCommands.length >= maxPreReadyCommands) {
            throw new Error("MMD runtime worker ready queue overflow");
        }
        this.preReadyCommands.push(command);
    }
    handleReadyCommand(command) {
        const host = this.host;
        const pool = this.pool;
        if (!host || !pool) {
            return;
        }
        switch (command.type) {
            case "setAnimation":
                host.setAnimation(command.animation);
                this.assertEpoch(command.epoch);
                this.discardStalePendingTicks(command.epoch);
                break;
            case "seek":
                host.seek(command.seconds);
                this.assertEpoch(command.epoch);
                this.discardStalePendingTicks(command.epoch);
                break;
            case "resetPose":
                host.resetPose();
                this.assertEpoch(command.epoch);
                this.discardStalePendingTicks(command.epoch);
                break;
            case "clearAnimation":
                host.clearAnimation();
                this.assertEpoch(command.epoch);
                this.discardStalePendingTicks(command.epoch);
                break;
            case "tick":
                this.assertRequestId(command.requestId);
                if (command.epoch !== host.epoch()) {
                    break;
                }
                if (!this.publishTick(command)) {
                    if (command.requestId === undefined) {
                        this.pendingTick = command;
                    }
                    else {
                        this.queueSettledTick(command);
                    }
                }
                break;
            case "recycle":
                if (pool.release(command.pose)) {
                    this.publishPendingTick();
                }
                break;
            case "sharedRelease":
                this.publishPendingTick();
                break;
            case "dispose":
                this.dispose();
                break;
        }
    }
    publishTick(command) {
        const host = this.host;
        const pool = this.pool;
        const sharedPoseSlots = this.sharedPoseSlots;
        if (host && sharedPoseSlots) {
            const target = acquireMmdRuntimeSharedPoseWriteSlot(sharedPoseSlots);
            if (!target) {
                return false;
            }
            const pose = host.evaluate(command.seconds, command.options);
            publishMmdRuntimeSharedPose(target, pose);
            const slot = sharedPoseSlots.indexOf(target);
            const event = this.sharedPoseEvents[slot];
            if (!event) {
                throw new Error(`MMD runtime shared pose slot index is invalid: ${slot}`);
            }
            this.port.postMessage(command.requestId === undefined
                ? event
                : { type: "sharedPose", slot, requestId: command.requestId });
            return true;
        }
        const target = pool?.acquire();
        if (!host || !target) {
            return false;
        }
        const pose = copyMmdRuntimePoseInto(host.evaluate(command.seconds, command.options), target);
        const event = command.requestId === undefined ? this.poseEvent : this.settledPoseEvent;
        event.pose = pose;
        if (command.requestId !== undefined) {
            this.settledPoseEvent.requestId = command.requestId;
        }
        this.poseTransferList[0] = pose.worldMatricesColumnMajor.buffer;
        this.poseTransferList[1] = pose.morphWeights.buffer;
        this.port.postMessage(event, this.poseTransferList);
        return true;
    }
    publishPendingTick() {
        while (this.pendingSettledTickIndex < this.pendingSettledTicks.length) {
            const settled = this.pendingSettledTicks[this.pendingSettledTickIndex];
            if (!settled) {
                this.pendingSettledTickIndex += 1;
                continue;
            }
            if (settled.epoch !== this.host?.epoch()) {
                this.pendingSettledTickIndex += 1;
                continue;
            }
            if (!this.publishTick(settled)) {
                return;
            }
            this.pendingSettledTickIndex += 1;
            this.compactSettledTicksIfExhausted();
            return;
        }
        this.compactSettledTicksIfExhausted();
        const pending = this.pendingTick;
        if (!pending) {
            return;
        }
        this.pendingTick = undefined;
        if (pending.epoch !== this.host?.epoch()) {
            return;
        }
        if (!this.publishTick(pending)) {
            this.pendingTick = pending;
        }
    }
    queueSettledTick(command) {
        if (this.pendingSettledTicks.length - this.pendingSettledTickIndex >= maxPendingSettledTicks) {
            throw new Error("MMD runtime worker settled queue overflow");
        }
        this.pendingSettledTicks.push(command);
    }
    discardStalePendingTicks(epoch) {
        if (this.pendingTick?.epoch !== epoch) {
            this.pendingTick = undefined;
        }
        let writeIndex = 0;
        for (let index = this.pendingSettledTickIndex; index < this.pendingSettledTicks.length; index += 1) {
            const command = this.pendingSettledTicks[index];
            if (command?.epoch === epoch) {
                this.pendingSettledTicks[writeIndex] = command;
                writeIndex += 1;
            }
        }
        this.pendingSettledTicks.length = writeIndex;
        this.pendingSettledTickIndex = 0;
    }
    compactSettledTicksIfExhausted() {
        if (this.pendingSettledTickIndex === 0) {
            return;
        }
        if (this.pendingSettledTickIndex >= this.pendingSettledTicks.length) {
            this.clearPendingSettledTicks();
            return;
        }
        if (this.pendingSettledTickIndex < maxPendingSettledTicks) {
            return;
        }
        let writeIndex = 0;
        for (let index = this.pendingSettledTickIndex; index < this.pendingSettledTicks.length; index += 1) {
            const command = this.pendingSettledTicks[index];
            if (command) {
                this.pendingSettledTicks[writeIndex] = command;
                writeIndex += 1;
            }
        }
        this.pendingSettledTicks.length = writeIndex;
        this.pendingSettledTickIndex = 0;
    }
    clearPendingSettledTicks() {
        this.pendingSettledTicks.length = 0;
        this.pendingSettledTickIndex = 0;
    }
    assertRequestId(requestId) {
        if (requestId !== undefined && (!Number.isSafeInteger(requestId) || requestId <= 0)) {
            throw new RangeError("MMD runtime worker request id must be a positive safe integer");
        }
    }
    assertEpoch(expected) {
        if (this.host?.epoch() !== expected) {
            throw new Error(`MMD runtime worker epoch mismatch: expected ${expected}, actual ${this.host?.epoch()}`);
        }
    }
    dispose() {
        this.disposed = true;
        this.pendingTick = undefined;
        this.preReadyCommands.length = 0;
        this.preReadyTick = undefined;
        this.clearPendingSettledTicks();
        this.host?.dispose();
        this.host = undefined;
        this.pool = undefined;
        this.sharedPoseSlots = undefined;
        this.sharedPoseEvents = [];
        this.ownedPhysicsBackend?.dispose?.();
        this.ownedPhysicsBackend = undefined;
        this.port.postMessage({ type: "disposed" });
    }
}
function validateSharedPoseSlots(slots, boneCount, morphCount) {
    if (slots.length < 3) {
        throw new RangeError("MMD runtime worker shared pose transport requires at least 3 slots");
    }
    for (let index = 0; index < slots.length; index += 1) {
        const slot = slots[index];
        if (!slot ||
            slot.control.length !== 3 ||
            slot.timing.length !== 3 ||
            slot.worldMatricesColumnMajor.length !== boneCount * 16 ||
            slot.morphWeights.length !== morphCount) {
            throw new RangeError(`MMD runtime worker shared pose slot ${index} has an invalid layout`);
        }
    }
}
