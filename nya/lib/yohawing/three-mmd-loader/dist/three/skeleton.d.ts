import * as THREE from "three";
export interface ThreeMmdSkeletonBone {
    readonly name: string;
    readonly englishName: string;
    readonly ikStateName?: string;
    readonly parentIndex: number;
    readonly position: readonly [number, number, number];
    readonly ik?: {
        readonly targetIndex: number;
        readonly loopCount: number;
        readonly limitAngle: number;
        readonly links: readonly {
            readonly boneIndex: number;
            readonly limits?: {
                readonly kind?: "pmdKnee";
                readonly lower: [number, number, number];
                readonly upper: [number, number, number];
            };
        }[];
    };
    readonly appendTransform?: {
        readonly parentIndex: number;
        readonly weight: number;
    };
    readonly flags?: {
        readonly appendLocal?: boolean;
        readonly appendRotate?: boolean;
        readonly appendTranslate?: boolean;
        readonly transformAfterPhysics?: boolean;
        readonly hasLocalAxis?: boolean;
        readonly hasFixedAxis?: boolean;
        readonly enabled?: boolean;
    };
    readonly localAxis?: {
        readonly x: [number, number, number];
        readonly z: [number, number, number];
    };
    readonly fixedAxis?: [number, number, number];
    readonly layer?: number;
}
export interface ThreeMmdSkeletonData {
    readonly bones: readonly ThreeMmdSkeletonBone[];
}
export declare function createThreeSkeleton(skeletonData: ThreeMmdSkeletonData): THREE.Skeleton;
