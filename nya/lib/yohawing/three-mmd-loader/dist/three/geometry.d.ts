import * as THREE from "three";
import type { MmdMaterialTransparencyMode } from "./textures.js";
export interface ThreeMmdMaterialGroup {
    readonly start: number;
    readonly count: number;
    readonly materialIndex: number;
}
export interface ThreeMmdGeometryMaterial {
    readonly faceCount: number;
    readonly materialIndex?: number;
    readonly transparencyMode?: MmdMaterialTransparencyMode;
}
export interface ThreeMmdSdefBuffers {
    readonly enabled: Float32Array;
    readonly c: Float32Array;
    readonly r0: Float32Array;
    readonly r1: Float32Array;
    readonly rw0: Float32Array;
    readonly rw1: Float32Array;
}
export interface ThreeMmdQdefBuffers {
    readonly enabled: Float32Array;
}
export interface ThreeMmdGeometryBuffers {
    readonly positions: Float32Array;
    readonly normals: Float32Array;
    readonly uvs: Float32Array;
    readonly indices: Uint16Array | Uint32Array;
    readonly additionalUvs?: readonly Float32Array[];
    readonly skinIndices: Uint16Array;
    readonly skinWeights: Float32Array;
    readonly edgeScale?: Float32Array;
    readonly sdef?: ThreeMmdSdefBuffers;
    readonly qdef?: ThreeMmdQdefBuffers;
    readonly materialGroups?: readonly ThreeMmdMaterialGroup[];
}
export interface ThreeMmdVertexMorphOffset {
    readonly vertexIndex: number;
    readonly position: readonly [number, number, number];
}
export interface ThreeMmdUvMorphOffset {
    readonly vertexIndex: number;
    readonly uv: readonly [number, number, number?, number?];
}
export interface ThreeMmdAdditionalUvMorphOffset {
    readonly vertexIndex: number;
    readonly uvIndex: number;
    readonly uv: readonly [number, number, number, number];
}
export interface ThreeMmdGeometryMorph {
    readonly vertexOffsets?: readonly ThreeMmdVertexMorphOffset[];
    readonly densePositionOffsets?: Float32Array;
    readonly uvOffsets?: readonly ThreeMmdUvMorphOffset[];
    readonly denseUvOffsets?: Float32Array;
    readonly additionalUvOffsets?: readonly ThreeMmdAdditionalUvMorphOffset[];
    readonly denseAdditionalUvOffsets?: readonly (Float32Array | undefined)[];
}
/** Controls optional Three.js morph attribute allocation during geometry creation. */
export interface ThreeMmdGeometryOptions {
    /** Creates dense Three.js morph attributes. Defaults to true. */
    readonly morphAttributes?: boolean;
}
export interface ThreeMmdMorphSplitGeometry {
    readonly geometry: THREE.BufferGeometry;
    readonly materialIndex: number;
    readonly morphTargetIndices: Uint16Array | Uint32Array;
    readonly sourceVertexCount: number;
    readonly vertexCount: number;
    readonly morphPositionAttributeCount: number;
}
export declare function createThreeBufferGeometry(buffers: ThreeMmdGeometryBuffers, materials?: readonly ThreeMmdGeometryMaterial[], morphs?: readonly ThreeMmdGeometryMorph[], options?: ThreeMmdGeometryOptions): THREE.BufferGeometry;
export declare function createThreeMorphSplitGeometries(buffers: ThreeMmdGeometryBuffers, materials?: readonly ThreeMmdGeometryMaterial[], morphs?: readonly ThreeMmdGeometryMorph[]): ThreeMmdMorphSplitGeometry[];
