import type { MmdAnimation, MmdCore, MmdModel, MmdPose } from "../model/modelTypes.js";
import type { AccessoryParsedManifest } from "../accessory/AccessoryParsedTypes.js";
import type { PmmParsedManifest } from "../pmm/PmmParsedTypes.js";
export interface MmdAnimWasmExports {
    parsePmxModelNonGeometryJson?: (data: Uint8Array) => string;
    parseMmdFormatJson?: (data: Uint8Array, fileName?: string | null) => string;
    parseVmdAnimationJson?: (data: Uint8Array) => string;
    WasmPmxParsedModel?: WasmPmxParsedModelConstructor;
    WasmPmxGeometry?: WasmPmxGeometryConstructor;
    wasm_wrapper_version(): number;
}
interface WasmPmxParsedModelConstructor {
    parse(data: Uint8Array): WasmPmxParsedModelDto;
}
interface WasmPmxParsedModelDto {
    free?(): void;
    nonGeometryJson(): string;
    nonGeometryJsonWithoutVertexOffsets?(): string;
    geometry(): WasmPmxGeometryDto;
    vertexMorphOffsets?(): WasmPmxVertexMorphOffsetsDto;
}
interface WasmPmxVertexMorphOffsetsDto {
    free?(): void;
    morphSpans(): Uint32Array;
    vertexIndices(): Uint32Array;
    positions(): Float32Array;
}
interface WasmPmxGeometryConstructor {
    fromPmxBytes(data: Uint8Array): WasmPmxGeometryDto;
}
interface WasmPmxGeometryDto {
    free?(): void;
    additionalUvCount(): number;
    additionalUvs(): Float32Array;
    edgeScale(): Float32Array;
    indices(): Uint32Array;
    materialGroups(): Uint32Array;
    normals(): Float32Array;
    positions(): Float32Array;
    qdefEnabled(): Uint8Array;
    sdefC(): Float32Array;
    sdefEnabled(): Uint8Array;
    sdefR0(): Float32Array;
    sdefR1(): Float32Array;
    sdefRw0(): Float32Array;
    sdefRw1(): Float32Array;
    skinIndices(): Uint32Array;
    skinWeights(): Float32Array;
    uvs(): Float32Array;
    vertexCount(): number;
}
export declare class MmdAnimBackedCore implements MmdCore {
    private readonly wasm;
    private readonly versionString;
    constructor(wasm: MmdAnimWasmExports);
    version(): string;
    healthCheck(): boolean;
    loadModel(bytes: ArrayBuffer | Uint8Array, options?: {
        format?: "pmx" | "pmd" | "auto";
    }): MmdModel;
    loadVmd(bytes: ArrayBuffer | Uint8Array): MmdAnimation;
    loadVpd(bytes: ArrayBuffer | Uint8Array): MmdPose;
    loadVpdAnimation(bytes: ArrayBuffer | Uint8Array, name?: string): MmdAnimation;
    parsePmmDocument(bytes: ArrayBuffer | Uint8Array): PmmParsedManifest;
    parseAccessory(bytes: ArrayBuffer | Uint8Array, fileName?: string): AccessoryParsedManifest;
    private parseWasmJson;
}
export {};
