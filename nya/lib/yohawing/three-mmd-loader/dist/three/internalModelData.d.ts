import type { MmdModelFormat, PmdMetadata, PmdSectionInventory, PmxMetadata, PmxSectionInventory } from "../parser/index.js";
import type { Diagnostic, DisplayFrameData, JointData, MaterialInfo, MorphData, RigidBodyData, SoftBodyData } from "../parser/model/modelTypes.js";
import type { ThreeMmdGeometryBuffers } from "./geometry.js";
import type { ThreeMmdSkeletonData } from "./skeleton.js";
export type LoaderMmdCoordinateSystem = "mmd-right-handed-y-up";
export interface LoaderMmdModelMetadata {
    readonly format: MmdModelFormat;
    readonly version: number;
    readonly encoding: "utf-8" | "utf-16-le" | "shift-jis" | "unknown";
    readonly name: string;
    readonly englishName: string;
    readonly comment: string;
    readonly englishComment: string;
    readonly diagnostics: readonly Diagnostic[];
}
export interface LoaderMmdModelData {
    readonly coordinateSystem: LoaderMmdCoordinateSystem;
    readonly metadata: LoaderMmdModelMetadata;
    readonly geometry: ThreeMmdGeometryBuffers;
    readonly materials: readonly MaterialInfo[];
    readonly morphs: readonly MorphData[];
    readonly skeleton: ThreeMmdSkeletonData;
    readonly displayFrames: readonly DisplayFrameData[];
    readonly rigidBodies: readonly RigidBodyData[];
    readonly joints: readonly JointData[];
    readonly softBodies: readonly SoftBodyData[];
}
export type LoaderMmdModelContainerMetadata = PmxMetadata | PmdMetadata;
export type LoaderMmdModelContainerInventory = PmxSectionInventory | PmdSectionInventory;
export interface LoaderMmdModelContainer {
    readonly format: MmdModelFormat;
    readonly metadata: LoaderMmdModelContainerMetadata;
    readonly inventory: LoaderMmdModelContainerInventory;
}
export declare function createLoaderMmdModelData(input: LoaderMmdModelData): LoaderMmdModelData;
export declare function createLoaderMmdMetadata(metadata: LoaderMmdModelContainerMetadata): LoaderMmdModelMetadata;
export declare function validateLoaderMmdModelData(modelData: LoaderMmdModelData): void;
