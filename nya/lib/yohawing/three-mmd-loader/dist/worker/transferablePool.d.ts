import { type MmdRuntimePoseBuffer } from "./protocol.js";
export declare class MmdRuntimeTransferablePosePool {
    private readonly capacity;
    private readonly boneValueCount;
    private readonly morphCount;
    private readonly available;
    constructor(boneCount: number, morphCount: number, capacity?: number);
    acquire(): MmdRuntimePoseBuffer | undefined;
    release(pose: MmdRuntimePoseBuffer): boolean;
    availableCount(): number;
}
