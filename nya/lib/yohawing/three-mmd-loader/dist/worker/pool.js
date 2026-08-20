/**
 * Returns the default bounded pool size. Browser workers reserve one logical
 * core for rendering; non-browser runtimes use one slot as an explicit safe
 * fallback because `navigator` is unavailable there.
 */
export function getDefaultMmdRuntimeWorkerPoolSize() {
    if (typeof navigator === "undefined") {
        return 1;
    }
    return resolveMmdRuntimeWorkerPoolSize(navigator.hardwareConcurrency);
}
export function resolveMmdRuntimeWorkerPoolSize(hardwareConcurrency) {
    if (hardwareConcurrency === undefined || !Number.isFinite(hardwareConcurrency)) {
        return 1;
    }
    return Math.max(0, Math.min(4, Math.floor(hardwareConcurrency) - 1));
}
/**
 * A bounded pool of physical workers. Logical runtimes are pinned to their
 * selected slot for their full lifetime; only logical dispose changes load.
 */
export class MmdRuntimeWorkerPool {
    options;
    slots;
    nextRuntimeId = 1;
    disposed = false;
    constructor(options = {}) {
        this.options = options;
        const size = normalizePoolSize(options.size);
        this.slots = new Array(size);
        for (let index = 0; index < size; index += 1) {
            this.slots[index] = {
                index,
                worker: undefined,
                generation: 0,
                dead: false,
                leases: new Set(),
                onMessage: undefined,
                onError: undefined,
                onExit: undefined
            };
        }
    }
    size() {
        return this.slots.length;
    }
    activeLeaseCount() {
        let count = 0;
        for (const slot of this.slots) {
            count += slot.leases.size;
        }
        return count;
    }
    acquire(context, workerFactory) {
        if (this.disposed) {
            throw new Error("MMD runtime worker pool is disposed");
        }
        const slot = this.leastLoadedSlot();
        if (!slot) {
            throw new Error("MMD runtime worker pool has no available workers");
        }
        if (slot.dead || !slot.worker) {
            this.createSlotWorker(slot, context, workerFactory);
        }
        const worker = slot.worker;
        if (!worker) {
            throw new Error("MMD runtime worker pool failed to create a physical worker");
        }
        const runtimeId = this.nextRuntimeId;
        this.nextRuntimeId += 1;
        const lease = new Lease(this, slot, runtimeId, slot.generation, worker);
        slot.leases.add(lease);
        return lease;
    }
    dispose() {
        if (this.disposed) {
            return;
        }
        this.disposed = true;
        for (const slot of this.slots) {
            slot.dead = true;
            const leases = Array.from(slot.leases);
            for (const lease of leases) {
                lease.crash(new Error("MMD runtime worker pool is disposed"));
            }
            slot.leases.clear();
            terminateWorker(slot.worker);
            slot.worker = undefined;
        }
    }
    release(slot, lease) {
        if (!slot.leases.delete(lease)) {
            return;
        }
        if (slot.dead && slot.leases.size === 0) {
            terminateWorker(slot.worker);
            slot.worker = undefined;
        }
    }
    leastLoadedSlot() {
        let selected;
        for (const slot of this.slots) {
            if (!selected || slot.leases.size < selected.leases.size) {
                selected = slot;
            }
        }
        return selected;
    }
    createSlotWorker(slot, context, workerFactory) {
        terminateWorker(slot.worker);
        const factory = workerFactory ?? this.options.workerFactory;
        const worker = factory
            ? factory(context)
            : createDefaultWorker(this.options.workerUrl, this.options.workerOptions);
        slot.worker = worker;
        slot.dead = false;
        slot.generation += 1;
        slot.onMessage = (event) => {
            const candidate = event && typeof event === "object" && "data" in event
                ? event.data
                : event;
            const envelope = candidate;
            if (envelope && typeof envelope.runtimeId === "number" && envelope.event) {
                for (const lease of slot.leases) {
                    if (lease.runtimeId === envelope.runtimeId) {
                        lease.worker.dispatch(envelope.event);
                        return;
                    }
                }
                return;
            }
            if (candidate && typeof candidate === "object" && "type" in candidate) {
                let onlyLease;
                let leaseCount = 0;
                for (const lease of slot.leases) {
                    onlyLease = lease;
                    leaseCount += 1;
                }
                if (leaseCount === 1) {
                    onlyLease?.worker.dispatch(candidate);
                }
            }
        };
        slot.onError = (error) => {
            this.failSlot(slot, error);
        };
        slot.onExit = (code) => {
            this.failSlot(slot, new Error(`MMD runtime worker exited with code ${String(code)}`));
        };
        attachPhysicalWorker(worker, slot);
    }
    failSlot(slot, error) {
        if (slot.dead) {
            return;
        }
        slot.dead = true;
        const leases = Array.from(slot.leases);
        for (const lease of leases) {
            lease.crash(error);
        }
        slot.leases.clear();
        terminateWorker(slot.worker);
        slot.worker = undefined;
    }
}
class LeaseWorker {
    runtimeId;
    slot;
    pool;
    physicalWorker;
    commandEnvelope = {
        runtimeId: 0,
        command: undefined
    };
    messageEvent = {
        data: undefined
    };
    listeners = new Set();
    nodeListeners = new Set();
    released = false;
    onmessageListener;
    onerrorListener;
    constructor(pool, slot, runtimeId, physicalWorker) {
        this.pool = pool;
        this.slot = slot;
        this.runtimeId = runtimeId;
        this.physicalWorker = physicalWorker;
        Object.defineProperties(this.commandEnvelope, {
            type: {
                enumerable: false,
                get: () => this.commandEnvelope.command?.type
            },
            descriptor: {
                enumerable: false,
                get: () => this.commandEnvelope.command?.type === "init"
                    ? this.commandEnvelope.command.descriptor
                    : undefined
            },
            runtimeOptions: {
                enumerable: false,
                get: () => this.commandEnvelope.command?.type === "init"
                    ? this.commandEnvelope.command.runtimeOptions
                    : undefined
            },
            sharedPoseSlots: {
                enumerable: false,
                get: () => this.commandEnvelope.command?.type === "init"
                    ? this.commandEnvelope.command.sharedPoseSlots
                    : undefined
            },
            externalPhysics: {
                enumerable: false,
                get: () => this.commandEnvelope.command?.type === "init"
                    ? this.commandEnvelope.command.externalPhysics
                    : undefined
            },
            epoch: {
                enumerable: false,
                get: () => this.commandEnvelope.command && "epoch" in this.commandEnvelope.command
                    ? this.commandEnvelope.command.epoch
                    : undefined
            },
            animation: {
                enumerable: false,
                get: () => this.commandEnvelope.command?.type === "setAnimation"
                    ? this.commandEnvelope.command.animation
                    : undefined
            },
            seconds: {
                enumerable: false,
                get: () => this.commandEnvelope.command && "seconds" in this.commandEnvelope.command
                    ? this.commandEnvelope.command.seconds
                    : undefined
            },
            options: {
                enumerable: false,
                get: () => this.commandEnvelope.command?.type === "tick"
                    ? this.commandEnvelope.command.options
                    : undefined
            },
            requestId: {
                enumerable: false,
                get: () => this.commandEnvelope.command?.type === "tick"
                    ? this.commandEnvelope.command.requestId
                    : undefined
            },
            pose: {
                enumerable: false,
                get: () => this.commandEnvelope.command?.type === "recycle"
                    ? this.commandEnvelope.command.pose
                    : undefined
            }
        });
    }
    postMessage(message, transfer) {
        if (this.released) {
            return;
        }
        const envelope = this.commandEnvelope;
        envelope.runtimeId = this.runtimeId;
        envelope.command = message;
        this.physicalWorker.postMessage(envelope, transfer);
    }
    terminate() {
        this.release();
    }
    addEventListener(type, listener) {
        if (type === "message") {
            this.listeners.add(listener);
        }
        else if (type === "error") {
            this.onerrorListener = listener;
        }
    }
    removeEventListener(type, listener) {
        if (type === "message") {
            this.listeners.delete(listener);
        }
        else if (type === "error" && this.onerrorListener === listener) {
            this.onerrorListener = undefined;
        }
    }
    on(type, listener) {
        if (type === "message") {
            this.nodeListeners.add(listener);
        }
        else if (type === "error") {
            this.onerrorListener = listener;
        }
    }
    off(type, listener) {
        if (type === "message") {
            this.nodeListeners.delete(listener);
        }
        else if (type === "error" && this.onerrorListener === listener) {
            this.onerrorListener = undefined;
        }
    }
    onmessage;
    onerror;
    dispatch(event) {
        if (this.released) {
            return;
        }
        const message = this.messageEvent;
        message.data = event;
        for (const listener of this.listeners) {
            listener(message);
        }
        for (const listener of this.nodeListeners) {
            listener(event);
        }
        const onmessage = this.onmessageListener ?? (typeof this.onmessage === "function" ? this.onmessage : undefined);
        onmessage?.(message);
    }
    crash(error) {
        if (this.released) {
            return;
        }
        const onerror = this.onerrorListener ?? (typeof this.onerror === "function" ? this.onerror : undefined);
        onerror?.(error);
        if (this.released) {
            return;
        }
        this.dispatch({
            type: "error",
            message: error instanceof Error ? error.message : String(error)
        });
        this.released = true;
    }
    release() {
        if (this.released) {
            return;
        }
        this.released = true;
        this.pool.release(this.slot, this.owner);
    }
    owner;
    setOwner(owner) {
        this.owner = owner;
    }
}
class Lease {
    pool;
    slot;
    runtimeId;
    generation;
    worker;
    disposed = false;
    constructor(pool, slot, runtimeId, generation, physicalWorker) {
        this.pool = pool;
        this.slot = slot;
        this.runtimeId = runtimeId;
        this.generation = generation;
        this.worker = new LeaseWorker(pool, slot, runtimeId, physicalWorker);
        this.worker.setOwner(this);
    }
    dispose() {
        if (this.disposed) {
            return;
        }
        if (!this.workerReleased() && !this.slot.dead) {
            this.worker.postMessage({ type: "dispose" });
        }
        this.release();
    }
    release() {
        if (this.disposed) {
            return;
        }
        this.disposed = true;
        this.worker.release();
    }
    crash(error) {
        this.worker.crash(error);
        this.disposed = true;
    }
    workerReleased() {
        return this.disposed;
    }
}
function normalizePoolSize(size) {
    if (size === undefined) {
        return getDefaultMmdRuntimeWorkerPoolSize();
    }
    if (!Number.isFinite(size)) {
        throw new RangeError("MMD runtime worker pool size must be finite");
    }
    return Math.max(0, Math.floor(size));
}
function createDefaultWorker(workerUrl, workerOptions) {
    const WorkerConstructor = globalThis.Worker;
    if (!WorkerConstructor) {
        throw new Error("MMD runtime worker is unavailable in this environment");
    }
    return new WorkerConstructor(workerUrl ?? new URL("./entry.js", import.meta.url), {
        type: "module",
        ...workerOptions
    });
}
function attachPhysicalWorker(worker, slot) {
    if (worker.addEventListener) {
        worker.addEventListener("message", slot.onMessage);
        worker.addEventListener("error", slot.onError);
        return;
    }
    if (worker.on) {
        worker.on("message", slot.onMessage);
        worker.on("error", slot.onError);
        worker.on("exit", slot.onExit);
        return;
    }
    worker.onmessage = slot.onMessage;
    worker.onerror = slot.onError;
}
function terminateWorker(worker) {
    if (worker) {
        void worker.terminate?.();
    }
}
