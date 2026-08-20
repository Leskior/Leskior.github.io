import type { MaterialInfo, MorphData } from "../../parser/model/modelTypes.js";
import type * as THREE from "three";
import type { TextureLoadDiagnostic, ThreeMmdTextureLoader } from "../materials.js";
import type { MmdMaterialTransparencyMode, TextureResolver } from "../textures.js";
export interface MmdDefaultMaterialTextureSet {
    readonly texture: THREE.Texture | undefined;
    readonly gradientMap: THREE.Texture | undefined;
    readonly sphereTexture: THREE.Texture | undefined;
}
export interface MmdDefaultMaterialTransparencyOptions {
    readonly geometryAwareAlpha?: boolean;
}
export type MmdMaterialTransparencyReason = "pmx" | "texture-metadata" | "texture-alpha-scan" | "geometry-alpha-scan" | "morph-alpha" | "name-heuristic";
export interface MmdDefaultMaterialTransparencyDiagnostic {
    readonly materialIndex: number;
    readonly materialName: string;
    readonly pmxTransparencyMode: MmdMaterialTransparencyMode;
    readonly textureTransparencyMode?: MmdMaterialTransparencyMode;
    readonly finalTransparencyMode: MmdMaterialTransparencyMode;
    readonly morphAlphaTransparent: boolean;
    readonly reason: MmdMaterialTransparencyReason;
}
export declare function loadMmdDefaultMaterialTextureSet(material: MaterialInfo, materialIndex: number, modelUrl: string | undefined, textureResolver: TextureResolver | undefined, textureDiagnostics: TextureLoadDiagnostic[], textureLoader?: ThreeMmdTextureLoader, textureCache?: Map<string, Promise<THREE.Texture | undefined>>, ddsLoader?: ThreeMmdTextureLoader): Promise<MmdDefaultMaterialTextureSet>;
export declare function evaluateMmdDefaultMaterialTransparency(material: MaterialInfo, morphs: readonly MorphData[], geometry: THREE.BufferGeometry, materialIndex: number, texture: THREE.Texture | undefined, options?: MmdDefaultMaterialTransparencyOptions): {
    readonly transparencyMode: MmdMaterialTransparencyMode;
    readonly textureTransparencyMode: MmdMaterialTransparencyMode | undefined;
    readonly morphAlphaTransparent: boolean;
    readonly diagnostic: MmdDefaultMaterialTransparencyDiagnostic;
};
