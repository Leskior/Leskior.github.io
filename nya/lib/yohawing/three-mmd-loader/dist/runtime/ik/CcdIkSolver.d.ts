export type Vec3Tuple = readonly [number, number, number];
export type QuatTuple = readonly [number, number, number, number];
export type MutableQuatTuple = [number, number, number, number];
export interface CcdIkBone {
    readonly parentIndex: number;
    readonly translation: Vec3Tuple;
}
export interface CcdIkLink {
    readonly boneIndex: number;
    readonly enabled?: boolean;
    readonly fixedAxis?: Vec3Tuple;
    /**
     * PMX local-axis frame used to interpret {@link angleLimit}. The quaternion
     * maps the solver's unit XYZ frame onto the bone's PMX local axes.
     */
    readonly localAxisBasis?: QuatTuple;
    readonly angleLimit?: CcdIkLinkAngleLimit;
    readonly limitsKind?: "pmdKnee" | "pmxLinkLimit";
}
export interface CcdIkLinkAngleLimit {
    readonly minimumAngle: Vec3Tuple;
    readonly maximumAngle: Vec3Tuple;
}
export interface CcdIkChain {
    readonly goalBoneIndex: number;
    readonly effectorBoneIndex: number;
    readonly links: readonly CcdIkLink[];
    readonly iterationCount: number;
    readonly maxAnglePerIteration?: number;
    readonly tolerance?: number;
}
export interface CcdIkPose {
    readonly rotations: MutableQuatTuple[];
}
export interface CcdIkSolveInput {
    readonly bones: readonly CcdIkBone[];
    readonly pose: CcdIkPose;
    readonly chains: readonly CcdIkChain[];
}
declare const PREPARED_CHAIN_BRAND: unique symbol;
export type CcdIkPreparedChain = CcdIkChain & {
    readonly [PREPARED_CHAIN_BRAND]: true;
};
export interface CcdIkPreparedSolveInput {
    readonly bones: readonly CcdIkBone[];
    readonly pose: CcdIkPose;
    readonly chains: readonly CcdIkPreparedChain[];
}
export interface CcdIkSolveResult {
    readonly chainCount: number;
    readonly iterationCount: number;
    readonly finalDistances: readonly number[];
}
export declare class CcdIkSolver {
    private readonly scratchComposeLocalMatrix;
    private scratchComposeStates;
    private readonly scratchTranslations;
    private scratchMatrices;
    private readonly scratchBaseRotations;
    private readonly scratchIkRotations;
    private readonly scratchBestRotations;
    private readonly scratchChainState;
    private readonly scratchIkVectors;
    private readonly scratchLinkLimits;
    private readonly scratchIkQuaternions;
    private readonly scratchIkEulerVectors;
    private readonly scratchRotation3;
    prepareChain(chain: CcdIkChain, bones: readonly CcdIkBone[]): CcdIkPreparedChain;
    prepareChains(chains: readonly CcdIkChain[], bones: readonly CcdIkBone[]): CcdIkPreparedChain[];
    solve(input: CcdIkSolveInput): CcdIkSolveResult;
    solvePrepared(input: CcdIkPreparedSolveInput): CcdIkSolveResult;
    applyPrepared(input: CcdIkPreparedSolveInput): void;
    private runPrepared;
    private ensureComposeStatesCapacity;
    private ensureSolveScratchCapacity;
}
export {};
