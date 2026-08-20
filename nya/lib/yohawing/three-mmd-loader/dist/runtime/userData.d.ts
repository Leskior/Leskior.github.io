import type * as THREE from "three";
export interface MmdBoneRuntimeUserData {
    readonly mmdBoneName?: unknown;
    readonly mmdEnglishBoneName?: unknown;
    readonly mmdEnglishName?: unknown;
    readonly mmdFlags?: unknown;
    readonly mmdIkStateName?: unknown;
}
export interface MmdMeshRuntimeUserData {
    readonly mmdIkChains?: unknown;
    readonly mmdMorphs?: unknown;
    readonly mmdPhysics?: unknown;
}
export declare function readMmdBoneUserData(bone: THREE.Bone): MmdBoneRuntimeUserData;
export declare function readMmdMeshRuntimeData(mesh: THREE.SkinnedMesh): MmdMeshRuntimeUserData;
