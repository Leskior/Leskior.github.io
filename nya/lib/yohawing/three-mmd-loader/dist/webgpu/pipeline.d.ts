import * as THREE from "three/webgpu";
/** The smallest model shape accepted by the TSL facade. */
export interface MmdTslPipelineModel {
    readonly root: THREE.Object3D;
    readonly mesh: THREE.SkinnedMesh;
}
/** Structured load options shared by TSL model callers. */
export interface MmdTslModelLoadOptions {
    readonly frustumCulled: false;
    readonly morphSplit: false;
    readonly morphAttributes: boolean;
    readonly outline: false;
    readonly materialRenderOrder: false;
    readonly [key: string]: unknown;
}
export interface MmdTslPipelineAttachOptions {
    readonly light?: THREE.DirectionalLight;
    /** Backgrounds can opt out of the sparse position-morph compute path. */
    readonly sparseMorphs?: boolean;
    readonly selfShadowEnabled?: boolean;
    /** Alias for selfShadowEnabled for callers that use the feature name. */
    readonly selfShadow?: boolean;
}
export interface MmdTslPipelineOptions {
    readonly light?: THREE.DirectionalLight;
    readonly selfShadowEnabled?: boolean;
    readonly selfShadowMode?: 0 | 1 | 2;
    /** Optional application-specific MMD toon-ramp coordinate offset. */
    readonly toonCoordinateOffset?: number;
    readonly appendOutlineGroups?: boolean;
    readonly respectMaterialShadowFlags?: boolean;
}
export interface MmdTslPipeline {
    readonly renderer: THREE.WebGPURenderer;
    readonly light: THREE.DirectionalLight | undefined;
    createModelLoadOptions(overrides?: Partial<MmdTslModelLoadOptions>): MmdTslModelLoadOptions;
    attach(model: MmdTslPipelineModel, options?: MmdTslPipelineAttachOptions): boolean;
    detach(model: MmdTslPipelineModel): boolean;
    prepareRender(scene: THREE.Scene): boolean;
    render(scene: THREE.Scene, camera: THREE.Camera): boolean;
    setSelfShadowEnabled(enabled: boolean): boolean;
    setSelfShadowMode(mode: 0 | 1 | 2): boolean;
    /** Viewer/debug integration without exposing the private self-shadow pass. */
    setReceiverVisibilityDebug(model: MmdTslPipelineModel, enabled: boolean, sampleTarget?: boolean): boolean;
    getSelfShadowDebugState(): MmdTslSelfShadowDebugState;
    dispose(): void;
}
/** Lightweight diagnostics for tools that need to show the pipeline state. */
export interface MmdTslSelfShadowDebugState {
    readonly passReady: boolean;
    readonly attachedModelCount: number;
    readonly receiverUniformCount: number;
    readonly enabledReceiverUniformCount: number;
}
/**
 * Returns the load flags required by the native WebGPU TSL path.
 * Overrides are intentionally structural so this helper can be passed to
 * ThreeMmdLoader without importing the renderer-neutral loader types here.
 */
export declare function createModelLoadOptions(overrides?: Partial<MmdTslModelLoadOptions>): MmdTslModelLoadOptions;
/**
 * Creates the native WebGPU TSL facade after backend initialization.
 * The factory is async because WebGPURenderer.init() performs adapter/device
 * acquisition and may reject when WebGPU is unavailable.
 */
export declare function createMmdTslPipeline(renderer: THREE.WebGPURenderer, options?: MmdTslPipelineOptions): Promise<MmdTslPipeline>;
