import * as THREE from "three";
import type { CameraState, LightState, MmdAnimation } from "../parser/model/modelTypes.js";
import type { MmdPhysicsBackend } from "../physics/index.js";
import type { MmdFrameState, MmdRuntime, MmdRuntimeDebugState, MmdRuntimeEvaluateOptions, MmdRuntimeTickOptions } from "./types.js";
export interface MmdAnimRuntimeWasmModel {
    boneCount(): number;
    morphCount?(): number;
    ikCount?(): number;
    free?(): void;
}
export interface MmdAnimRuntimeWasmClip {
    free?(): void;
}
export interface MmdAnimRuntimeWasmCameraTrack {
    frameCount(): number;
    sample(frame: number, out: Float32Array): boolean;
    free?(): void;
}
export interface MmdAnimRuntimeWasmLightTrack {
    frameCount(): number;
    sample(frame: number, out: Float32Array): boolean;
    free?(): void;
}
export interface MmdAnimRuntimeWasmRuntimeInstance {
    evaluateRestPose(): void;
    evaluateClipFrame(clip: MmdAnimRuntimeWasmClip, frame: number): void;
    evaluateClipFrameWithIkOptions?(clip: MmdAnimRuntimeWasmClip, frame: number, ikTolerance: number, ikMaxIterationsCap: number): void;
    worldMatrixF32Len(): number;
    copyWorldMatrices(out: Float32Array): boolean;
    worldMatricesView?(): Float32Array;
    morphWeightLen?(): number;
    copyMorphWeights?(out: Float32Array): boolean;
    morphWeightsView?(): Float32Array;
    free?(): void;
}
export interface MmdAnimRuntimeWasmModule {
    parseMmdFormatJson?(data: Uint8Array, fileName?: string | null): string;
    exportMmdFormatBytes?(data: Uint8Array, fileName?: string | null): Uint8Array;
    exportVmdAnimationJsonBytes?(json: string): Uint8Array;
    exportVpdPoseJsonBytes?(json: string): Uint8Array;
    readonly WasmMmdModel?: {
        fromPmxBytes?(bytes: Uint8Array): MmdAnimRuntimeWasmModel;
    };
    readonly WasmMmdClip?: {
        fromVmdBytesForModel?(model: MmdAnimRuntimeWasmModel, bytes: Uint8Array): MmdAnimRuntimeWasmClip;
    };
    readonly WasmVmdCameraTrack?: {
        fromVmdBytes?(bytes: Uint8Array): MmdAnimRuntimeWasmCameraTrack;
    };
    readonly WasmVmdLightTrack?: {
        fromVmdBytes?(bytes: Uint8Array): MmdAnimRuntimeWasmLightTrack;
    };
    readonly WasmMmdRuntimeInstance: {
        forModel?(model: MmdAnimRuntimeWasmModel): MmdAnimRuntimeWasmRuntimeInstance;
        new (model: MmdAnimRuntimeWasmModel, morphCount: number): MmdAnimRuntimeWasmRuntimeInstance;
    };
}
export interface MmdAnimRuntimeOptions {
    /** mmd-anim WASM module namespace. */
    readonly wasm?: MmdAnimRuntimeWasmModule;
    /** Prebuilt mmd-anim model. If omitted, wasm.WasmMmdModel.fromPmxBytes and pmxBytes are required. */
    readonly model?: MmdAnimRuntimeWasmModel;
    /** PMX bytes used to create a wasm model when model is omitted. */
    readonly pmxBytes?: Uint8Array;
    /** Optional prebuilt clip. setAnimation replaces this with a VMD-derived clip when possible. */
    readonly clip?: MmdAnimRuntimeWasmClip;
    /** MMD timeline frame rate. Defaults to 30. */
    readonly frameRate?: number;
    /** Initial runtime time in seconds. Defaults to 0. */
    readonly initialSeconds?: number;
    /** Physics integration mode. Defaults to "none". */
    readonly physics?: "none" | "external";
    /** External physics backend used when physics is "external". */
    readonly physicsBackend?: MmdPhysicsBackend;
    /** Optional IK solve tolerance override for mmd-anim WASM. Uses the wasm default when omitted. */
    readonly ikTolerance?: number;
    /** Optional IK max-iteration cap override for mmd-anim WASM. Uses the wasm default when omitted. */
    readonly ikMaxIterationsCap?: number;
    /** Own and free the wasm model/runtime/created clips on dispose. Defaults to true. */
    readonly ownsWasmResources?: boolean;
}
export declare function parseMmdAnimWasmFormatJson(wasm: Pick<MmdAnimRuntimeWasmModule, "parseMmdFormatJson">, data: Uint8Array, fileName?: string | null): unknown;
export declare function exportMmdAnimWasmFormatBytes(wasm: Pick<MmdAnimRuntimeWasmModule, "exportMmdFormatBytes">, data: Uint8Array, fileName?: string | null): Uint8Array;
export declare function exportMmdAnimWasmVmdAnimationJsonBytes(wasm: Pick<MmdAnimRuntimeWasmModule, "exportVmdAnimationJsonBytes">, json: string): Uint8Array;
export declare function exportMmdAnimWasmVpdPoseJsonBytes(wasm: Pick<MmdAnimRuntimeWasmModule, "exportVpdPoseJsonBytes">, json: string): Uint8Array;
export declare function createMmdAnimWasmCameraTrack(wasm: Pick<MmdAnimRuntimeWasmModule, "WasmVmdCameraTrack">, bytes: Uint8Array): MmdAnimRuntimeWasmCameraTrack | undefined;
export declare function createMmdAnimWasmLightTrack(wasm: Pick<MmdAnimRuntimeWasmModule, "WasmVmdLightTrack">, bytes: Uint8Array): MmdAnimRuntimeWasmLightTrack | undefined;
export declare function sampleMmdAnimWasmCameraTrackInto(track: MmdAnimRuntimeWasmCameraTrack, frame: number, scratch: Float32Array, target: CameraState): CameraState;
export declare function sampleMmdAnimWasmLightTrackInto(track: MmdAnimRuntimeWasmLightTrack, frame: number, scratch: Float32Array, target: LightState): LightState;
/**
 * Experimental runtime adapter for the mmd-anim WASM evaluator.
 *
 * The adapter intentionally accepts structural wasm types instead of importing
 * a package name, so local harness builds and future published artifacts can be
 * tested without changing this package's dependency graph.
 */
export declare class MmdAnimRuntime implements MmdRuntime {
    private readonly frameRate;
    private readonly wasm;
    private readonly wasmModel;
    private readonly wasmRuntime;
    private readonly ownsWasmResources;
    private readonly physicsMode;
    private readonly physicsBackend;
    private readonly ikTolerance;
    private readonly ikMaxIterationsCap;
    private readonly state;
    private readonly evaluateReturnState;
    private worldMatrices;
    private morphWeights;
    private readonly debugStages;
    private readonly scratchWorldMatrices;
    private readonly scratchThreeWorldMatrix;
    private readonly scratchLocalMatrix;
    private readonly scratchParentInverseMatrix;
    private readonly scratchParentBoneIndices;
    private readonly scratchCameraState;
    private readonly scratchCameraSample;
    private readonly scratchCameraFrameHint;
    private readonly scratchLightState;
    private readonly scratchLightSample;
    private readonly scratchExternalPhysicsInput;
    private readonly scratchPrePhysics;
    private wasmClip;
    private wasmCameraTrack;
    private wasmLightTrack;
    private ownsWasmClip;
    private mesh;
    private mmdAnimation;
    private parsedTrackRuntime;
    private externalPhysicsData;
    private previousEvaluateSeconds;
    private physicsDisabled;
    private _restPoseDirty;
    constructor(options: MmdAnimRuntimeOptions);
    static fromPmxBytes(wasm: MmdAnimRuntimeWasmModule, pmxBytes: Uint8Array, options?: Omit<MmdAnimRuntimeOptions, "wasm" | "pmxBytes" | "model">): MmdAnimRuntime;
    evaluate(seconds: number, options?: MmdRuntimeEvaluateOptions): MmdFrameState;
    tick(seconds: number, options?: MmdRuntimeTickOptions): MmdFrameState;
    /**
     * @deprecated Use tick(seconds, { mesh, ...options }) instead.
     */
    tick(seconds: number, mesh: THREE.Object3D | null | undefined, options?: MmdRuntimeEvaluateOptions): MmdFrameState;
    seek(seconds: number): MmdFrameState;
    resetPose(): void;
    clearAnimation(): void;
    cameraState(): CameraState | undefined;
    lightState(): LightState | undefined;
    reset(seconds?: number): MmdFrameState;
    setAnimation(animation: MmdAnimation, mesh: THREE.SkinnedMesh): void;
    frameState(): MmdFrameState;
    debugState(): MmdRuntimeDebugState;
    debugRigidBodyWorldTransformsColumnMajor(): readonly (readonly number[])[];
    dispose(): void;
    private copyWasmOutput;
    private evaluateWasmClipFrame;
    private syncBoundMesh;
    private captureDebugStage;
    private capturePhysicsDebugStage;
    private stepExternalPhysics;
    private resetPhysicsState;
    private releaseOwnedClip;
    private releaseCameraTrack;
    private releaseLightTrack;
}
