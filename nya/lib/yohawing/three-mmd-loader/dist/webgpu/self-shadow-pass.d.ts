import * as THREE from "three/webgpu";
import { createMmdTslShadowVisibilityNode } from "./shadow-visibility.js";
export interface MmdTslSelfShadowPass {
    readonly renderTarget: THREE.RenderTarget;
    readonly depthTexture: THREE.DepthTexture;
    readonly visibilityNode: ReturnType<typeof createMmdTslShadowVisibilityNode>;
    /**
     * Selects the precompiled VMD self-shadow ramp. Only mode 2 is distinct;
     * every other value (including disabled/missing state) safely uses mode 1.
     */
    setMode(mode: number): boolean;
    compileAsync(renderer: THREE.WebGPURenderer, scene: THREE.Scene, light: THREE.DirectionalLight): Promise<boolean>;
    render(renderer: THREE.WebGPURenderer, scene: THREE.Scene, light: THREE.DirectionalLight): boolean;
    setReceiverVisibilityDebug(root: THREE.Object3D, enabled: boolean, sampleTarget?: boolean): boolean;
    dispose(): void;
}
/**
 * Owns the Phase 1 caster-only depth target. The receiver graph is intentionally
 * not connected here; this pass only proves that the existing caster layer can be
 * rendered into an independent depth texture without invoking Three's shadow map.
 */
export declare function createMmdTslSelfShadowPass(renderer: THREE.WebGPURenderer, light: THREE.DirectionalLight): MmdTslSelfShadowPass;
