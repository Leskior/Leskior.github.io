import * as THREE from "three";
export interface MmdSdefSkinningInput {
    readonly position: THREE.Vector3;
    readonly skinWeights: readonly [number, number, number, number];
    readonly boneMatrices: readonly [THREE.Matrix4, THREE.Matrix4, THREE.Matrix4, THREE.Matrix4];
    readonly sdefEnabled: number;
    readonly sdefC: THREE.Vector3;
    readonly sdefRW0: THREE.Vector3;
    readonly sdefRW1: THREE.Vector3;
    readonly bindMatrix?: THREE.Matrix4;
    readonly bindMatrixInverse?: THREE.Matrix4;
}
export interface MmdSdefNormalSkinningInput {
    readonly normal: THREE.Vector3;
    readonly skinWeights: readonly [number, number, number, number];
    readonly boneMatrices: readonly [THREE.Matrix4, THREE.Matrix4, THREE.Matrix4, THREE.Matrix4];
    readonly sdefEnabled: number;
    readonly bindMatrix?: THREE.Matrix4;
    readonly bindMatrixInverse?: THREE.Matrix4;
}
export declare function attachMmdSdefSkinning(material: THREE.Material): void;
export declare function computeMmdSdefSkinnedPosition(input: MmdSdefSkinningInput): THREE.Vector3;
export declare function computeMmdSdefSkinnedNormal(input: MmdSdefNormalSkinningInput): THREE.Vector3;
