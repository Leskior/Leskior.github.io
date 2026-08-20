import { DefaultMmdRuntime } from "../runtime/core.js";
import { buildShadowMmdSkinnedMesh } from "./modelDescriptor.js";
import { captureMmdRuntimePoseInto, createMmdRuntimePoseBuffer } from "./protocol.js";
/**
 * Worker-API-independent runtime host. P0 runs this in-process; later transports
 * can forward the same commands without changing runtime evaluation order.
 */
export class MmdRuntimeWorkerHost {
    mesh;
    runtime;
    poseBuffer;
    currentEpoch = 0;
    currentSequence = 0;
    disposed = false;
    constructor(descriptor, options = {}) {
        this.mesh = buildShadowMmdSkinnedMesh(descriptor);
        this.runtime = options.runtime ?? new DefaultMmdRuntime(options.runtimeOptions);
        this.poseBuffer = createMmdRuntimePoseBuffer(descriptor.bones.length, descriptor.morphCount);
        this.publish(this.runtime.frameState());
    }
    epoch() {
        return this.currentEpoch;
    }
    setAnimation(animation) {
        this.assertActive();
        this.currentEpoch += 1;
        this.runtime.setAnimation(animation, this.mesh);
        return this.publish(this.runtime.frameState());
    }
    evaluate(seconds, options) {
        this.assertActive();
        return this.publish(this.runtime.evaluate(seconds, options));
    }
    seek(seconds) {
        this.assertActive();
        this.currentEpoch += 1;
        return this.runtime.seek(seconds);
    }
    resetPose() {
        this.assertActive();
        this.currentEpoch += 1;
        this.runtime.resetPose();
        return this.publish(this.runtime.frameState());
    }
    clearAnimation() {
        this.assertActive();
        this.currentEpoch += 1;
        this.runtime.clearAnimation();
        return this.publish(this.runtime.frameState());
    }
    frameState() {
        this.assertActive();
        return this.runtime.frameState();
    }
    debugState() {
        this.assertActive();
        return this.runtime.debugState();
    }
    pose() {
        return this.poseBuffer;
    }
    dispose() {
        if (this.disposed) {
            return;
        }
        this.disposed = true;
        this.currentEpoch += 1;
        this.runtime.clearAnimation();
        this.mesh.geometry.dispose();
        const material = this.mesh.material;
        if (Array.isArray(material)) {
            for (const entry of material) {
                entry.dispose();
            }
        }
        else {
            material.dispose();
        }
    }
    publish(frameState) {
        this.currentSequence += 1;
        return captureMmdRuntimePoseInto(this.mesh, frameState, this.currentEpoch, this.currentSequence, this.poseBuffer);
    }
    assertActive() {
        if (this.disposed) {
            throw new Error("MMD runtime worker host is disposed");
        }
    }
}
