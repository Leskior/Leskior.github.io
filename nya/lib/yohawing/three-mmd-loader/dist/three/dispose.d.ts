import type { ThreeMmdModel } from "./index.js";
export interface DisposeMmdModelOptions {
    /**
     * Controls texture disposal. Defaults to "all" for backward compatibility.
     * Use "none" when textures are shared outside the model.
     */
    readonly textures?: "all" | "owned" | "none";
}
export declare function disposeMmdModel(model: ThreeMmdModel, options?: DisposeMmdModelOptions): void;
