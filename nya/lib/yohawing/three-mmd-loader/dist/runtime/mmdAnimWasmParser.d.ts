import type { MmdAnimation, MmdPose } from "../parser/model/modelTypes.js";
import type { MmdAnimRuntimeWasmModule } from "./mmdAnimRuntime.js";
interface RuntimeWasmVmdDto {
    readonly kind: "vmd";
    readonly metadata: {
        readonly modelName: string;
        readonly counts: {
            readonly bones: number;
            readonly morphs: number;
            readonly cameras: number;
            readonly lights: number;
            readonly selfShadows: number;
            readonly properties: number;
        };
        readonly maxFrame: number;
    };
    readonly boneFrames: readonly RuntimeWasmVmdBoneFrame[];
    readonly morphFrames: readonly RuntimeWasmVmdMorphFrame[];
    readonly cameraFrames: readonly RuntimeWasmVmdCameraFrame[];
    readonly lightFrames: readonly RuntimeWasmVmdLightFrame[];
    readonly selfShadowFrames: readonly RuntimeWasmVmdSelfShadowFrame[];
    readonly propertyFrames: readonly RuntimeWasmVmdPropertyFrame[];
}
interface RuntimeWasmVmdBoneFrame {
    readonly boneName: string;
    readonly frame: number;
    readonly translation: readonly [number, number, number];
    readonly rotation: readonly [number, number, number, number];
    readonly interpolation?: readonly number[];
}
interface RuntimeWasmVmdMorphFrame {
    readonly morphName: string;
    readonly frame: number;
    readonly weight: number;
}
interface RuntimeWasmVmdCameraFrame {
    readonly frame: number;
    readonly distance: number;
    readonly position: readonly [number, number, number];
    readonly rotation: readonly [number, number, number];
    readonly interpolation?: readonly number[];
    readonly fov: number;
    readonly perspective: boolean;
}
interface RuntimeWasmVmdLightFrame {
    readonly frame: number;
    readonly color: readonly [number, number, number];
    readonly direction: readonly [number, number, number];
}
interface RuntimeWasmVmdSelfShadowFrame {
    readonly frame: number;
    readonly mode: number;
    readonly distance: number;
}
interface RuntimeWasmVmdPropertyFrame {
    readonly frame: number;
    readonly visible: boolean;
    readonly physicsSimulation?: boolean;
    readonly ikStates: readonly {
        readonly boneName: string;
        readonly enabled: boolean;
    }[];
}
interface RuntimeWasmVpdDto {
    readonly kind?: "vpd";
    readonly format?: "vpd";
    readonly modelFile: string;
    readonly boneCount: number;
    readonly bones: readonly RuntimeWasmVpdBonePose[];
}
interface RuntimeWasmVpdBonePose {
    readonly name: string;
    readonly translation: readonly [number, number, number];
    readonly rotation: readonly [number, number, number, number];
}
export declare function loadMmdAnimWasmVmd(wasm: Pick<MmdAnimRuntimeWasmModule, "parseMmdFormatJson">, bytes: Uint8Array, fileName?: string | null): MmdAnimation;
export declare function loadMmdAnimWasmVpd(wasm: Pick<MmdAnimRuntimeWasmModule, "parseMmdFormatJson">, bytes: Uint8Array, fileName?: string | null): MmdPose;
export declare function mmdAnimWasmVmdDtoToAnimation(dto: RuntimeWasmVmdDto, bytes?: Uint8Array<ArrayBuffer>): MmdAnimation;
export declare function mmdAnimWasmVpdDtoToPose(dto: RuntimeWasmVpdDto, bytes?: Uint8Array<ArrayBuffer>): MmdPose;
export {};
