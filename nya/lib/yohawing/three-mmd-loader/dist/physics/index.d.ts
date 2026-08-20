export { createCustomBulletMmdPhysicsBackend, customBulletMmdScriptPath, loadCustomBulletMmdModule, resolveCustomBulletMmdScriptUrl, type CustomBulletMmdLoaderOptions, type CustomBulletMmdPhysicsBackend, type CustomBulletMmdPhysicsBackendOptions, type CustomBulletMmdModule } from "./customBulletMmd.js";
export type { MmdAnimBulletContactPoint } from "./mmdAnimBullet.js";
export type MmdPhysicsDiagnosticLevel = "warning" | "error";
export interface MmdPhysicsDiagnostic {
    readonly level: MmdPhysicsDiagnosticLevel;
    readonly code: string;
    readonly message: string;
}
export type MmdPhysicsVector3Tuple = readonly [x: number, y: number, z: number];
export type MmdPhysicsQuaternionTuple = readonly [x: number, y: number, z: number, w: number];
export type MmdPhysicsEulerTuple = readonly [x: number, y: number, z: number];
export type MmdPhysicsMatrix4ColumnMajorTuple = readonly [
    n11: number,
    n21: number,
    n31: number,
    n41: number,
    n12: number,
    n22: number,
    n32: number,
    n42: number,
    n13: number,
    n23: number,
    n33: number,
    n43: number,
    n14: number,
    n24: number,
    n34: number,
    n44: number
];
export type MmdPhysicsNumericBuffer = readonly number[] | Float32Array | Float64Array;
export type MmdPhysicsMutableNumericBuffer = number[] | Float32Array | Float64Array;
export interface MmdPhysicsSkeletonBone {
    readonly index: number;
    readonly name?: string;
    readonly parentIndex?: number;
    readonly restTranslation?: MmdPhysicsVector3Tuple;
    readonly restRotation?: MmdPhysicsQuaternionTuple;
    readonly transformAfterPhysics?: boolean;
}
export interface MmdPhysicsSkeleton {
    readonly bones: readonly MmdPhysicsSkeletonBone[];
}
export type MmdPhysicsRigidBodyShapeType = "sphere" | "box" | "capsule";
export type MmdPhysicsRigidBodyMotionType = "static" | "dynamic" | "dynamicWithBone";
export interface MmdPhysicsRigidBodyShape {
    readonly type: MmdPhysicsRigidBodyShapeType;
    readonly size: MmdPhysicsVector3Tuple;
}
export interface MmdPhysicsRigidBody {
    readonly index: number;
    readonly name?: string;
    readonly boneIndex?: number;
    readonly motionType: MmdPhysicsRigidBodyMotionType;
    readonly shape: MmdPhysicsRigidBodyShape;
    readonly localTranslation?: MmdPhysicsVector3Tuple;
    readonly localRotation?: MmdPhysicsQuaternionTuple;
    readonly mass?: number;
    readonly linearDamping?: number;
    readonly angularDamping?: number;
    readonly restitution?: number;
    readonly friction?: number;
    readonly collisionGroup?: number;
    readonly collisionMask?: number;
}
export interface MmdPhysicsJointLimit {
    readonly lower: MmdPhysicsVector3Tuple;
    readonly upper: MmdPhysicsVector3Tuple;
}
export interface MmdPhysicsJointSpring {
    readonly linear?: MmdPhysicsVector3Tuple;
    readonly angular?: MmdPhysicsVector3Tuple;
}
export interface MmdPhysicsJoint {
    readonly index: number;
    readonly name?: string;
    readonly rigidBodyIndexA: number;
    readonly rigidBodyIndexB: number;
    readonly translation?: MmdPhysicsVector3Tuple;
    readonly rotation?: MmdPhysicsQuaternionTuple;
    readonly linearLimit?: MmdPhysicsJointLimit;
    readonly angularLimit?: MmdPhysicsJointLimit;
    readonly spring?: MmdPhysicsJointSpring;
}
export interface MmdPhysicsMorphImpulse {
    readonly morphIndex: number;
    readonly weight: number;
    readonly rigidBodyIndex?: number;
    readonly local?: boolean;
    readonly force?: MmdPhysicsVector3Tuple;
    readonly torque?: MmdPhysicsVector3Tuple;
}
export interface MmdPhysicsRigidBodyTransform {
    readonly rigidBodyIndex: number;
    readonly translation: MmdPhysicsVector3Tuple;
    readonly rotation: MmdPhysicsQuaternionTuple;
    readonly worldMatrixColumnMajor?: MmdPhysicsMatrix4ColumnMajorTuple;
}
export interface MmdPhysicsContact {
    readonly rigidBodyIndexA: number;
    readonly rigidBodyIndexB: number;
    readonly position?: MmdPhysicsVector3Tuple;
    readonly normal?: MmdPhysicsVector3Tuple;
    readonly distance?: number;
    readonly impulse?: number;
}
export interface MmdPhysicsDebugSnapshot {
    readonly rigidBodyTransforms?: readonly MmdPhysicsRigidBodyTransform[];
    readonly contacts?: readonly MmdPhysicsContact[];
}
export type MmdPhysicsDebugSnapshotNonFiniteMode = "throw" | "diagnostic";
export interface MmdPhysicsDebugSnapshotNormalizationOptions {
    readonly nonFinite?: MmdPhysicsDebugSnapshotNonFiniteMode;
}
export interface MmdPhysicsDebugSnapshotNormalizationResult {
    readonly snapshot: MmdPhysicsDebugSnapshot;
    readonly diagnostics: readonly MmdPhysicsDiagnostic[];
}
export interface MmdPhysicsDebugHooks {
    readonly captureRigidBodyTransforms?: boolean;
    readonly captureContacts?: boolean;
    onRigidBodyTransform?(transform: MmdPhysicsRigidBodyTransform): void;
    onContact?(contact: MmdPhysicsContact): void;
    onStepDebug?(snapshot: MmdPhysicsDebugSnapshot): void;
}
export interface MmdPhysicsOutputBuffers {
    readonly translations?: MmdPhysicsMutableNumericBuffer;
    readonly rotations?: MmdPhysicsMutableNumericBuffer;
    readonly worldMatricesColumnMajor?: MmdPhysicsMutableNumericBuffer;
    readonly updatedBoneIndices?: MmdPhysicsMutableIndexBuffer;
}
export type MmdPhysicsMutableIndexBuffer = number[] | Uint32Array<ArrayBuffer>;
export interface MmdPhysicsStepContext {
    readonly seconds: number;
    readonly deltaSeconds: number;
    readonly frame: number;
    readonly frameRate: number;
    readonly seeking?: boolean;
    readonly skeleton?: MmdPhysicsSkeleton;
    readonly rigidBodies?: readonly MmdPhysicsRigidBody[];
    readonly joints?: readonly MmdPhysicsJoint[];
    readonly inputTranslations?: MmdPhysicsNumericBuffer;
    readonly inputRotations?: MmdPhysicsNumericBuffer;
    readonly inputWorldMatricesColumnMajor?: MmdPhysicsNumericBuffer;
    readonly output?: MmdPhysicsOutputBuffers;
    readonly bonePhysicsToggles?: readonly boolean[] | Uint8Array;
    readonly morphImpulses?: readonly MmdPhysicsMorphImpulse[];
    readonly debug?: MmdPhysicsDebugHooks;
}
export interface MmdPhysicsStepContextSummary {
    readonly boneCount: number;
    readonly rigidBodyCount: number;
    readonly jointCount: number;
    readonly morphImpulseCount: number;
    readonly hasInputTranslations: boolean;
    readonly hasInputRotations: boolean;
    readonly hasInputWorldMatricesColumnMajor: boolean;
    readonly hasOutputTranslations: boolean;
    readonly hasOutputRotations: boolean;
    readonly hasOutputWorldMatricesColumnMajor: boolean;
    readonly hasBonePhysicsToggles: boolean;
}
export interface MmdPhysicsStepContextValidationResult {
    readonly valid: boolean;
    readonly summary: MmdPhysicsStepContextSummary;
    readonly diagnostics: readonly MmdPhysicsDiagnostic[];
}
export interface MmdPhysicsStepContextValidationOptions {
    readonly requireConcreteBackendFields?: boolean;
}
export interface MmdPhysicsResetContext {
    readonly seconds: number;
    readonly frame: number;
    readonly frameRate: number;
}
export interface MmdPhysicsStepResult {
    readonly simulated: boolean;
    readonly updatedBoneCount?: number;
    readonly diagnostics?: readonly MmdPhysicsDiagnostic[];
    readonly debug?: MmdPhysicsDebugSnapshot;
}
export interface MmdPhysicsStepBufferLayout {
    readonly boneCount: number;
    readonly translationValueCount: number;
    readonly rotationValueCount: number;
    readonly worldMatrixValueCount: number;
}
export interface MmdPhysicsStepBuffers {
    readonly inputTranslations: Float32Array<ArrayBuffer>;
    readonly inputRotations: Float32Array<ArrayBuffer>;
    readonly inputWorldMatricesColumnMajor: Float32Array<ArrayBuffer>;
    readonly outputTranslations: Float32Array<ArrayBuffer>;
    readonly outputRotations: Float32Array<ArrayBuffer>;
    readonly outputWorldMatricesColumnMajor: Float32Array<ArrayBuffer>;
    readonly bonePhysicsToggles: Uint8Array<ArrayBuffer>;
    readonly updatedBoneIndices?: MmdPhysicsMutableIndexBuffer;
}
export interface MmdPhysicsBackend {
    readonly name: string;
    readonly disabled: boolean;
    readonly disposed: boolean;
    step(context: MmdPhysicsStepContext): MmdPhysicsStepResult;
    reset?(context?: MmdPhysicsResetContext): void;
    dispose?(): void;
    diagnostics?(): readonly MmdPhysicsDiagnostic[];
    debugRigidBodyWorldTransformsColumnMajor?(): readonly MmdPhysicsMatrix4ColumnMajorTuple[];
}
export interface MmdDirectBufferPhysicsBackend extends MmdPhysicsBackend {
    acquireStepBuffers(layout: MmdPhysicsStepBufferLayout): MmdPhysicsStepBuffers | undefined;
}
export interface DisabledMmdPhysicsBackendOptions {
    readonly name?: string;
    readonly reason?: string;
}
export declare class DisabledMmdPhysicsBackend implements MmdPhysicsBackend {
    readonly disabled = true;
    readonly name: string;
    private readonly diagnostic;
    private disposedState;
    constructor(options?: DisabledMmdPhysicsBackendOptions);
    get disposed(): boolean;
    step(_context: MmdPhysicsStepContext): MmdPhysicsStepResult;
    reset(_context?: MmdPhysicsResetContext): void;
    dispose(): void;
    diagnostics(): readonly MmdPhysicsDiagnostic[];
}
export declare function createDisabledMmdPhysicsBackend(options?: DisabledMmdPhysicsBackendOptions): MmdPhysicsBackend;
export declare function summarizeMmdPhysicsStepContext(context: MmdPhysicsStepContext): MmdPhysicsStepContextSummary;
export declare function validateMmdPhysicsStepContext(context: MmdPhysicsStepContext, options?: MmdPhysicsStepContextValidationOptions): MmdPhysicsStepContextValidationResult;
export declare function validateConcreteMmdPhysicsStepContext(context: MmdPhysicsStepContext): MmdPhysicsStepContextValidationResult;
export declare function normalizeMmdPhysicsDebugSnapshot(snapshot: MmdPhysicsDebugSnapshot, options?: MmdPhysicsDebugSnapshotNormalizationOptions): MmdPhysicsDebugSnapshotNormalizationResult;
