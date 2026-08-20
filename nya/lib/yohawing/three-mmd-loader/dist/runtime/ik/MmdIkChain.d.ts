import type { CcdIkChain, CcdIkLink, CcdIkLinkAngleLimit, CcdIkPose, CcdIkSolveInput, Vec3Tuple } from "./CcdIkSolver.js";
export interface MmdIkRuntimeBone {
    readonly parentIndex: number;
    readonly translation: Vec3Tuple;
}
export interface MmdIkRuntimeLink {
    readonly boneIndex: number;
    readonly enabled?: boolean;
    readonly angleLimit?: CcdIkLinkAngleLimit;
    readonly limitsKind?: CcdIkLink["limitsKind"];
}
export interface MmdIkRuntimeChain {
    readonly boneIndex: number;
    readonly targetBoneIndex: number;
    readonly links: readonly MmdIkRuntimeLink[];
    readonly iterationCount: number;
    readonly maxAnglePerIteration?: number;
    readonly tolerance?: number;
}
export interface CreateCcdIkSolveInputFromMmdIkInput {
    readonly bones: readonly MmdIkRuntimeBone[];
    readonly pose: CcdIkPose;
    readonly chains: readonly MmdIkRuntimeChain[];
}
export declare function createCcdIkSolveInputFromMmdIk(input: CreateCcdIkSolveInputFromMmdIkInput): CcdIkSolveInput;
export declare function mmdIkChainToCcdIkChain(chain: MmdIkRuntimeChain): CcdIkChain;
