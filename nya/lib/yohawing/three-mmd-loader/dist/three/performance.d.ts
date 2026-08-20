export interface LoaderPerformanceMeasure {
    readonly label: string;
    readonly name: string;
    readonly durationMs: number;
}
export interface LoaderPerformanceOptions {
    readonly enabled?: boolean;
    readonly onMeasure?: (measure: LoaderPerformanceMeasure) => void;
}
interface LoaderPerformanceProfile {
    readonly measures: readonly LoaderPerformanceMeasure[];
    mark(name: string): void;
    measure(name: string, start: string, end: string): void;
    clear(): void;
}
export declare function createLoaderPerformanceProfile(label: string, options?: LoaderPerformanceOptions): LoaderPerformanceProfile | undefined;
export {};
