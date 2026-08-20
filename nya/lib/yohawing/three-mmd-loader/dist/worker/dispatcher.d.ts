import type { MmdRuntimeWorkerCommandEnvelope, MmdRuntimeWorkerMultiplexedMessagePort } from "./messages.js";
/**
 * Routes commands for multiple logical character runtimes through one worker
 * port. Each runtime keeps its own endpoint and event envelope, so a pose
 * transfer does not allocate a wrapper object or transfer list on the hot path.
 */
export declare class MmdRuntimeWorkerDispatcher {
    private readonly port;
    private readonly endpoints;
    private readonly runtimePorts;
    constructor(port: MmdRuntimeWorkerMultiplexedMessagePort);
    /** Handles one runtime command envelope. */
    handle(message: MmdRuntimeWorkerCommandEnvelope): void;
    /** Number of active logical runtimes currently owned by this dispatcher. */
    runtimeCount(): number;
    private reportError;
}
/** Alias retained for callers that use the shorter dispatcher name. */
export type MmdRuntimeWorkerDispatcherMessagePort = MmdRuntimeWorkerMultiplexedMessagePort;
/** Alias for the command envelope accepted by the dispatcher. */
export type MmdRuntimeWorkerDispatcherCommand = MmdRuntimeWorkerCommandEnvelope;
