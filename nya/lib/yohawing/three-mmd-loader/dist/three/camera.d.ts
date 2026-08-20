import * as THREE from "three";
import type { CameraState } from "../parser/model/modelTypes.js";
export interface ApplyMmdCameraStateOptions {
    readonly target?: THREE.Vector3;
    readonly offset?: THREE.Vector3;
    readonly euler?: THREE.Euler;
    readonly quaternion?: THREE.Quaternion;
    readonly up?: THREE.Vector3;
    readonly lookAt?: THREE.Vector3;
    readonly outsideParent?: THREE.Object3D;
    readonly outsideParentWorldPosition?: THREE.Vector3;
    readonly outsideParentScratch?: THREE.Vector3;
    readonly minFov?: number;
    readonly minOrthographicHeight?: number;
    readonly aspect?: number;
    readonly orthographicCamera?: THREE.OrthographicCamera;
}
export declare function applyMmdCameraStateToThreeCamera(camera: THREE.PerspectiveCamera, state: CameraState, options?: ApplyMmdCameraStateOptions): THREE.PerspectiveCamera | THREE.OrthographicCamera;
