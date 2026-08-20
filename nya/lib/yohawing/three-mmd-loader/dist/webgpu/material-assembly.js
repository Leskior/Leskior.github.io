import * as THREE from "three/webgpu";
import * as TSL from "three/tsl";
import { createMmdTslToonMaterial, syncMmdTslMaterialState } from "./material-core.js";
const sourceMaterialDisposalStates = new WeakMap();
export function createMmdTslMaterialFromSource(sourceMaterial, options = {}) {
    const metadata = readMmdMaterialMetadata(sourceMaterial);
    const textures = readMmdTslTextureReferences(sourceMaterial);
    const material = createMmdTslToonMaterial({
        diffuse: readVec3(metadata.diffuse, [1, 1, 1]),
        ambient: readVec3(metadata.ambient, [0, 0, 0]),
        specular: readVec3(metadata.specular, [0, 0, 0]),
        specularPower: readFiniteNumber(metadata.specularPower, 0),
        diffuseMap: textures.diffuseMap,
        toonMap: textures.toonMap,
        sphereMap: textures.sphereMap,
        sphereMode: metadata.sphereMode ?? "none",
        // Only receiver materials participate in the dedicated pass.  Caster-only
        // and explicitly non-receiving PMX materials keep the legacy graph so the
        // dedicated visibility cannot darken them as they render into the model.
        dedicatedShadowVisibilityNode: metadata.flags?.selfShadow === true
            ? options.dedicatedShadowVisibilityNode
            : undefined,
        gammaSpaceComposite: textures.diffuseMap !== undefined ||
            textures.toonMap !== undefined ||
            textures.sphereMap !== undefined,
        legacySrgbFramebuffer: options.legacySrgbFramebuffer === true
    });
    material.userData.mmdMaterial = {
        ...metadata,
        flags: metadata.flags ? { ...metadata.flags } : undefined
    };
    material.userData.mmdTslSourceRenderFlags = {
        transparent: sourceMaterial.transparent,
        depthWrite: sourceMaterial.depthWrite
    };
    // NodeMaterial texture nodes do not expose their source textures as material
    // properties. Keep the references on userData so disposeMmdModel can apply
    // its normal ownership policy after the legacy material is released.
    material.userData.mmdTslTextureReferences = textures;
    material.userData.mmdTslSourceDiffuseTexture = textures.diffuseMap;
    material.userData.mmdTslSourceToonTexture = textures.toonMap;
    material.userData.mmdTslSourceSphereTexture = textures.sphereMap;
    material.side = sourceMaterial.side;
    // MMD renders no-cull materials in one draw. Keep that contract if a material
    // morph later changes an initially opaque material into a transparent one.
    material.forceSinglePass = metadata.flags?.doubleSided === true && sourceMaterial.side === THREE.DoubleSide;
    material.alphaTest = sourceMaterial.alphaTest;
    syncMmdTslMaterialState(material, createMaterialRuntimeStateForSource(sourceMaterial, metadata, textures.sphereMap));
    if (options.respectMaterialShadowFlags !== false && !mmdMaterialCastsShadow(metadata.flags)) {
        material.castShadowNode = TSL.Fn(() => {
            TSL.Discard();
            return TSL.vec4(0, 0, 0, 0);
        })();
    }
    return material;
}
function disposeSourceMaterialOnce(sourceMaterial) {
    let state = sourceMaterialDisposalStates.get(sourceMaterial);
    if (!state) {
        state = { disposed: false };
        sourceMaterialDisposalStates.set(sourceMaterial, state);
        const disposalState = state;
        sourceMaterial.addEventListener("dispose", () => {
            disposalState.disposed = true;
        });
    }
    const disposalState = state;
    return () => {
        if (disposalState.disposed) {
            return;
        }
        disposalState.disposed = true;
        sourceMaterial.dispose();
    };
}
export function replaceMmdModelMaterialsWithTsl(mesh, options = {}) {
    const sourceMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const nodeMaterials = sourceMaterials.map((sourceMaterial) => {
        const nodeMaterial = createMmdTslMaterialFromSource(sourceMaterial, options);
        // Replacement transfers the source material's lifetime to the node
        // material without disposing textures that remain in the TSL graph.
        nodeMaterial.addEventListener("dispose", disposeSourceMaterialOnce(sourceMaterial));
        return nodeMaterial;
    });
    mesh.material = Array.isArray(mesh.material) ? nodeMaterials : nodeMaterials[0];
    if (options.appendOutlineGroups === true) {
        appendMmdTslOutlineGroups(mesh, options);
    }
}
export function appendMmdTslOutlineGroups(mesh, options = {}) {
    const materialList = Array.isArray(mesh.material) ? [...mesh.material] : [mesh.material];
    const bodyGroups = mesh.geometry.groups.map((group) => ({
        start: group.start,
        count: group.count,
        materialIndex: group.materialIndex ?? 0
    }));
    let appended = 0;
    for (const group of bodyGroups) {
        const sourceMaterial = materialList[group.materialIndex];
        if (!sourceMaterial) {
            continue;
        }
        const metadata = readMmdMaterialMetadata(sourceMaterial);
        if (!mmdMaterialHasVisibleOutline(metadata, options.forceOutlineGroups === true)) {
            continue;
        }
        const outlineMaterial = createMmdTslOutlineMaterial(metadata, options, group.materialIndex);
        const outlineMaterialIndex = materialList.length;
        materialList.push(outlineMaterial);
        mesh.geometry.addGroup(group.start, group.count, outlineMaterialIndex);
        appended += 1;
    }
    if (appended > 0) {
        mesh.material = materialList;
    }
    return appended;
}
function createMmdTslOutlineMaterial(metadata, options, sourceMaterialIndex) {
    const force = options.forceOutlineGroups === true;
    const edgeColor = mmdTslOutlineColor(metadata, force);
    const outlineWidth = mmdTslOutlineWidth(metadata, force);
    const polygonOffsetSign = options.reversedDepth === true ? -1 : 1;
    const outlineUniforms = {
        color: new THREE.Vector3(edgeColor[0], edgeColor[1], edgeColor[2]),
        opacity: TSL.uniform(edgeColor[3], "float"),
        width: TSL.uniform(outlineWidth, "float")
    };
    const material = new THREE.MeshBasicNodeMaterial({
        color: new THREE.Color(edgeColor[0], edgeColor[1], edgeColor[2]),
        opacity: edgeColor[3],
        transparent: true,
        side: THREE.BackSide,
        depthWrite: true,
        depthTest: true,
        polygonOffset: true,
        polygonOffsetFactor: polygonOffsetSign * (1 + 2 * outlineWidth),
        polygonOffsetUnits: polygonOffsetSign * 1,
        toneMapped: false
    });
    material.colorNode = TSL.uniform(outlineUniforms.color);
    material.opacityNode = outlineUniforms.opacity;
    material.vertexNode = createMmdTslScreenSpaceOutlineVertexNode(outlineUniforms.width);
    material.castShadowNode = TSL.Fn(() => {
        TSL.Discard();
        return TSL.vec4(0, 0, 0, 0);
    })();
    material.castShadowPositionNode = TSL.positionLocal;
    material.userData.mmdTslOutlineMaterial = {
        sourceMaterialIndex,
        fallback: force,
        sourceEdgeSize: metadata.edgeSize ?? 0,
        edgeColor,
        flags: metadata.flags ? { ...metadata.flags } : undefined,
        shaderApplied: true,
        uniforms: outlineUniforms,
        polygonOffsetSign
    };
    return material;
}
function createMmdTslScreenSpaceOutlineVertexNode(outlineWidth) {
    const outlineWidthNode = outlineWidth;
    const mvp = TSL.cameraProjectionMatrix.mul(TSL.modelViewMatrix);
    const outlineNormal = TSL.normalLocal.negate();
    const pos = mvp.mul(TSL.vec4(TSL.positionLocal, 1));
    const pos2 = mvp.mul(TSL.vec4(TSL.positionLocal.add(outlineNormal), 1));
    const projectedNormal = pos.xy.sub(pos2.xy);
    const projectedNormalLength = TSL.length(projectedNormal);
    const direction = projectedNormal.div(TSL.max(projectedNormalLength, TSL.float(1e-6)));
    const devicePixelWidth = outlineWidthNode.mul(TSL.screenDPR);
    const clipOffset = direction
        .mul(devicePixelWidth)
        .mul(TSL.float(2))
        .div(TSL.viewportSize)
        .mul(pos.w);
    return pos.add(TSL.vec4(clipOffset, 0, 0));
}
function createMaterialRuntimeStateForSource(sourceMaterial, metadata, sphereTexture) {
    const existingState = sourceMaterial.userData.mmdMaterialState;
    if (existingState) {
        return existingState;
    }
    return {
        diffuse: readVec4(metadata.diffuse, [1, 1, 1, sourceMaterial.opacity]),
        specular: readVec3(metadata.specular, [0, 0, 0]),
        specularPower: readFiniteNumber(metadata.specularPower, 0),
        ambient: readVec3(metadata.ambient, [0, 0, 0]),
        edgeColor: [0, 0, 0, 1],
        edgeSize: 1,
        textureFactor: [1, 1, 1, 1],
        sphereTextureFactor: sphereTexture ? [1, 1, 1, 1] : [0, 0, 0, 0],
        toonTextureFactor: [1, 1, 1, 1]
    };
}
function readMmdMaterialMetadata(material) {
    return (material.userData.mmdMaterial ?? {});
}
function readMmdSphereTexture(material) {
    const userData = material.userData;
    return userData.mmdSphereMap?.texture ?? userData.mmdSphereTexture;
}
function readMmdTslTextureReferences(material) {
    const source = material;
    const userData = material.userData;
    const retained = userData.mmdTslTextureReferences;
    return {
        diffuseMap: source.map ?? retained?.diffuseMap,
        toonMap: source.gradientMap ?? retained?.toonMap,
        sphereMap: readMmdSphereTexture(material) ?? retained?.sphereMap
    };
}
function mmdMaterialCastsShadow(flags) {
    return flags?.groundShadow === true || flags?.selfShadowMap === true;
}
function mmdMaterialHasVisibleOutline(metadata, force) {
    const edgeColor = mmdTslOutlineColor(metadata, force);
    return (force || metadata.flags?.edge === true) && mmdTslOutlineWidth(metadata, force) > 0 && edgeColor[3] > 0;
}
function mmdTslOutlineWidth(metadata, force) {
    const width = metadata.edgeSize ?? 0;
    return Math.max(force && width <= 0 ? 0.5 : width, 0);
}
function mmdTslOutlineColor(metadata, force) {
    const edgeColor = readVec4(metadata.edgeColor, [0, 0, 0, 1]);
    return force && edgeColor[3] <= 0 ? [edgeColor[0], edgeColor[1], edgeColor[2], 1] : edgeColor;
}
function readVec3(value, fallback) {
    return value && value.length >= 3
        ? [value[0] ?? fallback[0], value[1] ?? fallback[1], value[2] ?? fallback[2]]
        : [fallback[0], fallback[1], fallback[2]];
}
function readVec4(value, fallback) {
    return value && value.length >= 4
        ? [
            value[0] ?? fallback[0],
            value[1] ?? fallback[1],
            value[2] ?? fallback[2],
            value[3] ?? fallback[3]
        ]
        : [fallback[0], fallback[1], fallback[2], fallback[3]];
}
function readFiniteNumber(value, fallback) {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
