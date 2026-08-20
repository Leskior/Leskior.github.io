import type * as THREE from "three/webgpu";
interface MmdWebGpuRenderer {
    readonly backend?: {
        readonly isWebGPUBackend?: boolean;
    };
    compute(node: THREE.Node | THREE.Node[]): Promise<void> | undefined;
}
export declare function enableMmdTslSparsePositionMorphs(mesh: THREE.SkinnedMesh): boolean;
/** Restores the replaced dense attributes and disposes the public compute nodes. */
export declare function disposeMmdTslSparsePositionMorphs(mesh: THREE.SkinnedMesh): boolean;
export declare function computeMmdTslSparsePositionMorphs(renderer: MmdWebGpuRenderer, mesh: THREE.SkinnedMesh): boolean;
export {};
