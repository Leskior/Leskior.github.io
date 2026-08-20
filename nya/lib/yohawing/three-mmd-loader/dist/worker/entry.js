/// <reference lib="webworker" />
import { MmdRuntimeWorkerDispatcher } from "./dispatcher.js";
const workerScope = self;
const dispatcher = new MmdRuntimeWorkerDispatcher({
    postMessage(message, transfer) {
        if (transfer) {
            workerScope.postMessage(message, transfer);
        }
        else {
            workerScope.postMessage(message);
        }
    }
});
workerScope.addEventListener("message", (event) => {
    dispatcher.handle(event.data);
});
