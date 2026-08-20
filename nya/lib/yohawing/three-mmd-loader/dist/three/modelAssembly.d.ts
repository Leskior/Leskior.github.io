import type { ParsedPmd } from "../parser/model/PmdModelParser.js";
import type { ParsedPmx } from "../parser/model/PmxModelParser.js";
import type { MmdModel } from "../parser/model/modelTypes.js";
import type { LoaderMmdModelData } from "./internalModelData.js";
export type ParsedMmdModel = ParsedPmx | ParsedPmd;
export declare function parseLoaderMmdModelData(bytes: Uint8Array): LoaderMmdModelData;
export declare function createLoaderMmdModelDataFromModel(model: MmdModel): LoaderMmdModelData;
