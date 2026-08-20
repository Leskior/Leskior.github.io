import type { SelfShadowState } from "../parser/model/modelTypes.js";
import * as THREE from "three";
export declare const MMD_SELF_SHADOW_LAYER = 1;
export interface ApplyMmdSelfShadowStateOptions {
    readonly enabledModes?: readonly number[];
    readonly minFar?: number;
    readonly maxFar?: number;
    readonly distanceScale?: number;
    readonly shadowIntensity?: number;
}
export interface ConfigureMmdSelfShadowDirectionalLightOptions {
    readonly mapSize?: number;
    readonly mapWidth?: number;
    readonly mapHeight?: number;
    readonly bias?: number;
    readonly normalBias?: number;
    readonly shadowIntensity?: number;
    readonly cameraLeft?: number;
    readonly cameraRight?: number;
    readonly cameraTop?: number;
    readonly cameraBottom?: number;
    readonly cameraNear?: number;
    readonly cameraFar?: number;
    readonly shadowLayer?: number;
}
export interface FitMmdSelfShadowDirectionalLightOptions {
    readonly margin?: number;
    readonly marginScale?: number;
    readonly depthMargin?: number;
    readonly minNear?: number;
    readonly minFarSpan?: number;
    readonly maxFar?: number;
    readonly updateTarget?: boolean;
}
export declare function configureMmdSelfShadowDirectionalLight(light: THREE.DirectionalLight, options?: ConfigureMmdSelfShadowDirectionalLightOptions): THREE.DirectionalLight;
export declare function fitMmdSelfShadowDirectionalLightToBox(light: THREE.DirectionalLight, box: THREE.Box3, options?: FitMmdSelfShadowDirectionalLightOptions): THREE.DirectionalLight;
export declare function applyMmdSelfShadowStateToThreeDirectionalLight(light: THREE.DirectionalLight, state: SelfShadowState | undefined, options?: ApplyMmdSelfShadowStateOptions): THREE.DirectionalLight;
