export interface VmdSectionCounts {
    bones: number;
    morphs: number;
    cameras: number;
    lights: number;
    selfShadows: number;
    properties: number;
}
export interface VmdMetadata {
    format: "vmd";
    signature: string;
    encoding: "shift-jis";
    modelName: string;
    counts: VmdSectionCounts;
    trailingBytes: number;
}
export type VmdSectionName = "bone" | "morph" | "camera" | "light" | "selfShadow" | "property";
export interface VmdSectionRecord {
    name: VmdSectionName;
    count: number;
    countOffset: number;
    dataOffset: number;
    byteLength: number;
}
export interface VmdSectionInventory {
    format: "vmd";
    signature: string;
    encoding: "shift-jis";
    modelName: string;
    sections: VmdSectionRecord[];
    counts: VmdSectionCounts;
    trailingBytes: number;
}
export declare function parseVmdMetadata(input: ArrayBuffer | Uint8Array): VmdMetadata;
export declare function parseVmdSectionInventory(input: ArrayBuffer | Uint8Array): VmdSectionInventory;
