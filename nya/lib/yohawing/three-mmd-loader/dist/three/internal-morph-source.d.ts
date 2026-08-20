import type * as THREE from "three";
import type { ThreeMmdGeometryMorph } from "./geometry.js";
export declare function setMmdGeometryMorphSource(geometry: THREE.BufferGeometry, morphs: readonly ThreeMmdGeometryMorph[]): void;
export declare function getMmdGeometryMorphSource(geometry: THREE.BufferGeometry): readonly ThreeMmdGeometryMorph[] | undefined;
