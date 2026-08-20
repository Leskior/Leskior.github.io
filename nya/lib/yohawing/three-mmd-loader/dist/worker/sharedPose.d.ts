import { type MmdRuntimePoseBuffer } from "./protocol.js";
export interface MmdRuntimeSharedPoseSlot {
    readonly control: Int32Array<SharedArrayBuffer>;
    readonly timing: Float64Array<SharedArrayBuffer>;
    readonly worldMatricesColumnMajor: Float32Array<SharedArrayBuffer>;
    readonly morphWeights: Float32Array<SharedArrayBuffer>;
}
export declare function createMmdRuntimeSharedPoseSlots(boneCount: number, morphCount: number, capacity?: number): MmdRuntimeSharedPoseSlot[];
/** Claims one free slot for a worker-side write without blocking. */
export declare function acquireMmdRuntimeSharedPoseWriteSlot(slots: readonly MmdRuntimeSharedPoseSlot[]): MmdRuntimeSharedPoseSlot | undefined;
/** Publishes a fully-written slot with release ordering. */
export declare function publishMmdRuntimeSharedPose(slot: MmdRuntimeSharedPoseSlot, source: MmdRuntimePoseBuffer): void;
/** Claims a published slot and exposes it through a caller-owned pose object. */
export declare function readMmdRuntimeSharedPoseInto(slot: MmdRuntimeSharedPoseSlot, target: MmdRuntimePoseBuffer): MmdRuntimePoseBuffer | undefined;
export declare function releaseMmdRuntimeSharedPoseReadSlot(slot: MmdRuntimeSharedPoseSlot): void;
export declare function resetMmdRuntimeSharedPoseSlot(slot: MmdRuntimeSharedPoseSlot): void;
export declare function createMmdRuntimeSharedPoseReadBuffer(boneCount: number, morphCount: number): MmdRuntimePoseBuffer;
