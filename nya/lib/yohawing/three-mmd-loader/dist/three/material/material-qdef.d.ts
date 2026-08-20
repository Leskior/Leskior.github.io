import * as THREE from "three";
export interface MmdQdefSkinningInput {
    readonly position: THREE.Vector3;
    readonly skinWeights: readonly [number, number, number, number];
    readonly boneMatrices: readonly [THREE.Matrix4, THREE.Matrix4, THREE.Matrix4, THREE.Matrix4];
    readonly bindMatrix?: THREE.Matrix4;
    readonly bindMatrixInverse?: THREE.Matrix4;
}
export interface MmdQdefNormalSkinningInput {
    readonly normal: THREE.Vector3;
    readonly skinWeights: readonly [number, number, number, number];
    readonly boneMatrices: readonly [THREE.Matrix4, THREE.Matrix4, THREE.Matrix4, THREE.Matrix4];
}
/**
 * CPU reference for QDEF (Dual Quaternion Skinning) vertex position.
 *
 * Blends the four bone transformations as dual quaternions rather than matrices,
 * avoiding the "candy wrapper" volume collapse of linear blend skinning (BDEF4).
 */
export declare function computeQdefSkinnedPosition(input: MmdQdefSkinningInput): THREE.Vector3;
/**
 * CPU reference for QDEF (Dual Quaternion Skinning) vertex normal.
 * Translation does not affect normals — only the rotation part is applied.
 */
export declare function computeQdefSkinnedNormal(input: MmdQdefNormalSkinningInput): THREE.Vector3;
