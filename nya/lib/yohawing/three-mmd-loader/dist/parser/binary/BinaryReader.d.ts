export declare class BinaryReader {
    readonly view: DataView;
    offset: number;
    constructor(bytes: Uint8Array);
    get remaining(): number;
    ensure(length: number): void;
    bytes(length: number): Uint8Array;
    skip(length: number): void;
    u8(): number;
    i8(): number;
    u16(): number;
    i16(): number;
    u32(): number;
    i32(): number;
    f32(): number;
    index(size: number): number;
}
export declare function toUint8Array(bytes: ArrayBuffer | Uint8Array): Uint8Array;
