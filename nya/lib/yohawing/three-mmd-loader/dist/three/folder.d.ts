import type { TextureMap } from "./textures.js";
export declare function createMmdTextureMapFromFiles(files: readonly File[], modelFile: File): TextureMap;
export declare function findMmdModelFiles(files: readonly File[]): File[];
export declare function findMmdMotionFiles(files: readonly File[]): File[];
export declare function findMmdAccessoryFiles(files: readonly File[]): File[];
export declare function findMmdAudioFiles(files: readonly File[]): File[];
export declare function isMmdModelFile(file: {
    readonly name: string;
}): boolean;
export declare function isMmdMotionFile(file: {
    readonly name: string;
}): boolean;
export declare function isMmdTextureFile(file: {
    readonly name: string;
}): boolean;
export declare function isMmdAccessoryFile(file: {
    readonly name: string;
}): boolean;
export declare function isMmdAudioFile(file: {
    readonly name: string;
}): boolean;
export declare function normalizeMmdRelativePath(path: string): string;
export declare function compareFileKey(a: File, b: File): number;
