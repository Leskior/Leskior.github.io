import type { MmdAnimation } from "../parser/model/modelTypes.js";
import type { DefaultMmdRuntimeOptions, MmdFrameState, MmdRuntime, MmdRuntimeDebugState, MmdRuntimeEvaluateOptions } from "../runtime/types.js";
import { type MmdRuntimeModelDescriptor } from "./modelDescriptor.js";
import { type MmdRuntimePoseBuffer } from "./protocol.js";
export interface MmdRuntimeWorkerHostOptions {
    readonly runtime?: MmdRuntime;
    readonly runtimeOptions?: DefaultMmdRuntimeOptions;
}
/**
 * Worker-API-independent runtime host. P0 runs this in-process; later transports
 * can forward the same commands without changing runtime evaluation order.
 */
export declare class MmdRuntimeWorkerHost {
    readonly mesh: import("three").SkinnedMesh<import("three").BufferGeometry<import("three").NormalBufferAttributes, import("three").BufferGeometryEventMap>, import("three").Material<import("three").MaterialEventMap> | import("three").Material<import("three").MaterialEventMap>[], import("three").Object3DEventMap>;
    private readonly runtime;
    private readonly poseBuffer;
    private currentEpoch;
    private currentSequence;
    private disposed;
    constructor(descriptor: MmdRuntimeModelDescriptor, options?: MmdRuntimeWorkerHostOptions);
    epoch(): number;
    setAnimation(animation: MmdAnimation): MmdRuntimePoseBuffer;
    evaluate(seconds: number, options?: MmdRuntimeEvaluateOptions): MmdRuntimePoseBuffer;
    seek(seconds: number): MmdFrameState;
    resetPose(): MmdRuntimePoseBuffer;
    clearAnimation(): MmdRuntimePoseBuffer;
    frameState(): MmdFrameState;
    debugState(): MmdRuntimeDebugState;
    pose(): MmdRuntimePoseBuffer;
    dispose(): void;
    private publish;
    private assertActive;
}
