import { MmdRuntimeWorkerEndpoint } from "./endpoint.js";
/**
 * Routes commands for multiple logical character runtimes through one worker
 * port. Each runtime keeps its own endpoint and event envelope, so a pose
 * transfer does not allocate a wrapper object or transfer list on the hot path.
 */
export class MmdRuntimeWorkerDispatcher {
    port;
    endpoints = new Map();
    runtimePorts = new Map();
    constructor(port) {
        this.port = port;
    }
    /** Handles one runtime command envelope. */
    handle(message) {
        const runtimeId = message.runtimeId;
        const command = message.command;
        const endpoint = this.endpoints.get(runtimeId);
        if (command.type === "init") {
            if (endpoint) {
                this.reportError(runtimeId, `MMD runtime worker runtime ${runtimeId} is already initialized`);
                return;
            }
            const runtimePort = new MmdRuntimeWorkerDispatcherRuntimePort(this.port, runtimeId, () => {
                this.endpoints.delete(runtimeId);
                this.runtimePorts.delete(runtimeId);
            });
            const runtimeEndpoint = new MmdRuntimeWorkerEndpoint(runtimePort);
            this.runtimePorts.set(runtimeId, runtimePort);
            this.endpoints.set(runtimeId, runtimeEndpoint);
            runtimeEndpoint.handle(command);
            if (runtimePort.initializationFailed()) {
                this.endpoints.delete(runtimeId);
                this.runtimePorts.delete(runtimeId);
            }
            return;
        }
        if (!endpoint) {
            this.reportError(runtimeId, `MMD runtime worker runtime ${runtimeId} is unknown; init is required`);
            return;
        }
        endpoint.handle(command);
        if (command.type === "dispose") {
            this.endpoints.delete(runtimeId);
            this.runtimePorts.delete(runtimeId);
        }
    }
    /** Number of active logical runtimes currently owned by this dispatcher. */
    runtimeCount() {
        return this.endpoints.size;
    }
    reportError(runtimeId, message) {
        const runtimePort = this.runtimePorts.get(runtimeId);
        if (runtimePort) {
            runtimePort.postMessage({ type: "error", message });
            return;
        }
        this.port.postMessage({
            runtimeId,
            event: { type: "error", message }
        });
    }
}
/**
 * Adapts one endpoint's ordinary event port to the dispatcher's multiplexed
 * port. The outer envelope is deliberately mutable and retained per runtime.
 */
class MmdRuntimeWorkerDispatcherRuntimePort {
    onInitializationFailure;
    port;
    envelope;
    initialized = false;
    failed = false;
    constructor(port, runtimeId, onInitializationFailure) {
        this.onInitializationFailure = onInitializationFailure;
        this.port = port;
        this.envelope = {
            runtimeId,
            event: undefined
        };
    }
    postMessage(message, transfer) {
        if (message.type === "ready") {
            this.initialized = true;
        }
        else if (message.type === "error" && !this.initialized) {
            this.failed = true;
            this.onInitializationFailure();
        }
        this.envelope.event = message;
        this.port.postMessage(this.envelope, transfer);
    }
    initializationFailed() {
        return this.failed;
    }
}
