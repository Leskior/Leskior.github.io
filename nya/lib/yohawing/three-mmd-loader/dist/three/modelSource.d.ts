export type ModelSource = string | File | ArrayBuffer | Uint8Array;
export declare const MODEL_SOURCE_STRING_UNRESOLVED = "MODEL_SOURCE_STRING_UNRESOLVED";
export type ModelSourceFetch = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
export interface ReadModelSourceOptions {
    readonly fetch?: ModelSourceFetch;
    readonly signal?: AbortSignal;
}
export type ModelSourceDiagnostic = {
    readonly kind: "bytes";
    readonly byteLength: number;
} | {
    readonly kind: "file";
    readonly byteLength: number;
    readonly name?: string;
} | {
    readonly kind: "url";
    readonly url: string;
    readonly status: number;
    readonly ok: boolean;
    readonly byteLength: number;
    readonly contentType?: string;
    readonly contentLength?: number;
};
export interface ReadModelSourceResult {
    readonly bytes: Uint8Array;
    readonly diagnostic: ModelSourceDiagnostic;
}
export declare function isModelSource(source: unknown): source is ModelSource;
export declare function readModelSource(source: ModelSource, options?: ReadModelSourceOptions): Promise<ReadModelSourceResult>;
export declare function readModelSourceBytes(source: ModelSource, options?: ReadModelSourceOptions): Promise<Uint8Array>;
