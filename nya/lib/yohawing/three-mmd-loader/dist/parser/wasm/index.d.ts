import type { InitCoreOptions, MmdCore } from "../model/modelTypes.js";
export type { InitCoreOptions, MmdCore, MmdModel } from "../model/modelTypes.js";
export { FallbackCore } from "./FallbackCore.js";
export declare function initCore(options?: InitCoreOptions): Promise<MmdCore>;
export declare function initCoreWithFallback(options?: InitCoreOptions): Promise<MmdCore>;
