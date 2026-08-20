import type { MaterialInfo } from "../parser/model/modelTypes.js";
import * as THREE from "three";
import type { TextureLoadDiagnostic, ThreeMmdTextureLoader } from "./materials.js";
export interface TextureResolver {
    resolve(path: string, modelUrl?: string): Promise<string | URL | Blob | undefined>;
}
export type TextureMap = Record<string, string | URL | Blob>;
export interface MmdToonTextureReference {
    readonly path: string;
    readonly textureInfo?: MaterialInfo["toonTextureInfo"];
    readonly shared: boolean;
}
export interface MmdToonTextureMaterial {
    readonly toonTexturePath?: string;
    readonly toonTextureInfo?: MaterialInfo["toonTextureInfo"];
    readonly sharedToonIndex?: number;
}
export type MmdMaterialTransparencyMode = "opaque" | "alphaTest" | "alphaBlend";
export interface MmdTextureAlphaEvaluationOptions {
    readonly alphaThreshold?: number;
    readonly alphaBlendThreshold?: number;
}
export declare function evaluateMmdTextureAlphaSamples(alphaSamples: ArrayLike<number>, options?: MmdTextureAlphaEvaluationOptions): MmdMaterialTransparencyMode;
export declare function evaluateMmdTextureTransparencySamples(alphaSamples: ArrayLike<number>, options?: MmdTextureAlphaEvaluationOptions): MmdMaterialTransparencyMode;
export declare function evaluateMmdTextureAlphaRgba(rgbaPixels: ArrayLike<number>, options?: MmdTextureAlphaEvaluationOptions): MmdMaterialTransparencyMode;
export declare function evaluateMmdBmpTextureAlpha(bytes: ArrayBuffer | ArrayLike<number>, options?: MmdTextureAlphaEvaluationOptions): MmdMaterialTransparencyMode | undefined;
export declare function injectMmdBmp32BitAlphaHeader(bytes: ArrayBuffer | ArrayLike<number>): Uint8Array | undefined;
export declare function evaluateMmdTextureAlphaTexture(texture: THREE.Texture, options?: MmdTextureAlphaEvaluationOptions): MmdMaterialTransparencyMode | undefined;
export declare function evaluateMmdTextureAlphaGeometry(texture: THREE.Texture, geometry: THREE.BufferGeometry, materialIndex: number, options?: MmdTextureAlphaEvaluationOptions): MmdMaterialTransparencyMode | undefined;
export declare function loadToonTexture(material: Pick<MaterialInfo, "toonTexturePath" | "toonTextureInfo" | "sharedToonIndex">, materialIndex: number, modelUrl: string | undefined, textureResolver: TextureResolver | undefined, textureDiagnostics: TextureLoadDiagnostic[], textureLoader?: ThreeMmdTextureLoader, textureCache?: Map<string, Promise<THREE.Texture | undefined>>, ddsLoader?: ThreeMmdTextureLoader): Promise<THREE.Texture | undefined>;
export declare function rotateMmdToonTexture(texture: THREE.Texture): THREE.Texture;
export declare function loadMaterialTextureWithDiagnostics(texturePath: string, textureInfo: MaterialInfo["textureInfo"], textureKind: TextureLoadDiagnostic["textureKind"], materialIndex: number, modelUrl: string | undefined, textureResolver: TextureResolver | undefined, textureDiagnostics: TextureLoadDiagnostic[], textureLoader?: ThreeMmdTextureLoader, textureCache?: Map<string, Promise<THREE.Texture | undefined>>, ddsLoader?: ThreeMmdTextureLoader): Promise<THREE.Texture | undefined>;
export declare function configureMmdTexture(texture: THREE.Texture, textureInfo?: MaterialInfo["textureInfo"]): THREE.Texture;
export declare function decodeMmdTgaTexture(bytes: ArrayBuffer | ArrayLike<number>): {
    data: Uint8Array;
    width: number;
    height: number;
    hasAlpha: boolean;
} | undefined;
export declare function isMmdBmpLikeTexturePath(texturePath: string): boolean;
export declare function isMmdTgaLikeTexturePath(texturePath: string): boolean;
export declare function isMmdDdsTexturePath(texturePath: string): boolean;
export declare function createTextureResolver(textureResolver?: TextureResolver, textureMap?: TextureMap): TextureResolver | undefined;
export declare function createMmdBuiltInToonTextureMap(baseUrl: string | URL): TextureMap;
export declare function resolveMappedTexture(texturePath: string, textureMap?: TextureMap): string | URL | Blob | undefined;
export declare function defaultSharedToonTexturePath(sharedToonIndex: number | undefined): string;
export declare function resolveMmdToonTextureReference(material: Pick<MaterialInfo, "toonTexturePath" | "toonTextureInfo" | "sharedToonIndex">): MmdToonTextureReference;
export declare function normalizeMmdTexturePath(texturePath: string): string;
export declare function createFallbackMmdMaterial(): THREE.MeshToonMaterial;
export declare function getDefaultToonGradientMap(): THREE.DataTexture;
