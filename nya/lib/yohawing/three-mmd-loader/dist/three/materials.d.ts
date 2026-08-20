import * as THREE from "three";
import type { MaterialInfo, MorphData } from "../parser/model/modelTypes.js";
import type { MmdDefaultMaterialTransparencyDiagnostic } from "./material/material-texture-set.js";
import type { TextureMap, TextureResolver } from "./textures.js";
export interface TextureLoadDiagnostic {
    readonly level: "warning";
    readonly code: "TEXTURE_FORMAT_UNSUPPORTED" | "TEXTURE_RESOLVE_FAILED" | "SPHERE_MAP_NOT_SUPPORTED";
    readonly materialIndex: number;
    readonly textureKind: "diffuse" | "sphere" | "toon";
    readonly path: string;
    readonly sphereMode?: MaterialInfo["sphereMode"];
}
export type MaterialTransparencyDiagnostic = MmdDefaultMaterialTransparencyDiagnostic;
export interface ThreeMmdTextureLoader {
    load(url: string, onLoad?: (texture: THREE.Texture) => void, onProgress?: (event: ProgressEvent) => void, onError?: (error: unknown) => void): THREE.Texture;
}
export interface ThreeMmdMaterialTextureOptions {
    readonly textureResolver?: TextureResolver;
    readonly textureMap?: TextureMap;
    readonly textureLoader?: ThreeMmdTextureLoader;
    readonly ddsLoader?: ThreeMmdTextureLoader;
    readonly textureCache?: Map<string, Promise<THREE.Texture | undefined>>;
    readonly modelUrl?: string;
    readonly geometry?: THREE.BufferGeometry;
    readonly morphs?: readonly MorphData[];
    readonly geometryAwareAlpha?: boolean;
    readonly materialDiagnostics?: MaterialTransparencyDiagnostic[];
}
export type ThreeMmdSphereMappedToonMaterial = THREE.MeshToonMaterial & {
    envMap?: THREE.Texture | null;
    combine?: THREE.Combine;
};
export declare function createThreeMmdMaterials(materials: readonly MaterialInfo[]): THREE.MeshToonMaterial[];
export declare function applyThreeMmdMaterialTextures(threeMaterials: readonly THREE.MeshToonMaterial[], mmdMaterials: readonly MaterialInfo[], options?: ThreeMmdMaterialTextureOptions): Promise<TextureLoadDiagnostic[]>;
