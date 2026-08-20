export type MmdAssetKind = "model" | "motion" | "texture" | "accessory" | "audio";
export interface MmdFileIndex {
    readonly models: readonly File[];
    readonly motions: readonly File[];
    readonly accessories: readonly File[];
    readonly audios: readonly File[];
    readonly textures: readonly File[];
    resolve(path: string): File | undefined;
}
export declare function classifyMmdAssetKind(path: string): MmdAssetKind | undefined;
export declare function createMmdFileIndex(files: readonly File[]): MmdFileIndex;
