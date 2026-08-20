import type { MaterialInfo, MaterialRuntimeState } from "../parser/model/modelTypes.js";
import * as THREE from "three";
export interface MmdOutlineOptions {
    readonly scale?: number;
    readonly alphaTest?: number;
    readonly fallbackColor?: THREE.ColorRepresentation;
    readonly forceFallback?: boolean;
}
export interface MmdOutlineModelSource {
    readonly mesh: THREE.SkinnedMesh;
    readonly materials: readonly MaterialInfo[];
}
export interface MmdMaterialRenderOrderMeshOptions {
    readonly renderOrderBase?: number;
    readonly shadowOnly?: boolean;
    readonly selfShadowLayer?: number;
}
export interface MmdOutlineRenderOrderOptions {
    readonly renderOrderBase?: number;
}
export declare function createMmdOutlineMeshes(model: MmdOutlineModelSource, options?: MmdOutlineOptions & MmdOutlineRenderOrderOptions): THREE.SkinnedMesh[];
export declare function attachMmdOutlineExpansion(material: THREE.Material, outlineWidth: number, hasVertexEdgeScale: boolean): void;
export declare function createMmdMaterialRenderOrderMeshes(model: MmdOutlineModelSource, options?: MmdMaterialRenderOrderMeshOptions): THREE.SkinnedMesh[];
export declare function syncMmdOutlineMaterialStates(materials: THREE.Material | THREE.Material[], states: readonly MaterialRuntimeState[]): void;
