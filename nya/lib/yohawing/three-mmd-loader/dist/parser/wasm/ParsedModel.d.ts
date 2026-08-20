import type { parsePmd } from "../model/PmdModelParser.js";
import type { parsePmx } from "../model/PmxModelParser.js";
import type { DisplayFrameData, EmbeddedTextureData, GeometryBuffers, JointData, MaterialInfo, MmdModel, ModelMetadata, MorphData, RigidBodyData, SkeletonData, SoftBodyData } from "../model/modelTypes.js";
type ParsedData = ReturnType<typeof parsePmx> | ReturnType<typeof parsePmd>;
export declare class ParsedModel implements MmdModel {
    private readonly parsed;
    constructor(parsed: ParsedData);
    metadata(): ModelMetadata;
    geometry(): GeometryBuffers;
    materials(): MaterialInfo[];
    skeleton(): SkeletonData;
    morphs(): MorphData[];
    displayFrames(): DisplayFrameData[];
    rigidBodies(): RigidBodyData[];
    joints(): JointData[];
    softBodies(): SoftBodyData[];
    embeddedTextures(): EmbeddedTextureData[];
}
export declare class DisposableParsedModel extends ParsedModel {
    private readonly release;
    private disposed;
    constructor(parsed: ParsedData, release: () => void);
    isDisposed(): boolean;
    dispose(): void;
}
export {};
