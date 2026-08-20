import type { MmdRuntimeWorkerCommand, MmdRuntimeWorkerMessagePort } from "./messages.js";
import { type CustomBulletWorkerPhysicsConfig } from "./externalPhysics.js";
import type { MmdPhysicsBackend } from "../physics/index.js";
export interface MmdRuntimeWorkerEndpointOptions {
    readonly createExternalPhysicsBackend?: (config: CustomBulletWorkerPhysicsConfig) => Promise<MmdPhysicsBackend>;
}
/** Owns one logical character runtime behind any Worker-like message port. */
export declare class MmdRuntimeWorkerEndpoint {
    private readonly port;
    private readonly createExternalPhysicsBackend;
    private readonly preReadyCommands;
    private readonly poseEvent;
    private readonly settledPoseEvent;
    private readonly poseTransferList;
    private sharedPoseSlots;
    private sharedPoseEvents;
    private host;
    private pool;
    private preReadyTick;
    private pendingTick;
    private readonly pendingSettledTicks;
    private pendingSettledTickIndex;
    private disposed;
    private initializing;
    private ownedPhysicsBackend;
    constructor(port: MmdRuntimeWorkerMessagePort, options?: MmdRuntimeWorkerEndpointOptions);
    handle(command: MmdRuntimeWorkerCommand): void;
    private initialize;
    private initializeExternal;
    private finishInitialize;
    private queueBeforeReady;
    private queuePreReadyCommand;
    private handleReadyCommand;
    private publishTick;
    private publishPendingTick;
    private queueSettledTick;
    private discardStalePendingTicks;
    private compactSettledTicksIfExhausted;
    private clearPendingSettledTicks;
    private assertRequestId;
    private assertEpoch;
    private dispose;
}
