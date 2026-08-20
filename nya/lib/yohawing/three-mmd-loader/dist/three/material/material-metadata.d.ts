import type { MaterialFlags, MaterialInfo, MorphData } from "../../parser/model/modelTypes.js";
import type * as THREE from "three";
import type { MmdMaterialTransparencyMode } from "../textures.js";
export interface MmdMaterialRenderOrderEntry {
    readonly materialIndex: number;
    readonly bucket: MmdMaterialTransparencyMode;
    readonly renderOrder: number;
}
export declare function attachMmdMaterialMetadata(material: THREE.Material, materialInfo: MaterialInfo, materialIndex?: number, transparencyMode?: MmdMaterialTransparencyMode): void;
export declare function mmdMaterialCastsShadow(flags: MaterialFlags): boolean;
export declare function mmdMaterialCastsSelfShadow(flags: MaterialFlags): boolean;
export declare function syncMmdModelShadowFlags(mesh: THREE.Object3D, materials: readonly MaterialInfo[]): void;
export declare function mmdMaterialSuppressesColorAtAlpha(alpha: number, flags: MaterialFlags | undefined): boolean;
export declare const MMD_ALPHA_ZERO_DISCARD_THRESHOLD: number;
export declare function mmdMaterialAlphaTest(material: MaterialInfo, hasDiffuseTexture: boolean, textureTransparencyMode?: MmdMaterialTransparencyMode): number;
export declare function mmdTransparencyModeAlphaTest(transparencyMode: MmdMaterialTransparencyMode): number;
export declare function mmdMaterialTransparencyMode(material: MaterialInfo, _hasDiffuseTexture: boolean, textureTransparencyMode?: MmdMaterialTransparencyMode): MmdMaterialTransparencyMode;
export declare function mmdMaterialDepthWrite(_transparencyMode: MmdMaterialTransparencyMode): boolean;
export declare function mmdMaterialMorphCanAffectAlpha(morphs: readonly MorphData[], materialIndex: number): boolean;
export declare function computeMmdMaterialRenderOrder(materials: readonly {
    materialIndex: number;
    transparencyMode: MmdMaterialTransparencyMode;
}[]): MmdMaterialRenderOrderEntry[];
export declare function materialTransparencyMode(material: THREE.Material | undefined, materialInfo: MaterialInfo): MmdMaterialTransparencyMode;
