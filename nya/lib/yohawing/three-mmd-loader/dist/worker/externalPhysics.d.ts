import { type CustomBulletMmdPhysicsBackendOptions } from "../physics/customBulletMmd.js";
import type { MmdPhysicsBackend } from "../physics/index.js";
/** Structured-clone-safe configuration sent to a runtime worker. */
export interface CustomBulletWorkerPhysicsConfig {
    readonly kind: "custom-bullet-mmd";
    readonly moduleUrl?: string;
    readonly wasmUrl?: string;
    readonly options?: CustomBulletMmdPhysicsBackendOptions;
}
/**
 * Creates Custom Bullet inside the worker that calls this function.
 * The caller owns the returned backend and must call `dispose()` when its runtime is replaced or disposed.
 */
export declare function createWorkerExternalPhysicsBackend(config: CustomBulletWorkerPhysicsConfig, baseUrl?: string): Promise<MmdPhysicsBackend>;
