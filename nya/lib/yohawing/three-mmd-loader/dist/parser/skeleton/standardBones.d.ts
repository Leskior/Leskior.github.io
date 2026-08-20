import type { BoneData } from "../model/modelTypes.js";
export interface StandardBoneEntry {
    readonly id: string;
    readonly japaneseName: string;
    readonly englishNames: readonly string[];
    readonly tier: "standard" | "semi-standard";
}
export interface StandardBoneDetectionResult {
    readonly standard: StandardBoneMatchResult;
    readonly semiStandard: StandardBoneMatchResult;
    readonly hasStandardSkeleton: boolean;
    readonly hasSemiStandardSkeleton: boolean;
}
export interface StandardBoneMatchResult {
    readonly present: readonly StandardBoneMatch[];
    readonly missing: readonly StandardBoneEntry[];
}
export interface StandardBoneMatch {
    readonly entry: StandardBoneEntry;
    readonly boneIndex: number;
    readonly matchedField: "name" | "englishName";
}
export declare function getStandardBoneDefinitions(): readonly StandardBoneEntry[];
export declare function detectStandardBones(bones: readonly BoneData[]): StandardBoneDetectionResult;
