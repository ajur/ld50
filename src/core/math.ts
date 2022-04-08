import { IPointData, ISize, Rectangle } from "pixi.js";
import { IRect } from "./interfaces";

const {abs} = Math;
const EPSILON = Number.EPSILON;

export const withinEpsilon = (v1: number, v2: number): boolean => (
    abs(v1 - v2) < EPSILON
);

export const clamp = (val: number, min: number, max: number): number => (
    val < min ? min : val > max ? max : val
);

export function center(x: number, y: number, width: number, height: number): IPointData;
export function center(pos: IPointData, size: ISize): IPointData;
export function center(rect: IRect): IPointData;
export function center(x: number | IPointData | IRect, y?: number | ISize, width?: number, height?: number): IPointData {
    if ((x as IRect).width != undefined) {
        return _center(x as IRect);
    }
    if ((x as IPointData).y != undefined && (y as ISize).width != undefined) {
        return _center({...(x as IPointData), ...(y as ISize)});
    }
    return _center({x, y, width, height} as IRect);
}

function _center({x, y, width, height}: IRect): IPointData {
    return {
        x: x + width / 2,
        y: y + height / 2
    }
}

export class Rect extends Rectangle {
    get cx() {
        return this.x + this.width / 2;
    }
    get cy() {
        return this.y + this.height / 2;
    }
}
