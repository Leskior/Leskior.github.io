import type { MmdDirectBufferPhysicsBackend } from "./index.js";
import { type MmdAnimBulletContactPoint, type MmdAnimBulletModule } from "./mmdAnimBullet.js";
export declare const customBulletMmdScriptPath = "./mmd/mmd_bullet.js";
export interface CustomBulletMmdLoaderOptions {
    readonly baseUrl?: string;
    readonly scriptUrl?: string;
    readonly timeoutMs?: number;
}
export interface CustomBulletMmdPhysicsBackendOptions {
    readonly fixedTimeStep?: number;
    readonly maxSubSteps?: number;
}
/** mmd-anim Bullet module exposed through the stable Custom Bullet API name. */
export type CustomBulletMmdModule = MmdAnimBulletModule;
export interface CustomBulletMmdPhysicsBackend extends MmdDirectBufferPhysicsBackend {
    debugContactCount(): number;
    debugPhysicsContacts(): readonly MmdAnimBulletContactPoint[];
}
export declare function resolveCustomBulletMmdScriptUrl(baseUrl?: string): string;
export declare function loadCustomBulletMmdModule(options?: CustomBulletMmdLoaderOptions): Promise<CustomBulletMmdModule>;
export declare function createCustomBulletMmdPhysicsBackend(module: CustomBulletMmdModule, options?: CustomBulletMmdPhysicsBackendOptions): CustomBulletMmdPhysicsBackend;
