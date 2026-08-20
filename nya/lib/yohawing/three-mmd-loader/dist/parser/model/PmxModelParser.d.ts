import type { GeometryBuffers, DisplayFrameData, MaterialInfo, ModelMetadata, MorphData, JointData, RigidBodyData, SoftBodyData, SkeletonData } from "./modelTypes.js";
export interface ParsedPmx {
    metadata: ModelMetadata;
    geometry: GeometryBuffers;
    materials: MaterialInfo[];
    skeleton: SkeletonData;
    morphs: MorphData[];
    displayFrames: DisplayFrameData[];
    rigidBodies: RigidBodyData[];
    joints: JointData[];
    softBodies: SoftBodyData[];
}
export declare function parsePmx(bytes: Uint8Array, options?: {
    skipGeometry?: boolean;
}): ParsedPmx;
