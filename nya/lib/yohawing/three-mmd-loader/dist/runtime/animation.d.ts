import * as THREE from "three";
import type { CameraState, LightState, MmdAnimation, SelfShadowState, VmdBoneFrame, VmdBoneTrack, VmdCameraFrame, VmdLightFrame, VmdMorphTrack, VmdSelfShadowFrame } from "../parser/model/modelTypes.js";
import type { RuntimeRestTransform } from "./types.js";
export interface ApplyMmdAnimationScratch {
    readonly boneMorphQuaternion: THREE.Quaternion;
    readonly boneSample: BoneSampleScratch;
    readonly bonePhysicsToggles: Record<string, number>;
    readonly groupMorphDirectWeights: number[];
    groupMorphVisited: Uint8Array;
}
interface BoneSampleScratch {
    frame: number;
    translationX: number;
    translationY: number;
    translationZ: number;
    rotationX: number;
    rotationY: number;
    rotationZ: number;
    rotationW: number;
    hasPhysicsToggle: boolean;
    physicsToggle: number;
}
export declare function applyMmdAnimation(mesh: THREE.SkinnedMesh | undefined, animation: MmdAnimation | undefined, restTransforms: readonly RuntimeRestTransform[], preAppendTransforms: RuntimeRestTransform[], scratch: ApplyMmdAnimationScratch, frame: number): Record<string, number> | undefined;
declare function isMmdAnimation(value: unknown): value is MmdAnimation;
declare function findBoneTrack(animation: MmdAnimation, bone: THREE.Bone): VmdBoneTrack | undefined;
declare function sampleBoneTrack(frames: VmdBoneTrack | undefined, frame: number): VmdBoneFrame | undefined;
declare function sampleMorphTrack(frames: VmdMorphTrack, frame: number): number;
export declare function sampleMmdCameraTrack(frames: readonly VmdCameraFrame[], frame: number): CameraState | undefined;
export declare function sampleMmdCameraTrackInto(frames: readonly VmdCameraFrame[], frame: number, target: CameraState, hint?: {
    index: number;
}): CameraState | undefined;
export declare function sampleMmdLightTrack(frames: readonly VmdLightFrame[], frame: number): LightState | undefined;
export declare function sampleMmdLightTrackInto(frames: readonly VmdLightFrame[], frame: number, target: LightState): LightState | undefined;
export declare function sampleMmdSelfShadowTrack(frames: readonly VmdSelfShadowFrame[], frame: number): SelfShadowState | undefined;
export declare function sampleMmdSelfShadowTrackInto(frames: readonly VmdSelfShadowFrame[], frame: number, target: SelfShadowState, hint?: {
    index: number;
}): SelfShadowState | undefined;
declare function sampleFramePair<T extends {
    readonly frame: number;
}>(frames: readonly T[], frame: number): {
    readonly previous: T;
    readonly next: T;
    readonly t: number;
} | undefined;
export declare function preparePreAppendTransforms(bones: readonly THREE.Bone[], preAppendTransforms: RuntimeRestTransform[]): void;
export { findBoneTrack, isMmdAnimation, sampleBoneTrack, sampleFramePair, sampleMorphTrack };
