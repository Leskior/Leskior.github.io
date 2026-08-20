import * as THREE from "three";
import type { MaterialRuntimeState, MmdModel } from "../parser/model/modelTypes.js";
export type MmdWorldMatrixColumnMajorTuple = readonly [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number
];
export type MmdWorldMatrixBuffer = readonly number[] | Float32Array | Float64Array | MmdWorldMatrixColumnMajorTuple;
export interface MmdRuntimeMeshSyncSource {
    boneMatrices(): Float32Array;
    morphWeights(): Float32Array;
    propertyState(): {
        readonly visible: boolean;
    };
    materialStates(): readonly MaterialRuntimeState[];
}
export interface ThreeMmdRuntimeSyncTarget {
    readonly mesh: THREE.SkinnedMesh;
    readonly outlineMeshes?: readonly THREE.SkinnedMesh[];
    readonly renderOrderMeshes?: readonly THREE.SkinnedMesh[];
}
export declare function mmdWorldMatrixToThree(matrices: MmdWorldMatrixBuffer, index?: number): THREE.Matrix4;
export declare function syncThreeMmdRuntimeToMesh(model: Pick<MmdModel, "skeleton">, mesh: THREE.SkinnedMesh, runtime: MmdRuntimeMeshSyncSource, outlineMeshes?: readonly THREE.SkinnedMesh[], renderOrderMeshes?: readonly THREE.SkinnedMesh[]): void;
export declare function syncThreeMmdRuntimeToModel(model: Pick<MmdModel, "skeleton">, target: ThreeMmdRuntimeSyncTarget, runtime: MmdRuntimeMeshSyncSource): void;
