import * as THREE from "three";
import type { CcdIkBone, CcdIkPreparedChain, CcdIkSolver, MutableQuatTuple } from "./ik/index.js";
type RuntimeIkChain = Parameters<CcdIkSolver["solve"]>[0]["chains"][number];
interface MutableCcdIkBone {
    parentIndex: number;
    translation: [number, number, number];
}
export interface SolvePreparedIkScratch {
    readonly bones: MutableCcdIkBone[];
    readonly rotations: MutableQuatTuple[];
    readonly sourceBoneIndices: Set<number>;
}
declare function readIkChains(mesh: THREE.SkinnedMesh): RuntimeIkChain[];
declare function createCcdIkStaticBones(mesh: THREE.SkinnedMesh): CcdIkBone[];
declare function collectIkSourceBoneIndices(chains: readonly RuntimeIkChain[]): Set<number>;
export declare function solvePreparedIk(mesh: THREE.SkinnedMesh | undefined, solver: CcdIkSolver, chains: readonly CcdIkPreparedChain[], scratch: SolvePreparedIkScratch): Set<number>;
export { collectIkSourceBoneIndices, createCcdIkStaticBones, readIkChains };
