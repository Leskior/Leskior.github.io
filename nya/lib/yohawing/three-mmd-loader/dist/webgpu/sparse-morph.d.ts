import type { ThreeMmdGeometryMorph } from "../three/geometry.js";
export interface MmdPositionMorphCsr {
    readonly vertexCount: number;
    readonly morphCount: number;
    readonly rowOffsets: Uint32Array;
    readonly morphIndices: Uint32Array;
    readonly values: Float32Array;
}
export interface MmdUvMorphCsr extends MmdPositionMorphCsr {
    readonly componentCount: 2 | 4;
}
export declare function packMmdPositionMorphsToVertexCsr(vertexCount: number, morphs: readonly ThreeMmdGeometryMorph[]): MmdPositionMorphCsr;
export declare function packMmdUvMorphsToVertexCsr(vertexCount: number, morphs: readonly ThreeMmdGeometryMorph[], additionalUvIndex?: number): MmdUvMorphCsr;
