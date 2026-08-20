import * as THREE from "three";
export interface MmdRuntimeBoneDescriptor {
    readonly name: string;
    readonly parentIndex: number;
    readonly position: readonly [number, number, number];
    readonly quaternion: readonly [number, number, number, number];
    readonly scale: readonly [number, number, number];
    readonly userData: Readonly<Record<string, unknown>>;
}
export interface MmdRuntimeModelDescriptor {
    readonly version: 1;
    readonly name: string;
    readonly bones: readonly MmdRuntimeBoneDescriptor[];
    readonly boneInversesColumnMajor: readonly (readonly number[])[];
    readonly bindMatrixColumnMajor: readonly number[];
    readonly morphCount: number;
    readonly morphTargetDictionary?: Readonly<Record<string, number>>;
    readonly userData: Readonly<Record<string, unknown>>;
}
/** Captures the runtime-only subset of an MMD mesh into structured-clone-safe data. */
export declare function serializeMmdRuntimeModelDescriptor(mesh: THREE.SkinnedMesh): MmdRuntimeModelDescriptor;
/** Rebuilds the non-rendering skeleton target used by an in-worker runtime. */
export declare function buildShadowMmdSkinnedMesh(descriptor: MmdRuntimeModelDescriptor): THREE.SkinnedMesh;
