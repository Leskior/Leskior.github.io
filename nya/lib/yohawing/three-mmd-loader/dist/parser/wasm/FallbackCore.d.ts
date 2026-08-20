import type { MmdAnimation, MmdCore, MmdModel, MmdPose } from "../model/modelTypes.js";
export declare class FallbackCore implements MmdCore {
    version(): string;
    healthCheck(): boolean;
    loadModel(bytes: ArrayBuffer | Uint8Array, options?: {
        format?: "pmx" | "pmd" | "auto";
    }): MmdModel;
    loadVmd(bytes: ArrayBuffer | Uint8Array): MmdAnimation;
    loadVpd(bytes: ArrayBuffer | Uint8Array): MmdPose;
    loadVpdAnimation(bytes: ArrayBuffer | Uint8Array, name?: string): MmdAnimation;
}
