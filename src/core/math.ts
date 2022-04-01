
export const clamp = (val: number, min: number, max: number): number => (
    val < min ? min : val > max ? max : val
);
