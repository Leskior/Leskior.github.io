export type PmxTextEncoding = "utf-16-le" | "utf-8";
export interface PmxIndexSizes {
    vertex: number;
    texture: number;
    material: number;
    bone: number;
    morph: number;
    rigidBody: number;
}
export interface PmxHeader {
    version: number;
    encoding: PmxTextEncoding;
    additionalUvCount: number;
    indexSizes: PmxIndexSizes;
}
export interface PmxSectionCounts {
    vertices: number;
    faces: number;
    textures: number;
    materials: number;
    bones: number;
    morphs: number;
    displayFrames: number;
    rigidBodies: number;
    joints: number;
    softBodies: number;
}
export interface PmxMetadata {
    format: "pmx";
    header: PmxHeader;
    name: string;
    englishName: string;
    comment: string;
    englishComment: string;
    counts: PmxSectionCounts;
    trailingBytes: number;
}
export type PmxSectionName = "vertices" | "faces" | "textures" | "materials" | "bones" | "morphs" | "displayFrames" | "rigidBodies" | "joints" | "softBodies";
export interface PmxSectionRange {
    name: PmxSectionName;
    count: number;
    offset: number;
    byteLength: number;
}
export interface PmxSectionInventory {
    format: "pmx";
    header: PmxHeader;
    counts: PmxSectionCounts;
    sections: PmxSectionRange[];
    trailingBytes: number;
}
export declare function parsePmxMetadata(input: ArrayBuffer | Uint8Array): PmxMetadata;
export declare function parsePmxSectionInventory(input: ArrayBuffer | Uint8Array): PmxSectionInventory;
