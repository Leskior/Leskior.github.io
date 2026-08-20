import * as THREE from "three/webgpu";
export interface CreateMmdTslShadowCasterOptions {
    readonly shadowLayer?: number;
    /** Set false to merge texture cutouts into opaque caster buckets for lower shadow cost. */
    readonly alphaTest?: boolean;
}
/**
 * Creates a shadow-only child representation with compatible opaque-side and
 * alpha-test buckets. Vertex, skinning, morph, and storage attributes
 * remain shared with the visible mesh; only the compact caster index is owned.
 */
export declare function createMmdTslShadowCaster(mesh: THREE.SkinnedMesh, options?: CreateMmdTslShadowCasterOptions): THREE.SkinnedMesh | null;
export declare function disposeMmdTslShadowCaster(mesh: THREE.SkinnedMesh): boolean;
