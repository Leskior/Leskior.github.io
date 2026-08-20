import * as THREE from "three";
import type { CameraState, LightState, MmdAnimation } from "../parser/model/modelTypes.js";
import type { DefaultMmdRuntimeOptions, MmdFrameState, MmdRuntime, MmdRuntimeDebugState, MmdRuntimeEvaluateOptions, MmdRuntimeTickOptions } from "./types.js";
export declare class DefaultMmdRuntime implements MmdRuntime {
    private readonly frameRate;
    private readonly ikSolver;
    private mesh;
    private mmdAnimation;
    private restTransforms;
    private preAppendTransforms;
    private physicsSimulation;
    private externalPhysicsData;
    private bonePhysicsToggles;
    private debugStages;
    private readonly state;
    private readonly evaluateReturnState;
    private readonly physicsMode;
    private readonly physicsBackend;
    private previousEvaluateSeconds;
    private physicsDisabled;
    private preparedIkChains;
    private readonly activeIkChains;
    private currentIkPropertyFrame;
    private currentIkPropertyFrameIndex;
    private readonly disabledIkBoneNames;
    private readonly scratchAppendTranslations;
    private readonly scratchAppendRotations;
    private cachedAppendTransformOrder;
    private readonly scratchReapplyChangedAppendBoneIndices;
    private readonly scratchReappliedAppendBoneIndices;
    private readonly scratchReapplyAppendTranslations;
    private readonly scratchReapplyAppendRotations;
    private readonly scratchVector3A;
    private readonly scratchQuaternionA;
    private readonly scratchAnimation;
    private readonly scratchIk;
    private readonly scratchSingleIkChain;
    private readonly scratchChangedIkBoneIndices;
    private readonly scratchCameraState;
    private readonly scratchCameraFrameHint;
    private readonly scratchLightState;
    private readonly scratchStatefulSpringTranslations;
    private readonly scratchExternalPhysicsInput;
    private readonly scratchPrePhysics;
    constructor(options?: DefaultMmdRuntimeOptions);
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
    /**
     * @deprecated Prefer seek / resetPose / clearAnimation for finer control.
     */
    reset(seconds?: number): MmdFrameState;
    setAnimation(animation: MmdAnimation, mesh: THREE.SkinnedMesh): void;
    private prepareAnimationTarget;
    frameState(): MmdFrameState;
    debugState(): MmdRuntimeDebugState;
    debugRigidBodyWorldTransformsColumnMajor(): readonly (readonly number[])[];
    private restoreRestTransforms;
    private syncPreAppendTransformsToCurrentPose;
    private solveIk;
    private currentEnabledIkChains;
    private rebuildActiveIkChains;
    private isIkChainEnabled;
    private hasHandTwistIkChain;
    private applyCurrentMmdAnimation;
    private updateCurrentIkStates;
    private sampleCurrentPropertyFrame;
    private applyCurrentAppendTransforms;
    private reapplyCurrentAppendTransformsForSources;
    private stepStatefulSpringPhysics;
    private stepExternalPhysics;
    private resetPhysicsState;
    private captureDebugStage;
}
