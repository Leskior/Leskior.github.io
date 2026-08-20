import type { MmdAnimation, MmdPose } from "../model/modelTypes.js";
export declare function parseVpd(input: Uint8Array | string): MmdPose;
export declare function vpdPoseToAnimation(pose: MmdPose, name?: string): MmdAnimation;
