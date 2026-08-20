import type { Diagnostic } from "./modelTypes.js";
export declare function sanitizeNonFiniteModelNormals(positions: Float32Array, normals: Float32Array, indices: Uint16Array | Uint32Array, diagnostics: Diagnostic[]): void;
