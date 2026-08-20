import type { MmdCore } from "../model/modelTypes.js";
import type { AccessoryParsedManifest } from "./AccessoryParsedTypes.js";
export declare function parseAccessory(bytes: ArrayBuffer | Uint8Array, core: MmdCore, fileName?: string): AccessoryParsedManifest;
