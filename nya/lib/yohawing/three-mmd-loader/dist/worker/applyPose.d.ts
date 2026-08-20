import * as THREE from "three";
import type { MmdRuntimePoseBuffer } from "./protocol.js";
export interface MmdRuntimePoseApplyScratch {
    readonly worldMatrices: readonly THREE.Matrix4[];
    readonly parentIndices: Int32Array;
    readonly parentInverse: THREE.Matrix4;
    readonly localMatrix: THREE.Matrix4;
}
export declare function createMmdRuntimePoseApplyScratch(mesh: THREE.SkinnedMesh): MmdRuntimePoseApplyScratch;
/** Applies one current pose to a render skeleton using caller-owned matrix scratch. */
export declare function applyMmdRuntimePoseToMesh(pose: MmdRuntimePoseBuffer, mesh: THREE.SkinnedMesh, scratch: MmdRuntimePoseApplyScratch): void;
