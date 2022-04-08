
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DebouncedFunction<P extends unknown[]> = (this: any, ...p: P) => void;

export function debounce<P extends unknown[]>(func: DebouncedFunction<P>, waitMS = 300): DebouncedFunction<P>  {
    let timeout: number;
    return function(...args) {
        window.clearTimeout(timeout);
        timeout = window.setTimeout(() => {
            func.apply(this, args);
        }, waitMS);
    }
}

export function enumFromStringValue<T>(enm: { [s: string]: T }, value: string): T {
    const e = enumFromString(enm, value);
    if (e) {
        return e;
    }
    throw new Error("Unknown enum " + enm + " value " + value)
}

export function enumFromString<T>(enm: { [s: string]: T }, value: string): T | undefined {
    if (enumIncludes(enm, value)) {
        return value as unknown as T;
    } else {
        return undefined;
    }
}

export function enumIncludes<T>(enm: { [s: string]: T }, value: string): boolean {
    return (Object.values(enm) as unknown as string[]).includes(value);
}
