import type * as THREE from "three";
import type { RuntimeRestTransform } from "./types.js";
export declare function appendTransformOrder(bones: readonly THREE.Bone[]): number[];
export declare function applyAppendTransforms(mesh: THREE.SkinnedMesh | undefined, appendOrder: readonly number[], scratchAppendTranslations: THREE.Vector3[], scratchAppendRotations: THREE.Quaternion[], scratchVector3A: THREE.Vector3, scratchQuaternionA: THREE.Quaternion): void;
export declare function reapplyAppendTransformsForSources(mesh: THREE.SkinnedMesh | undefined, sourceBoneIndices: ReadonlySet<number>, appendOrder: readonly number[], preAppendTransforms: readonly RuntimeRestTransform[], scratchChangedBoneIndices: Set<number>, scratchReappliedBoneIndices: Set<number>, scratchReapplyAppendTranslations: THREE.Vector3[], scratchReapplyAppendRotations: THREE.Quaternion[], scratchVector3A: THREE.Vector3, scratchQuaternionA: THREE.Quaternion): void;
