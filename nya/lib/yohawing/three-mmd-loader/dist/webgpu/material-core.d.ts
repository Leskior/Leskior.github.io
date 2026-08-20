import type { MaterialRuntimeState } from "../parser/model/modelTypes.js";
import * as THREE from "three/webgpu";
import * as TSL from "three/tsl";
export declare const MMD_TSL_DEFAULT_LIGHT_COLOR: number;
export declare const MMD_TSL_DEFAULT_TOON_COORD_OFFSET = 0.45;
export interface MmdTslMaterialCoreOptions {
    readonly diffuse?: readonly [number, number, number];
    readonly ambient?: readonly [number, number, number];
    readonly specular?: readonly [number, number, number];
    readonly specularPower?: number;
    readonly lightColor?: readonly [number, number, number];
    readonly lightDirection?: THREE.Vector3;
    readonly toonCoordinateOffset?: number;
    readonly textureFactor?: readonly [number, number, number, number];
    readonly sphereTextureFactor?: readonly [number, number, number, number];
    readonly toonTextureFactor?: readonly [number, number, number, number];
    readonly shadowTint?: readonly [number, number, number];
    readonly diffuseMap?: THREE.Texture;
    readonly toonMap?: THREE.Texture;
    readonly sphereMap?: THREE.Texture;
    readonly sphereMode?: "none" | "multiply" | "add" | "subTexture";
    readonly dedicatedShadowVisibilityNode?: THREE.Node<"float">;
    readonly gammaSpaceComposite?: boolean;
    /**
     * When true, emit gamma-space composite RGB directly and pair the renderer with
     * `outputColorSpace = LinearSRGBColorSpace`. Reproduces legacy WebGL gamma-space
     * framebuffer blending (no material EOTF before the framebuffer). Default false
     * keeps experimental linear output via sRGBTransferEOTF + SRGBColorSpace.
     */
    readonly legacySrgbFramebuffer?: boolean;
}
export interface MmdTslMaterialUniforms {
    readonly diffuse: THREE.Vector3;
    readonly ambient: THREE.Vector3;
    readonly specular: THREE.Vector3;
    readonly specularPower: ReturnType<typeof TSL.float> & {
        value: number;
    };
    readonly toonCoordinateOffset: ReturnType<typeof TSL.float> & {
        value: number;
    };
    readonly lightColor: THREE.Vector3;
    readonly lightDirection: THREE.Vector3;
    readonly shadowTint: THREE.Vector3;
    readonly textureFactor: THREE.Vector4;
    readonly sphereTextureFactor: THREE.Vector4;
    readonly toonTextureFactor: THREE.Vector4;
    readonly dedicatedShadowEnabled: ReturnType<typeof TSL.float> & {
        value: number;
    };
}
export declare function createMmdTslToonMaterial(options?: MmdTslMaterialCoreOptions): THREE.MeshToonNodeMaterial;
export declare function createMmdTslBaseColorNode(options?: MmdTslMaterialCoreOptions & {
    readonly uniforms?: MmdTslMaterialUniforms;
}): THREE.VarNode<"vec3", THREE.JoinNode<"vec3">>;
export declare function syncMmdTslMaterialState(material: THREE.Material, state: MaterialRuntimeState): void;
