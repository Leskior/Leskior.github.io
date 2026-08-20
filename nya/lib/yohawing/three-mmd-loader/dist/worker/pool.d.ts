import type { ThreeMmdRuntimeFactoryContext } from "../three/index.js";
import type { MmdRuntimeWorkerLike } from "./runtime.js";
import type { MmdRuntimeWorkerCommand, MmdRuntimeWorkerEvent, MmdRuntimeWorkerRuntimeId } from "./messages.js";
export type MmdRuntimeWorkerPhysicalFactory = (context: ThreeMmdRuntimeFactoryContext) => MmdRuntimeWorkerLike;
export interface MmdRuntimeWorkerPoolOptions {
    /** Maximum number of physical workers. Defaults to the bounded browser heuristic. */
    readonly size?: number;
    /** Factory used to create each physical worker slot. */
    readonly workerFactory?: MmdRuntimeWorkerPhysicalFactory;
    readonly workerUrl?: string | URL;
    readonly workerOptions?: WorkerOptions;
}
export interface MmdRuntimeWorkerLease {
    readonly runtimeId: MmdRuntimeWorkerRuntimeId;
    readonly generation: number;
    readonly worker: MmdRuntimeWorkerLike;
    /** Sends logical dispose once and releases the slot lease. */
    dispose(): void;
    /** Releases the slot lease without sending another command. */
    release(): void;
}
/**
 * Returns the default bounded pool size. Browser workers reserve one logical
 * core for rendering; non-browser runtimes use one slot as an explicit safe
 * fallback because `navigator` is unavailable there.
 */
export declare function getDefaultMmdRuntimeWorkerPoolSize(): number;
export declare function resolveMmdRuntimeWorkerPoolSize(hardwareConcurrency: number | undefined): number;
interface MutableLease {
    readonly runtimeId: MmdRuntimeWorkerRuntimeId;
    readonly generation: number;
    readonly worker: LeaseWorker;
    dispose(): void;
    release(): void;
    crash(error: unknown): void;
}
interface Slot {
    readonly index: number;
    worker: MmdRuntimeWorkerLike | undefined;
    generation: number;
    dead: boolean;
    readonly leases: Set<MutableLease>;
    onMessage: ((event: unknown) => void) | undefined;
    onError: ((error: unknown) => void) | undefined;
    onExit: ((code: unknown) => void) | undefined;
}
/**
 * A bounded pool of physical workers. Logical runtimes are pinned to their
 * selected slot for their full lifetime; only logical dispose changes load.
 */
export declare class MmdRuntimeWorkerPool {
    private readonly options;
    private readonly slots;
    private nextRuntimeId;
    private disposed;
    constructor(options?: MmdRuntimeWorkerPoolOptions);
    size(): number;
    activeLeaseCount(): number;
    acquire(context: ThreeMmdRuntimeFactoryContext, workerFactory?: MmdRuntimeWorkerPhysicalFactory): MmdRuntimeWorkerLease;
    dispose(): void;
    release(slot: Slot, lease: MutableLease): void;
    private leastLoadedSlot;
    private createSlotWorker;
    private failSlot;
}
declare class LeaseWorker implements MmdRuntimeWorkerLike {
    readonly runtimeId: MmdRuntimeWorkerRuntimeId;
    private readonly slot;
    private readonly pool;
    private readonly physicalWorker;
    private readonly commandEnvelope;
    private readonly messageEvent;
    private readonly listeners;
    private readonly nodeListeners;
    private released;
    private onmessageListener;
    private onerrorListener;
    constructor(pool: MmdRuntimeWorkerPool, slot: Slot, runtimeId: MmdRuntimeWorkerRuntimeId, physicalWorker: MmdRuntimeWorkerLike);
    postMessage(message: MmdRuntimeWorkerCommand, transfer?: Transferable[]): void;
    terminate(): void;
    addEventListener(type: string, listener: (event: {
        readonly data: MmdRuntimeWorkerEvent;
    }) => void): void;
    removeEventListener(type: string, listener: (event: {
        readonly data: MmdRuntimeWorkerEvent;
    }) => void): void;
    on(type: string, listener: (event: MmdRuntimeWorkerEvent) => void): void;
    off(type: string, listener: (event: MmdRuntimeWorkerEvent) => void): void;
    onmessage: unknown;
    onerror: unknown;
    dispatch(event: MmdRuntimeWorkerEvent): void;
    crash(error: unknown): void;
    release(): void;
    owner: MutableLease;
    setOwner(owner: MutableLease): void;
}
export {};
