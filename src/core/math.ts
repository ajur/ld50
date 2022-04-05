import { IPointData, ISize } from "pixi.js";
import { IRect } from "./interfaces";

export const clamp = (val: number, min: number, max: number): number => (
    val < min ? min : val > max ? max : val
);

export function center(x: number, y: number, width: number, height: number): IPointData;
export function center(pos: IPointData, size: ISize): IPointData;
export function center(rect: IRect): IPointData;
export function center(x: number | IPointData | IRect, y?: number | ISize, width?: number, height?: number): IPointData {
    if ((x as IRect).width != undefined) {
        return getCenter(x as IRect);
    }
    if ((x as IPointData).y != undefined && (y as ISize).width != undefined) {
        return getCenter({...(x as IPointData), ...(y as ISize)});
    }
    return getCenter({x, y, width, height} as IRect);
}
function getCenter({x, y, width, height}: IRect): IPointData {
    return {
        x: x + width / 2,
        y: y + height / 2
    }
}
