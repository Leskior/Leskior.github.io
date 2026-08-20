import * as THREE from "three";
import type { LightState } from "../parser/model/modelTypes.js";
export interface ApplyMmdLightStateOptions {
    readonly target?: THREE.Vector3;
    readonly directionScratch?: THREE.Vector3;
    readonly distance?: number;
    readonly colorScale?: number;
}
export declare function applyMmdLightStateToThreeDirectionalLight(light: THREE.DirectionalLight, state: LightState | undefined, options?: ApplyMmdLightStateOptions): THREE.DirectionalLight;
