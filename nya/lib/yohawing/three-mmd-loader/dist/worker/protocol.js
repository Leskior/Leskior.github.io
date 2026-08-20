const mmdAxisSigns = [1, 1, -1, 1];
export const MMD_RUNTIME_POSE_PROTOCOL_VERSION = 1;
export function createMmdRuntimePoseBuffer(boneCount, morphCount) {
    assertCount(boneCount, "bone");
    assertCount(morphCount, "morph");
    return {
        version: MMD_RUNTIME_POSE_PROTOCOL_VERSION,
        epoch: 0,
        sequence: 0,
        seconds: 0,
        frame: 0,
        frameRate: 30,
        worldMatricesColumnMajor: new Float32Array(boneCount * 16),
        morphWeights: new Float32Array(morphCount)
    };
}
/** Writes one pose into a caller-owned buffer without allocating. */
export function captureMmdRuntimePoseInto(mesh, frameState, epoch, sequence, target) {
    const bones = mesh.skeleton.bones;
    if (target.worldMatricesColumnMajor.length !== bones.length * 16) {
        throw new RangeError("MMD runtime pose bone buffer length mismatch");
    }
    const influences = mesh.morphTargetInfluences;
    if (target.morphWeights.length !== (influences?.length ?? 0)) {
        throw new RangeError("MMD runtime pose morph buffer length mismatch");
    }
    mesh.updateWorldMatrix(false, true);
    for (let boneIndex = 0; boneIndex < bones.length; boneIndex += 1) {
        const elements = bones[boneIndex]?.matrixWorld.elements;
        if (!elements) {
            continue;
        }
        const offset = boneIndex * 16;
        for (let column = 0; column < 4; column += 1) {
            const columnSign = mmdAxisSigns[column];
            for (let row = 0; row < 4; row += 1) {
                target.worldMatricesColumnMajor[offset + column * 4 + row] =
                    mmdAxisSigns[row] * elements[column * 4 + row] * columnSign;
            }
        }
    }
    for (let index = 0; index < target.morphWeights.length; index += 1) {
        target.morphWeights[index] = influences?.[index] ?? 0;
    }
    const mutableTarget = target;
    mutableTarget.epoch = epoch;
    mutableTarget.sequence = sequence;
    mutableTarget.seconds = frameState.seconds;
    mutableTarget.frame = frameState.frame;
    mutableTarget.frameRate = frameState.frameRate;
    return target;
}
export function isCurrentMmdRuntimePose(pose, epoch, lastAppliedSequence = -1) {
    return pose.epoch === epoch && pose.sequence > lastAppliedSequence;
}
/** Copies pose metadata and payload into a reusable transferable buffer. */
export function copyMmdRuntimePoseInto(source, target) {
    if (source.worldMatricesColumnMajor.length !== target.worldMatricesColumnMajor.length ||
        source.morphWeights.length !== target.morphWeights.length) {
        throw new RangeError("MMD runtime pose copy buffer length mismatch");
    }
    target.worldMatricesColumnMajor.set(source.worldMatricesColumnMajor);
    target.morphWeights.set(source.morphWeights);
    const mutableTarget = target;
    mutableTarget.epoch = source.epoch;
    mutableTarget.sequence = source.sequence;
    mutableTarget.seconds = source.seconds;
    mutableTarget.frame = source.frame;
    mutableTarget.frameRate = source.frameRate;
    return target;
}
function assertCount(value, label) {
    if (!Number.isInteger(value) || value < 0) {
        throw new RangeError(`MMD runtime pose ${label} count must be a non-negative integer`);
    }
}
