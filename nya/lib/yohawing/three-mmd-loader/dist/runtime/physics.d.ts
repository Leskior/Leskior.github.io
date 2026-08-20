import * as THREE from "three";
import type { MmdPhysicsBackend, MmdPhysicsStepContext } from "../physics/index.js";
import type { MmdFrameState, MmdRuntimeDebugStageState, MmdRuntimeDebugState, RuntimeExternalPhysicsData, RuntimePhysicsData } from "./types.js";
declare class StatefulSpringPhysicsSimulation {
    private readonly data;
    private readonly offsets;
    private readonly velocities;
    private previousSeconds;
    constructor(data: RuntimePhysicsData);
    step(translations: Array<[number, number, number]>, seconds: number, bonePhysicsToggles: Record<string, number>): void;
    reset(seconds?: number): void;
    private integrateDynamicBodies;
    private solveJointSprings;
    private applyOffsets;
    private resetBodyOffset;
}
declare function readRuntimePhysics(mesh: THREE.SkinnedMesh): RuntimePhysicsData;
declare function readRuntimeExternalPhysics(mesh: THREE.SkinnedMesh): RuntimeExternalPhysicsData;
declare function captureRuntimeDebugStage(mesh: THREE.SkinnedMesh): MmdRuntimeDebugStageState;
declare function captureRuntimeDebugStageInto(mesh: THREE.SkinnedMesh, target: MmdRuntimeDebugStageState): MmdRuntimeDebugStageState;
declare function extractMmdWorldMatrices(mesh: THREE.SkinnedMesh): number[];
declare function extractMmdWorldMatricesInto(mesh: THREE.SkinnedMesh, matrices: number[]): number[];
declare function createEmptyDebugStage(): MmdRuntimeDebugStageState;
declare function createEmptyDebugStages(): MmdRuntimeDebugState["stages"];
declare function cloneDebugStage(stage: MmdRuntimeDebugStageState): MmdRuntimeDebugStageState;
declare function createPhysicsResetContext(state: MmdFrameState): NonNullable<Parameters<NonNullable<MmdPhysicsBackend["reset"]>>[0]>;
interface PrePhysicsInputBuffers {
    readonly translations: Float32Array;
    readonly rotations: Float32Array;
    readonly worldMatricesColumnMajor: Float32Array;
}
interface PrePhysicsScratch {
    preTranslations: Float32Array;
    preRotations: Float32Array;
    preWorldMatricesColumnMajor: Float32Array;
    readonly composeWorldPositions: THREE.Vector3[];
    readonly composeWorldRotations: THREE.Quaternion[];
    readonly composeMatrix: THREE.Matrix4;
    readonly composeUnitScale: THREE.Vector3;
    readonly mergeTargetRotation: THREE.Quaternion;
    readonly mergePreRotation: THREE.Quaternion;
    readonly mergePhysicsRotation: THREE.Quaternion;
    readonly localPosition: THREE.Vector3;
    readonly localRotation: THREE.Quaternion;
}
declare function createPrePhysicsInputBuffersIfNeeded(skeleton: NonNullable<MmdPhysicsStepContext["skeleton"]>, translations: Float32Array, rotations: Float32Array, fallbackWorldMatricesColumnMajor: Float32Array, scratch: PrePhysicsScratch): PrePhysicsInputBuffers | undefined;
declare function mergePhysicsOutputDeltas(context: MmdPhysicsStepContext, targetTranslations: Float32Array, targetRotations: Float32Array, prePhysics: PrePhysicsInputBuffers, scratch: PrePhysicsScratch): void;
declare function applyPhysicsOutputToSkeleton(mesh: THREE.SkinnedMesh, context: MmdPhysicsStepContext, updatedBoneCount?: number): void;
export { StatefulSpringPhysicsSimulation, applyPhysicsOutputToSkeleton, captureRuntimeDebugStage, captureRuntimeDebugStageInto, cloneDebugStage, createEmptyDebugStage, createEmptyDebugStages, createPhysicsResetContext, createPrePhysicsInputBuffersIfNeeded, extractMmdWorldMatrices, extractMmdWorldMatricesInto, mergePhysicsOutputDeltas, readRuntimeExternalPhysics, readRuntimePhysics };
export type { PrePhysicsScratch };
