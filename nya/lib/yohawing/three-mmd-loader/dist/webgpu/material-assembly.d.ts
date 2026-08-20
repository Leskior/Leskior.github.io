import * as THREE from "three/webgpu";
export interface MmdTslMaterialAssemblyOptions {
    readonly respectMaterialShadowFlags?: boolean;
    readonly appendOutlineGroups?: boolean;
    readonly forceOutlineGroups?: boolean;
    readonly dedicatedShadowVisibilityNode?: THREE.Node<"float">;
    /**
     * When true, materials emit gamma-space composite RGB and must be paired with
     * `renderer.outputColorSpace = LinearSRGBColorSpace` for legacy WebGL framebuffer
     * blending parity. Default false keeps experimental linear output + SRGBColorSpace.
     */
    readonly legacySrgbFramebuffer?: boolean;
    /**
     * Set when the target renderer uses a reversed depth buffer (native WebGPU
     * with `reversedDepthBuffer: true`). Three's WebGPU backend does not
     * auto-negate `polygonOffsetFactor`/`polygonOffsetUnits` for reversed depth
     * (node_modules/three/src/renderers/webgpu/utils/WebGPUPipelineUtils.js
     * ~line 259-262 maps them straight to `depthBias`/`depthBiasSlopeScale`
     * with no `reversedDepthBuffer` branch, unlike the depth-compare function
     * a few lines below at ~line 797). A positive depth bias always increases
     * the raw stored device depth; under the non-reversed near->0/far->1
     * mapping that pushes the outline farther away as intended, but under the
     * reversed near->1/far->0 mapping the same positive bias pushes it closer
     * to the camera instead. Negate factor/units here so the outline still
     * gets pushed away from the camera under reversed depth.
     */
    readonly reversedDepth?: boolean;
}
export declare function createMmdTslMaterialFromSource(sourceMaterial: THREE.Material, options?: MmdTslMaterialAssemblyOptions): THREE.MeshToonNodeMaterial;
export declare function replaceMmdModelMaterialsWithTsl(mesh: THREE.Mesh, options?: MmdTslMaterialAssemblyOptions): void;
export declare function appendMmdTslOutlineGroups(mesh: THREE.Mesh, options?: MmdTslMaterialAssemblyOptions): number;
