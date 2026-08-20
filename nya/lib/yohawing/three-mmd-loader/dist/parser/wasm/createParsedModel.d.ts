import type { MmdModel, ModelMetadata } from "../model/modelTypes.js";
export declare function createParsedModelFromBytes(bytes: Uint8Array, format: "pmx" | "pmd", wasmMetadata: ModelMetadata): MmdModel;
