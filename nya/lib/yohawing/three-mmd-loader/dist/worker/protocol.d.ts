import type * as THREE from "three";
import type { MmdFrameState } from "../runtime/types.js";
export declare const MMD_RUNTIME_POSE_PROTOCOL_VERSION: 1;
export interface MmdRuntimePoseBuffer {
    readonly version: typeof MMD_RUNTIME_POSE_PROTOCOL_VERSION;
    readonly epoch: number;
    readonly sequence: number;
    readonly seconds: number;
    readonly frame: number;
    readonly frameRate: number;
    readonly worldMatricesColumnMajor: Float32Array;
    readonly morphWeights: Float32Array;
}
export declare function createMmdRuntimePoseBuffer(boneCount: number, morphCount: number): MmdRuntimePoseBuffer;
/** Writes one pose into a caller-owned buffer without allocating. */
export declare function captureMmdRuntimePoseInto(mesh: THREE.SkinnedMesh, frameState: MmdFrameState, epoch: number, sequence: number, target: MmdRuntimePoseBuffer): MmdRuntimePoseBuffer;
export declare function isCurrentMmdRuntimePose(pose: MmdRuntimePoseBuffer, epoch: number, lastAppliedSequence?: number): boolean;
/** Copies pose metadata and payload into a reusable transferable buffer. */
export declare function copyMmdRuntimePoseInto(source: MmdRuntimePoseBuffer, target: MmdRuntimePoseBuffer): MmdRuntimePoseBuffer;
