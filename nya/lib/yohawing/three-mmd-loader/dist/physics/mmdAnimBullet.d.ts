import type { MmdPhysicsBackend } from "./index.js";
export interface MmdAnimBulletModule {
    readonly HEAPF32?: Float32Array;
    readonly HEAPU8?: Uint8Array;
    readonly HEAPU32?: Uint32Array;
    _malloc(size: number): number;
    _free(pointer: number): void;
    _mmd_anim_bullet_world_create(outWorld: number): number;
    _mmd_anim_bullet_world_destroy(world: number): void;
    _mmd_anim_bullet_world_reset(world: number): number;
    _mmd_anim_bullet_world_settle_to_current(world: number): number;
    _mmd_anim_bullet_world_step(world: number, delta: number, maxSubSteps: number, fixed: number): number;
    _mmd_anim_bullet_world_add_rigidbody(world: number, descriptor: number, outIndex: number): number;
    _mmd_anim_bullet_world_get_rigidbody_transform(world: number, index: number, position: number, rotation: number): number;
    _mmd_anim_bullet_world_set_rigidbody_transform(world: number, index: number, position: number, rotation: number): number;
    _mmd_anim_bullet_world_add_6dof_spring_joint(world: number, descriptor: number, outIndex: number): number;
    _mmd_anim_bullet_world_collect_contacts?(world: number, outContacts: number, capacity: number, outCount: number): number;
    _mmd_anim_bullet_world_get_rigidbody_count?(world: number): number;
    _mmd_anim_bullet_world_get_constraint_count?(world: number): number;
    refreshMemoryViews?(): void;
}
export interface MmdAnimBulletContactPoint {
    readonly rigidBodyIndexA: number;
    readonly rigidBodyIndexB: number;
    readonly distance: number;
    readonly positionWorldOnA: readonly [number, number, number];
    readonly positionWorldOnB: readonly [number, number, number];
    readonly normalWorldOnB: readonly [number, number, number];
}
export interface MmdAnimBulletPhysicsBackend extends MmdPhysicsBackend {
    debugContactCount(): number;
    debugPhysicsContacts(): readonly MmdAnimBulletContactPoint[];
}
export declare function createMmdAnimBulletPhysicsBackend(module: MmdAnimBulletModule, options?: {
    fixedTimeStep?: number;
    maxSubSteps?: number;
}): MmdAnimBulletPhysicsBackend;
