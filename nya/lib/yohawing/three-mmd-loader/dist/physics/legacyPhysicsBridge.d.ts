import type { MmdPhysicsJoint, MmdPhysicsMutableNumericBuffer, MmdPhysicsQuaternionTuple, MmdPhysicsRigidBody, MmdPhysicsRigidBodyMotionType, MmdPhysicsRigidBodyShapeType, MmdPhysicsVector3Tuple } from "./index.js";
export interface LegacyMmdPhysicsRigidBodyLike {
    readonly name?: string;
    readonly englishName?: string;
    readonly boneIndex: number;
    readonly group: number;
    readonly mask: number;
    readonly shape: "sphere" | "box" | "capsule" | "unknown";
    readonly size: MmdPhysicsVector3Tuple;
    readonly position: MmdPhysicsVector3Tuple;
    readonly rotation: MmdPhysicsVector3Tuple;
    readonly mass: number;
    readonly linearDamping: number;
    readonly angularDamping: number;
    readonly restitution: number;
    readonly friction: number;
    readonly mode: "static" | "dynamic" | "dynamicBone" | "unknown";
}
export interface LegacyMmdPhysicsJointLike {
    readonly name?: string;
    readonly englishName?: string;
    readonly rigidBodyIndexA: number;
    readonly rigidBodyIndexB: number;
    readonly position: MmdPhysicsVector3Tuple;
    readonly rotation: MmdPhysicsVector3Tuple;
    readonly translationLowerLimit: MmdPhysicsVector3Tuple;
    readonly translationUpperLimit: MmdPhysicsVector3Tuple;
    readonly rotationLowerLimit: MmdPhysicsVector3Tuple;
    readonly rotationUpperLimit: MmdPhysicsVector3Tuple;
    readonly springTranslationFactor: MmdPhysicsVector3Tuple;
    readonly springRotationFactor: MmdPhysicsVector3Tuple;
}
export interface LegacyMmdPhysicsBoneLike {
    readonly name?: string;
    readonly englishName?: string;
}
export declare function legacyMmdRigidBodyModeToPhysicsMotionType(mode: LegacyMmdPhysicsRigidBodyLike["mode"]): MmdPhysicsRigidBodyMotionType;
export declare function legacyMmdRigidBodyShapeToPhysicsShapeType(shape: LegacyMmdPhysicsRigidBodyLike["shape"]): MmdPhysicsRigidBodyShapeType;
export declare function legacyMmdEulerToQuaternion(euler: MmdPhysicsVector3Tuple): MmdPhysicsQuaternionTuple;
export declare function mapLegacyMmdRigidBodyToPhysicsRigidBody(rigidBody: LegacyMmdPhysicsRigidBodyLike, index: number): MmdPhysicsRigidBody;
export declare function mapLegacyMmdJointToPhysicsJoint(joint: LegacyMmdPhysicsJointLike, index: number): MmdPhysicsJoint;
export declare function writeTuple3ArrayToBuffer(tuples: readonly MmdPhysicsVector3Tuple[], buffer: MmdPhysicsMutableNumericBuffer): void;
export declare function writeQuaternionArrayToBuffer(tuples: readonly MmdPhysicsQuaternionTuple[], buffer: MmdPhysicsMutableNumericBuffer): void;
export declare function createBonePhysicsToggleBuffer(bones: readonly LegacyMmdPhysicsBoneLike[], toggles: Readonly<Record<string, number | boolean | undefined>>): Uint8Array;
export declare function writeBonePhysicsToggleBuffer(bones: readonly LegacyMmdPhysicsBoneLike[], toggles: Readonly<Record<string, number | boolean | undefined>>, buffer: Uint8Array): Uint8Array;
