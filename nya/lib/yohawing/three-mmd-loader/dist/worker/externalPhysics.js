import { createCustomBulletMmdPhysicsBackend } from "../physics/customBulletMmd.js";
const customBulletWorkerModulePath = "../physics/mmd/mmd_bullet.worker.mjs";
/**
 * Creates Custom Bullet inside the worker that calls this function.
 * The caller owns the returned backend and must call `dispose()` when its runtime is replaced or disposed.
 */
export async function createWorkerExternalPhysicsBackend(config, baseUrl = import.meta.url) {
    if (config.kind !== "custom-bullet-mmd") {
        throw new Error(`Unsupported worker external physics backend: ${String(config.kind)}`);
    }
    const moduleUrl = new URL(config.moduleUrl ?? customBulletWorkerModulePath, baseUrl).href;
    const wasmUrl = config.wasmUrl
        ? new URL(config.wasmUrl, baseUrl).href
        : new URL("./mmd_bullet.worker.wasm", moduleUrl).href;
    const namespace = await import(/* @vite-ignore */ moduleUrl);
    if (typeof namespace.default !== "function") {
        throw new Error(`Custom Bullet worker module does not export a default factory: ${moduleUrl}`);
    }
    const module = await namespace.default({
        locateFile(path, prefix) {
            if (/\.wasm(?:$|[?#])/i.test(path)) {
                return wasmUrl;
            }
            return new URL(path, prefix || moduleUrl).href;
        }
    });
    return createCustomBulletMmdPhysicsBackend(module, config.options);
}
