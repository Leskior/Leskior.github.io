import type { DefaultMmdRuntimeOptions, MmdFrameState, MmdRuntime, MmdRuntimeAsyncTickOptions, MmdRuntimeDebugState, MmdRuntimeEvaluateOptions, MmdRuntimeTickOptions } from "../runtime/types.js";
import type { MmdAnimation, CameraState, LightState } from "../parser/model/modelTypes.js";
import type * as THREE from "three";
import type { ThreeMmdRuntimeFactoryContext } from "../three/index.js";
import type { MmdRuntimeWorkerCommand, MmdRuntimeWorkerEvent } from "./messages.js";
import type { CustomBulletWorkerPhysicsConfig } from "./externalPhysics.js";
import { MmdRuntimeWorkerPool } from "./pool.js";
export interface MmdRuntimeWorkerLike {
    postMessage(message: MmdRuntimeWorkerCommand, transfer?: Transferable[]): void;
    terminate?: () => void | Promise<number>;
    addEventListener?: (type: string, listener: (event: {
        readonly data: MmdRuntimeWorkerEvent;
    }) => void) => void;
    removeEventListener?: (type: string, listener: (event: {
        readonly data: MmdRuntimeWorkerEvent;
    }) => void) => void;
    on?: (type: string, listener: (event: MmdRuntimeWorkerEvent) => void) => void;
    off?: (type: string, listener: (event: MmdRuntimeWorkerEvent) => void) => void;
    onmessage?: unknown;
    onerror?: unknown;
}
export interface WorkerMmdRuntimeOptions {
    readonly workerFactory?: (context: ThreeMmdRuntimeFactoryContext) => MmdRuntimeWorkerLike;
    readonly workerUrl?: string | URL;
    readonly workerOptions?: WorkerOptions;
    readonly runtimeOptions?: DefaultMmdRuntimeOptions;
    readonly onFallback?: (error: unknown) => void;
    /** Allows a failed worker to continue through an equivalent inline runtime. Defaults to true. */
    readonly fallback?: boolean;
    /** Explicit bounded pool; the factory creates one lazily when omitted. */
    readonly pool?: MmdRuntimeWorkerPool;
    /** Physical slot count for the factory-owned pool. */
    readonly poolSize?: number;
    /** Structured-clone-safe external physics configuration for worker init. */
    readonly externalPhysics?: CustomBulletWorkerPhysicsConfig;
    /** Uses SAB pose transport when cross-origin isolation permits it. Defaults to auto. */
    readonly sharedMemory?: "auto" | "required" | "disabled";
}
export type WorkerMmdRuntimeFactoryOptions = WorkerMmdRuntimeOptions;
export interface WorkerMmdRuntimeFactory {
    (context: ThreeMmdRuntimeFactoryContext): MmdRuntime;
    /** Releases a factory-owned pool and its physical workers. */
    dispose(): void;
}
/**
 * Main-thread proxy for one logical runtime worker. Worker messages are
 * asynchronous by design: tick returns the last published frame while the
 * worker evaluates the newest absolute time, and pose age reports the lag.
 */
export declare class WorkerMmdRuntime implements MmdRuntime {
    private readonly mesh;
    private readonly runtimeOptions;
    private readonly applyScratch;
    private readonly frameStateScratch;
    private readonly cameraStateScratch;
    private readonly cameraFrameHint;
    private readonly lightStateScratch;
    private readonly setAnimationCommand;
    private readonly tickCommand;
    private readonly seekCommand;
    private readonly resetPoseCommand;
    private readonly clearAnimationCommand;
    private readonly workerEvaluateOptions;
    private readonly fallbackTickOptions;
    private readonly recycleCommand;
    private readonly sharedReleaseCommand;
    private readonly onMessageBound;
    private readonly onNodeMessageBound;
    private readonly onErrorBound;
    private readonly worker;
    private readonly poolLease;
    private readonly sharedPoseSlots;
    private readonly sharedPoseReadBuffer;
    private readonly settledRequests;
    private readonly readyWaiters;
    private fallbackRuntime;
    private readonly inlineFallbackAllowed;
    private failed;
    private animation;
    private currentEpoch;
    private lastAppliedSequence;
    private lastPoseAgeSeconds;
    private lastRequestedSeconds;
    private nextRequestId;
    private failureError;
    private ready;
    private disposed;
    constructor(context: ThreeMmdRuntimeFactoryContext, options?: WorkerMmdRuntimeOptions);
    poseAgeSeconds(): number;
    poseAgeFrames(): number;
    workerReady(): boolean;
    /** Resolves after the Worker and its external physics backend are initialized. */
    whenReady(): Promise<void>;
    sharedMemoryEnabled(): boolean;
    setAnimation(animation: MmdAnimation, mesh: ThreeMmdRuntimeFactoryContext["mesh"]): void;
    evaluate(seconds: number, options?: MmdRuntimeEvaluateOptions): MmdFrameState;
    tick(seconds: number, options?: MmdRuntimeTickOptions): MmdFrameState;
    tick(seconds: number, mesh: THREE.Object3D | null | undefined, options?: MmdRuntimeEvaluateOptions): MmdFrameState;
    tickAsync(seconds: number, options?: MmdRuntimeAsyncTickOptions): Promise<MmdFrameState>;
    seek(seconds: number): MmdFrameState;
    resetPose(): void;
    clearAnimation(): void;
    cameraState(): CameraState | undefined;
    lightState(): LightState | undefined;
    reset(seconds?: number): MmdFrameState;
    frameState(): MmdFrameState;
    debugState(): MmdRuntimeDebugState;
    dispose(): void;
    private handleEvent;
    private applyPose;
    private applySharedPose;
    private activateFallback;
    private onFallback;
    private fallbackCallback;
    private attachWorker;
    private detachWorker;
    private post;
    private bumpEpoch;
    private allocateRequestId;
    private resolveSettledRequest;
    private rejectSettledRequest;
    private rejectSettledRequests;
    private detachAbortListener;
    private resolveReadyWaiters;
    private rejectReadyWaiters;
    private inactiveError;
    private snapshotFrameState;
    private copyPoseFrameState;
    private copyFrameState;
    private assertMesh;
    private assertActive;
}
export declare function createWorkerMmdRuntimeFactory(options?: WorkerMmdRuntimeFactoryOptions): WorkerMmdRuntimeFactory;
export declare function createWorkerMmdRuntime(context: ThreeMmdRuntimeFactoryContext, options?: WorkerMmdRuntimeOptions): MmdRuntime;
