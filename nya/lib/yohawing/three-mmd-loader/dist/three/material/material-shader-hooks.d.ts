import type { MaterialInfo } from "../../parser/model/modelTypes.js";
import * as THREE from "three";
export declare function attachMmdMaterialFactors(material: THREE.Material): void;
export declare function materialHasTextureMap(material: THREE.Material): material is THREE.Material & {
    map: THREE.Texture;
};
export declare function attachMmdSphereTexture(material: THREE.Material, sphereMode: MaterialInfo["sphereMode"], texture: THREE.Texture | undefined): void;
export declare function mmdSphereModeToUniform(sphereMode: MaterialInfo["sphereMode"]): number;
