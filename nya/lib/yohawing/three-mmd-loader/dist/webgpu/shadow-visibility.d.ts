import type * as THREE from "three/webgpu";
import type Node from "three/src/nodes/core/Node.js";
/**
 * Builds the receiver-only visibility graph for the dedicated caster depth
 * target. This intentionally mirrors the directional-light portion of
 * Three's shadow node, but keeps the target independent from the renderer's
 * ordinary shadow-map binding.
 */
export declare function createMmdTslShadowVisibilityNode(light: THREE.DirectionalLight, depthTexture: THREE.DepthTexture, options?: {
    reversedDepth?: boolean;
}): Node<"float">;
