export interface VpdMetadata {
    format: "vpd";
    signature: "Vocaloid Pose Data file";
    encoding: "shift-jis";
    modelFile: string;
    boneCount: number;
    trailingCharacters: number;
}
export interface VpdPoseInventory {
    format: "vpd";
    signature: "Vocaloid Pose Data file";
    encoding: "shift-jis";
    modelFile: string;
    declaredBoneCount: number;
    parsedBoneCount: number;
    boneCountMismatch: VpdBoneCountMismatch | null;
    boneBlocks: VpdBoneBlockInventory[];
    poseTextOffset: number;
    trailingCharacters: number;
}
export interface VpdBoneBlockInventory {
    blockIndex: number;
    boneName: string;
    offset: number;
    textLength: number;
    range: {
        start: number;
        end: number;
    };
}
export interface VpdBoneCountMismatch {
    declared: number;
    parsed: number;
}
export interface VpdPose {
    format: "vpd";
    signature: "Vocaloid Pose Data file";
    encoding: "shift-jis";
    modelFile: string;
    bonePoses: VpdBonePose[];
}
export interface VpdBonePose {
    boneName: string;
    translation: [number, number, number];
    rotation: [number, number, number, number];
}
export declare function parseVpdMetadata(input: ArrayBuffer | Uint8Array): VpdMetadata;
export declare function parseVpdPoseInventory(input: ArrayBuffer | Uint8Array): VpdPoseInventory;
export declare function parseVpdPose(input: ArrayBuffer | Uint8Array): VpdPose;
