import type { GeometryBuffers, DisplayFrameData, MaterialInfo, ModelMetadata, MorphData, JointData, RigidBodyData, SkeletonData } from "./modelTypes.js";
export interface ParsedPmd {
    metadata: ModelMetadata;
    geometry: GeometryBuffers;
    materials: MaterialInfo[];
    skeleton: SkeletonData;
    morphs: MorphData[];
    displayFrames: DisplayFrameData[];
    rigidBodies: RigidBodyData[];
    joints: JointData[];
    softBodies: [];
}
export declare function parsePmd(bytes: Uint8Array, options?: {
    skipGeometry?: boolean;
}): ParsedPmd;
