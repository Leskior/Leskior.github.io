export interface PmdHeader {
    signature: "Pmd";
    version: number;
}
export interface PmdSectionCounts {
    vertices: number;
    faces: number;
    materials: number;
    bones: number;
    iks: number;
    morphs: number;
    displayFrames: number;
    rigidBodies: number;
    joints: number;
    softBodies: 0;
}
export interface PmdMetadata {
    format: "pmd";
    header: PmdHeader;
    encoding: "shift-jis";
    name: string;
    englishName: string;
    comment: string;
    englishComment: string;
    counts: PmdSectionCounts;
    trailingBytes: number;
}
export type PmdSectionName = "vertices" | "vertexIndices" | "materials" | "bones" | "iks" | "morphs" | "morphDisplayFrames" | "boneDisplayNames" | "boneDisplayFrames" | "englishMetadata" | "englishBoneNames" | "englishMorphNames" | "englishBoneDisplayNames" | "toonTextures" | "rigidBodies" | "joints";
export interface PmdSectionRange {
    name: PmdSectionName;
    count: number;
    offset: number;
    byteLength: number;
}
export interface PmdSectionInventory {
    format: "pmd";
    header: PmdHeader;
    counts: PmdSectionCounts;
    sections: PmdSectionRange[];
    trailingBytes: number;
}
export declare function parsePmdMetadata(input: ArrayBuffer | Uint8Array): PmdMetadata;
export declare function parsePmdSectionInventory(input: ArrayBuffer | Uint8Array): PmdSectionInventory;
