import * as THREE from "three";
import type { MmdAnimation, MmdCore, MmdPose } from "../parser/model/modelTypes.js";
import type { MmdAnimRuntimeWasmCameraTrack, MmdAnimRuntimeWasmLightTrack, DefaultMmdRuntimeOptions, MmdFrameState, MmdRuntime, MmdRuntimeAsyncEvaluateOptions, MmdRuntimeEvaluateOptions } from "../runtime/index.js";
import type { MaterialTransparencyDiagnostic, TextureLoadDiagnostic, ThreeMmdTextureLoader } from "./materials.js";
import type { LoaderPerformanceMeasure, LoaderPerformanceOptions } from "./performance.js";
import type { ModelSource } from "./modelSource.js";
import type { ModelSourceDiagnostic, ModelSourceFetch } from "./modelSource.js";
import type { TextureMap, TextureResolver } from "./textures.js";
export { createThreeBufferGeometry, createThreeMorphSplitGeometries } from "./geometry.js";
export type { ThreeMmdGeometryOptions } from "./geometry.js";
export { applyMmdCameraStateToThreeCamera } from "./camera.js";
export { applyMmdLightStateToThreeDirectionalLight } from "./light.js";
export { disposeMmdModel } from "./dispose.js";
export type { DisposeMmdModelOptions } from "./dispose.js";
export { classifyMmdAssetKind, createMmdFileIndex } from "./assets.js";
export type { MmdAssetKind, MmdFileIndex } from "./assets.js";
export { createMmdTextureMapFromFiles, findMmdAccessoryFiles, findMmdAudioFiles, findMmdModelFiles, findMmdMotionFiles, isMmdAccessoryFile, isMmdAudioFile, isMmdModelFile, isMmdMotionFile, isMmdTextureFile, normalizeMmdRelativePath } from "./folder.js";
export { isModelSource } from "./modelSource.js";
export { applyThreeMmdMaterialTextures, createThreeMmdMaterials } from "./materials.js";
export { mmdWorldMatrixToThree, syncThreeMmdRuntimeToMesh, syncThreeMmdRuntimeToModel } from "./runtime-sync.js";
export { applyMmdSelfShadowStateToThreeDirectionalLight, configureMmdSelfShadowDirectionalLight, fitMmdSelfShadowDirectionalLightToBox, MMD_SELF_SHADOW_LAYER } from "./shadow.js";
export { createThreeSkeleton } from "./skeleton.js";
export { attachMmdMaterialMetadata, computeMmdMaterialRenderOrder, materialTransparencyMode, mmdMaterialAlphaTest, mmdMaterialCastsShadow, mmdMaterialDepthWrite, mmdMaterialMorphCanAffectAlpha, mmdMaterialSuppressesColorAtAlpha, mmdMaterialTransparencyMode, syncMmdModelShadowFlags } from "./material/material-metadata.js";
export { attachMmdMaterialFactors, attachMmdSphereTexture, materialHasTextureMap, mmdSphereModeToUniform } from "./material/material-shader-hooks.js";
export { syncMmdMaterialStates, syncMmdSpecularDirection } from "./material/material-sync.js";
export { attachMmdOutlineExpansion, createMmdMaterialRenderOrderMeshes, createMmdOutlineMeshes, syncMmdOutlineMaterialStates } from "./outline.js";
export { attachMmdSdefSkinning, computeMmdSdefSkinnedNormal, computeMmdSdefSkinnedPosition } from "./material/material-sdef.js";
export { computeQdefSkinnedNormal, computeQdefSkinnedPosition } from "./material/material-qdef.js";
export type { MmdQdefNormalSkinningInput, MmdQdefSkinningInput } from "./material/material-qdef.js";
export { createMmdBuiltInToonTextureMap, createTextureResolver, defaultSharedToonTexturePath, getDefaultToonGradientMap, isMmdDdsTexturePath, normalizeMmdTexturePath, resolveMappedTexture, resolveMmdToonTextureReference } from "./textures.js";
export type { ApplyMmdCameraStateOptions } from "./camera.js";
export type { ApplyMmdLightStateOptions } from "./light.js";
export type { ApplyMmdSelfShadowStateOptions, ConfigureMmdSelfShadowDirectionalLightOptions, FitMmdSelfShadowDirectionalLightOptions } from "./shadow.js";
export type { ThreeMmdAdditionalUvMorphOffset, ThreeMmdGeometryBuffers, ThreeMmdGeometryMaterial, ThreeMmdGeometryMorph, ThreeMmdMorphSplitGeometry, ThreeMmdMaterialGroup, ThreeMmdQdefBuffers, ThreeMmdSdefBuffers, ThreeMmdUvMorphOffset, ThreeMmdVertexMorphOffset } from "./geometry.js";
export type { ModelSource, ModelSourceDiagnostic, ModelSourceFetch, ReadModelSourceOptions, ReadModelSourceResult } from "./modelSource.js";
export type { MaterialTransparencyDiagnostic, TextureLoadDiagnostic, ThreeMmdTextureLoader } from "./materials.js";
export type { LoaderPerformanceMeasure, LoaderPerformanceOptions } from "./performance.js";
export type { ThreeMmdSphereMappedToonMaterial } from "./materials.js";
export type { MmdSdefNormalSkinningInput, MmdSdefSkinningInput } from "./material/material-sdef.js";
export type { MmdMaterialRenderOrderMeshOptions, MmdOutlineModelSource, MmdOutlineOptions } from "./outline.js";
export type { MmdMaterialRenderOrderEntry } from "./material/material-metadata.js";
export type { MmdRuntimeMeshSyncSource, MmdWorldMatrixBuffer, MmdWorldMatrixColumnMajorTuple, ThreeMmdRuntimeSyncTarget } from "./runtime-sync.js";
export type { ThreeMmdSkeletonBone, ThreeMmdSkeletonData } from "./skeleton.js";
export type { MmdToonTextureMaterial, MmdToonTextureReference, MmdMaterialTransparencyMode, TextureMap, TextureResolver } from "./textures.js";
export interface ThreeMmdLoaderOptions {
    /** Resolves MMD-relative texture paths when loading model materials. */
    readonly textureResolver?: TextureResolver;
    /** Maps MMD-relative texture paths to browser-loadable texture sources. */
    readonly textureMap?: TextureMap;
    /** Overrides the default Three.js texture loader for ordinary textures. */
    readonly textureLoader?: ThreeMmdTextureLoader;
    /** Overrides the texture loader used for DDS textures. */
    readonly ddsLoader?: ThreeMmdTextureLoader;
    /** Enables geometry-aware texture alpha checks. Defaults to off, except when outlines require it internally. */
    readonly geometryAwareAlpha?: boolean;
    /** Options forwarded to the per-model runtime. */
    readonly runtime?: DefaultMmdRuntimeOptions;
    /** Creates a per-model runtime. When omitted, the bundled mmd-anim runtime is used for PMX. */
    readonly runtimeFactory?: (context: ThreeMmdRuntimeFactoryContext) => MmdRuntime;
    /** Parser core override. When omitted, the loader uses the TypeScript parser core. */
    readonly core?: MmdCore | Promise<MmdCore>;
    /** Overrides fetch for string ModelSource values. */
    readonly fetch?: ModelSourceFetch;
    /** Enables load-time performance marks and diagnostics. */
    readonly performance?: boolean | LoaderPerformanceOptions;
    /** Receives recoverable parser-core failures before falling back to the TypeScript parser. */
    readonly onCoreFallback?: (event: ThreeMmdCoreFallbackEvent) => void;
}
export interface ThreeMmdRuntimeFactoryContext {
    readonly modelBytes: Uint8Array;
    readonly mesh: THREE.SkinnedMesh;
    readonly source: ThreeMmdModelSourceDescriptor;
}
export interface ThreeMmdCoreFallbackEvent {
    readonly operation: "initCore" | "loadModel" | "loadVmd";
    readonly error: unknown;
}
export interface ThreeMmdLoadModelOptions {
    /** Creates MMD outline proxy meshes. Defaults to true. */
    readonly outline?: boolean;
    /**
     * @deprecated Use outline instead. This alias will be removed in the next
     * breaking release.
     */
    readonly outlines?: boolean;
    /** Applies MMD-compatible per-material render ordering with proxy meshes. Defaults to true. */
    readonly materialRenderOrder?: boolean;
    /**
     * @deprecated Use materialRenderOrder instead. This alias will be removed in
     * the next breaking release.
     */
    readonly renderOrderProxies?: boolean;
    /** Splits large sparse morph geometry into per-material body meshes. Defaults to true. */
    readonly morphSplit?: boolean;
    /** Creates dense Three.js morph attributes. Defaults to true. */
    readonly morphAttributes?: boolean;
    /** Applies frustum culling to the base mesh and generated proxy meshes. */
    readonly frustumCulled?: boolean;
    /** Overrides fetch for this string ModelSource load. */
    readonly fetch?: ModelSourceFetch;
    /** Cancels this string ModelSource fetch when supported by the host fetch implementation. */
    readonly signal?: AbortSignal;
}
export type ThreeMmdModelSourceDescriptor = {
    readonly kind: "bytes";
    readonly byteLength: number;
} | {
    readonly kind: "url";
    readonly byteLength: number;
    readonly name?: string;
} | {
    readonly kind: "file";
    readonly byteLength: number;
    readonly name?: string;
};
export interface ThreeMmdModel {
    /** Scene-ready root. Usually add only this object to the scene. */
    readonly root: THREE.Group;
    /**
     * @deprecated Use root instead. This alias will be removed in the next
     * breaking release.
     */
    readonly object: THREE.Group;
    /** Base MMD SkinnedMesh for advanced access and runtime binding. */
    readonly mesh: THREE.SkinnedMesh;
    /** Generated outline proxy meshes. Empty when outline is false. */
    readonly outlineMeshes: readonly THREE.SkinnedMesh[];
    /** Generated render-order proxy meshes. Empty when materialRenderOrder is false. */
    readonly renderOrderMeshes: readonly THREE.SkinnedMesh[];
    /** Runtime bound to this model. */
    readonly runtime: MmdRuntime;
    readonly source: ThreeMmdModelSourceDescriptor;
    /** Structured diagnostics grouped by subsystem. */
    readonly diagnostics: {
        readonly core: ThreeMmdCoreDiagnostic;
        readonly source: ModelSourceDiagnostic;
        readonly textures: readonly TextureLoadDiagnostic[];
        readonly materials: readonly MaterialTransparencyDiagnostic[];
        readonly performance: readonly LoaderPerformanceMeasure[];
    };
    /**
     * @deprecated Use diagnostics.textures instead. This alias will be removed in
     * the next breaking release.
     */
    readonly textureDiagnostics: readonly TextureLoadDiagnostic[];
    /** Binds a VMD/VPD animation to this model's mesh. */
    setAnimation(animation: MmdAnimation | ThreeMmdAnimation): void;
    /**
     * Evaluates the bound animation and syncs this model's root for rendering.
     *
     * The returned state is volatile and may be reused by later updates to keep
     * per-frame evaluation allocation-free. Use runtime.frameState() when you
     * need to retain a stable snapshot.
     */
    update(seconds: number, options?: MmdRuntimeEvaluateOptions): MmdFrameState;
    /** Evaluates and applies an exact frame before resolving. */
    updateAsync(seconds: number, options?: MmdRuntimeAsyncEvaluateOptions): Promise<MmdFrameState>;
}
export type ThreeMmdCoreDiagnostic = {
    readonly kind: "provided";
} | {
    readonly kind: "wasm";
} | {
    readonly kind: "fallback";
    readonly operation: ThreeMmdCoreFallbackEvent["operation"];
    readonly reason: string;
};
export interface ThreeMmdAnimation {
    readonly source: ModelSource;
    readonly name?: string;
    readonly animation: MmdAnimation;
}
export interface ThreeMmdPose {
    readonly source: ModelSource;
    readonly pose: MmdPose;
}
export declare class ThreeMmdLoader {
    readonly options: ThreeMmdLoaderOptions;
    private readonly textureCache;
    private corePromise;
    private fallbackCore;
    private readonly useExplicitCore;
    private coreDiagnostic;
    private implicitMmdAnimWasmReady;
    constructor(options?: ThreeMmdLoaderOptions);
    loadModel(source: ModelSource, options?: ThreeMmdLoadModelOptions): Promise<ThreeMmdModel>;
    private createRuntime;
    private canCreateImplicitMmdAnimRuntime;
    private getCore;
    private initCoreWithObservableFallback;
    private loadCoreModel;
    private loadCoreVmd;
    private recordSuccessfulCoreUse;
    private createSuccessfulCoreDiagnostic;
    loadAnimation(source: ModelSource): Promise<ThreeMmdAnimation>;
    createCameraTrack(animation: MmdAnimation | ThreeMmdAnimation): MmdAnimRuntimeWasmCameraTrack | undefined;
    createLightTrack(animation: MmdAnimation | ThreeMmdAnimation): MmdAnimRuntimeWasmLightTrack | undefined;
    loadPose(source: ModelSource): Promise<ThreeMmdPose>;
    loadPoseAnimation(source: ModelSource, name?: string): Promise<ThreeMmdAnimation>;
}
