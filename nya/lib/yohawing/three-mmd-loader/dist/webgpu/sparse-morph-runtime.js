import * as TSL from "three/tsl";
import { getMmdGeometryMorphSource } from "../three/internal-morph-source.js";
import { packMmdPositionMorphsToVertexCsr, packMmdUvMorphsToVertexCsr } from "./sparse-morph.js";
const sparsePositionMorphStates = new WeakMap();
export function enableMmdTslSparsePositionMorphs(mesh) {
    if (sparsePositionMorphStates.has(mesh)) {
        return true;
    }
    const morphs = getMmdGeometryMorphSource(mesh.geometry);
    const position = mesh.geometry.getAttribute("position");
    const influences = mesh.morphTargetInfluences;
    if (!morphs || !(position?.array instanceof Float32Array) || !influences) {
        return false;
    }
    const vertexCount = position.count;
    const weights = new Float32Array(morphs.length);
    const weightsAttributes = [];
    const storageAttributes = [];
    const computeNodes = [];
    const replacedAttributes = [];
    const packedPosition = packMmdPositionMorphsToVertexCsr(vertexCount, morphs);
    if (packedPosition.morphIndices.length > 0) {
        const output = createSparseMorphCompute(position, packedPosition, weights, "vec3");
        replacedAttributes.push(captureSparseMorphAttribute(mesh.geometry, "position", position));
        mesh.geometry.setAttribute("position", output.attribute);
        mesh.geometry.morphAttributes.position = [];
        computeNodes.push(output.computeNode);
        weightsAttributes.push(output.weightsAttribute);
        storageAttributes.push(...output.storageAttributes);
    }
    const uv = mesh.geometry.getAttribute("uv");
    if (uv?.array instanceof Float32Array) {
        appendUvCompute(mesh.geometry, "uv", uv, packMmdUvMorphsToVertexCsr(vertexCount, morphs), weights, computeNodes, weightsAttributes, storageAttributes, replacedAttributes);
    }
    for (let uvIndex = 0; uvIndex < 4; uvIndex += 1) {
        const attributeName = `uv${uvIndex + 1}`;
        const attribute = mesh.geometry.getAttribute(attributeName);
        if (attribute?.array instanceof Float32Array) {
            appendUvCompute(mesh.geometry, attributeName, attribute, packMmdUvMorphsToVertexCsr(vertexCount, morphs, uvIndex), weights, computeNodes, weightsAttributes, storageAttributes, replacedAttributes);
        }
    }
    if (computeNodes.length === 0)
        return false;
    sparsePositionMorphStates.set(mesh, {
        computeNodes,
        weights,
        weightsAttributes,
        storageAttributes,
        replacedAttributes
    });
    return true;
}
/** Restores the replaced dense attributes and disposes the public compute nodes. */
export function disposeMmdTslSparsePositionMorphs(mesh) {
    const state = sparsePositionMorphStates.get(mesh);
    if (!state) {
        return false;
    }
    const morphAttributes = mesh.geometry.morphAttributes;
    for (const replacedAttribute of state.replacedAttributes) {
        mesh.geometry.setAttribute(replacedAttribute.name, replacedAttribute.attribute);
        if (replacedAttribute.hadMorphAttributes) {
            morphAttributes[replacedAttribute.name] = replacedAttribute.morphAttributes;
        }
        else {
            delete morphAttributes[replacedAttribute.name];
        }
    }
    // Node.dispose() is the supported Three.js lifecycle hook for compute-node
    // bindings and pipelines. StorageBufferAttribute has no public dispose API;
    // after restoring the geometry and dropping this state, those temporary
    // attributes are no longer strongly reachable by this integration.
    for (const computeNode of state.computeNodes) {
        computeNode.dispose();
    }
    for (const storageAttribute of state.storageAttributes) {
        storageAttribute.dispose();
    }
    state.computeNodes.length = 0;
    state.weightsAttributes.length = 0;
    state.storageAttributes.length = 0;
    state.replacedAttributes.length = 0;
    sparsePositionMorphStates.delete(mesh);
    return true;
}
export function computeMmdTslSparsePositionMorphs(renderer, mesh) {
    const state = sparsePositionMorphStates.get(mesh);
    if (!state) {
        return false;
    }
    if (renderer.backend?.isWebGPUBackend !== true) {
        throw new Error("MMD_TSL_SPARSE_POSITION_MORPH_REQUIRES_WEBGPU");
    }
    const influences = mesh.morphTargetInfluences;
    for (let index = 0; index < state.weights.length; index += 1) {
        state.weights[index] = influences?.[index] ?? 0;
    }
    for (const attribute of state.weightsAttributes) {
        attribute.needsUpdate = true;
    }
    const onlyComputeNode = state.computeNodes[0];
    renderer.compute(state.computeNodes.length === 1 && onlyComputeNode ? onlyComputeNode : state.computeNodes);
    return true;
}
function appendUvCompute(geometry, attributeName, base, packed, weights, computeNodes, weightsAttributes, storageAttributes, replacedAttributes) {
    if (packed.morphIndices.length === 0)
        return;
    const nodeType = base.itemSize === 2 ? "vec2" : "vec4";
    const output = createSparseMorphCompute(base, packed, weights, nodeType);
    replacedAttributes.push(captureSparseMorphAttribute(geometry, attributeName, base));
    geometry.setAttribute(attributeName, output.attribute);
    geometry.morphAttributes[attributeName] = [];
    computeNodes.push(output.computeNode);
    weightsAttributes.push(output.weightsAttribute);
    storageAttributes.push(...output.storageAttributes);
}
function captureSparseMorphAttribute(geometry, name, attribute) {
    return {
        name,
        attribute,
        morphAttributes: geometry.morphAttributes[name],
        hadMorphAttributes: Object.prototype.hasOwnProperty.call(geometry.morphAttributes, name)
    };
}
/** Zero-vector constructors keyed by TSL node type, used to seed the per-vertex accumulator. */
const zeroVectorByNodeType = {
    vec2: () => TSL.vec2(0),
    vec3: () => TSL.vec3(0),
    vec4: () => TSL.vec4(0)
};
// TSL.attributeArray is overloaded per literal node-type string; a union-typed
// nodeType parameter can't select an overload directly, so this lookup table
// pins each branch to its own literal call (same runtime behavior as the
// former per-arity functions, just keyed instead of triplicated).
const vecAttributeArrayByNodeType = {
    vec2: (count) => TSL.attributeArray(count, "vec2"),
    vec3: (count) => TSL.attributeArray(count, "vec3"),
    vec4: (count) => TSL.attributeArray(count, "vec4")
};
function createSparseMorphCompute(base, packed, weights, nodeType) {
    const makeVecAttributeArray = vecAttributeArrayByNodeType[nodeType];
    const weightStorage = TSL.attributeArray(weights, "float");
    const baseStorage = makeVecAttributeArray(base.array);
    const rowOffsetStorage = TSL.attributeArray(packed.rowOffsets, "uint");
    const morphIndexStorage = TSL.attributeArray(packed.morphIndices, "uint");
    const valueStorage = makeVecAttributeArray(packed.values);
    const baseValues = baseStorage.toReadOnly();
    const rowOffsets = rowOffsetStorage.toReadOnly();
    const morphIndices = morphIndexStorage.toReadOnly();
    const values = valueStorage.toReadOnly();
    const outputValues = makeVecAttributeArray(base.count);
    const makeZeroVector = zeroVectorByNodeType[nodeType];
    const computeNode = TSL.Fn(() => {
        const vertexIndex = TSL.instanceIndex;
        const delta = makeZeroVector().toVar();
        TSL.Loop({ start: rowOffsets.element(vertexIndex), end: rowOffsets.element(vertexIndex.add(1)), type: "uint", condition: "<" }, ({ i }) => {
            const entryMorphIndex = morphIndices.element(i);
            delta.addAssign(values.element(i).mul(weightStorage.element(entryMorphIndex)));
        });
        outputValues.element(vertexIndex).assign(baseValues.element(vertexIndex).add(delta));
    })().compute(base.count);
    return {
        attribute: outputValues.value,
        computeNode,
        weightsAttribute: weightStorage.value,
        storageAttributes: [
            weightStorage.value,
            baseStorage.value,
            rowOffsetStorage.value,
            morphIndexStorage.value,
            valueStorage.value,
            outputValues.value
        ]
    };
}
