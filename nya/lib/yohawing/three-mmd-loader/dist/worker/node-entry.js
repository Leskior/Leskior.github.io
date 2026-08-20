import { parentPort } from "node:worker_threads";
import { MmdRuntimeWorkerDispatcher } from "./dispatcher.js";
const port = parentPort;
if (!port) {
    throw new Error("MMD runtime worker_threads entry requires parentPort");
}
const dispatcher = new MmdRuntimeWorkerDispatcher({
    postMessage(message, transfer) {
        if (transfer) {
            port.postMessage(message, transfer);
        }
        else {
            port.postMessage(message);
        }
    }
});
port.on("message", (command) => {
    dispatcher.handle(command);
});
