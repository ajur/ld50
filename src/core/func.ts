
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DebouncedFunction<P extends unknown[]> = (this: any, ...p: P) => void;

export function debounce<P extends unknown[]>(func: DebouncedFunction<P>, waitMS = 300): DebouncedFunction<P>  {
    let timeout: number;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, waitMS);
    }
}