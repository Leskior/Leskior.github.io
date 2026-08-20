import type { MaterialRuntimeState } from "../../parser/model/modelTypes.js";
import * as THREE from "three";
export declare function syncMmdMaterialStates(materials: THREE.Material | THREE.Material[], states: readonly MaterialRuntimeState[]): void;
export declare function syncMmdSpecularDirection(material: THREE.Material | THREE.Material[], lightDirection: THREE.Vector3 | THREE.DirectionalLight): void;
