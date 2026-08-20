import type { MmdCore } from "../model/modelTypes.js";
import type { PmmParsedManifest } from "./PmmParsedTypes.js";
export declare function parsePmmDocument(bytes: ArrayBuffer | Uint8Array, core: MmdCore): PmmParsedManifest;
export interface PmmAssetReference {
    path: string;
    normalizedPath: string;
    fileName: string;
    extension: string;
    kind: "model" | "accessory" | "motion" | "audio" | "image" | "unknown";
    offset: number;
}
export interface PmmManifest {
    signature: "Polygon Movie maker";
    version: string;
    byteLength: number;
    assetReferences: PmmAssetReference[];
    modelPaths: string[];
    accessoryPaths: string[];
    motionPaths: string[];
    audioPaths: string[];
    imagePaths: string[];
}
export interface PmmAssetResolution {
    reference: PmmAssetReference;
    resolvedPath: string;
    exists?: boolean;
}
export interface PmmAssetResolutionOptions {
    userFileRoot?: string;
    existingPaths?: Iterable<string>;
}
export interface PmmScenePlan {
    modelAssets: PmmAssetResolution[];
    accessoryAssets: PmmAssetResolution[];
    motionAssets: PmmAssetResolution[];
    audioAssets: PmmAssetResolution[];
    imageAssets: PmmAssetResolution[];
    missingAssets: PmmAssetResolution[];
}
export interface PmmStaticPreviewPlan {
    primaryModel?: PmmAssetResolution;
    modelAssets: PmmAssetResolution[];
    accessoryAssets: PmmAssetResolution[];
    skippedAssets: PmmAssetResolution[];
    missingAssets: PmmAssetResolution[];
}
export declare function parsePmmManifest(bytes: Uint8Array): PmmManifest;
export declare function createPmmScenePlan(manifest: PmmManifest, options?: PmmAssetResolutionOptions): PmmScenePlan;
export declare function createPmmStaticPreviewPlan(scenePlan: PmmScenePlan): PmmStaticPreviewPlan;
export declare function resolvePmmAssetReference(reference: PmmAssetReference, options?: PmmAssetResolutionOptions): PmmAssetResolution;
export declare function resolvePmmAssetPath(path: string, userFileRoot?: string): string;
