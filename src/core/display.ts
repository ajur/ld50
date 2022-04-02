import { DisplayObject, Graphics } from "pixi.js";


/** return obj scale to fill given dimensions */
export function scaleToFit(obj: DisplayObject, width: number, height: number): number {
    const bounds = obj.getLocalBounds();
    const w = Math.max(1, bounds.width);
    const h = Math.max(1, bounds.height);
    return Math.min(width / w, height / h);
}

/** return obj scale to fit given dimensions */
export function scaleDownToFit(...params: Parameters<typeof scaleToFit>): number {
    return Math.min(1, scaleToFit(...params));
}


const _wireframeGraphics: Graphics = (()=>{
    const g = new Graphics();
    g.lineStyle(1, 0xffffff, 1, 0, true);
    g.moveTo(0,0);
    g.lineTo(1,0);
    g.lineTo(1,1);
    g.lineTo(0,1);
    g.lineTo(0,0);
    g.lineTo(1,1);
    return g;
})();

/** add wireframe bounding box to Container */
export function displayObjectWireframe(obj: DisplayObject): Graphics {
    const g = _wireframeGraphics.clone();
    const {x, y, width, height} = obj.getLocalBounds();
    g.position.set(x, y);
    g.width = width;
    g.height = height;
    return g;
}

export interface RectWireframeOptions {
    width: number,
    height?: number,
    x?: number,
    y?: number,
    color?: number,
    alpha?: number
}

export function rectWireframe({
    width, height = width, x = 0, y = 0, color = 0x0, alpha = 0.2
}: RectWireframeOptions): Graphics {
    const w2 = width / 2;
    const h2 = height / 2;
    
    const g = new Graphics();
    g.lineStyle(1, color, 1, 0, true);

    g.moveTo(0, 0);
    g.lineTo(-w2, -h2);
    g.lineTo(w2, -h2);
    g.lineTo(w2, h2);
    g.lineTo(-w2, h2);
    g.lineTo(-w2, -h2);

    g.beginFill(color, alpha);
    g.drawRect(-w2, -h2, w2*2, h2*2)
    g.endFill();

    g.position.set(x, y);

    return g;
}

export interface CircleWireframeOptions {
    radius: number,
    x?: number,
    y?: number,
    color?: number,
    alpha?: number
}

export function circleWireframe({
    radius, x = 0, y = 0, color = 0x0, alpha = 0.2
}: CircleWireframeOptions): Graphics {

    const g = new Graphics();
    g.lineStyle(1, color, 1, 0, true);

    g.moveTo(0, 0);
    g.lineTo(radius, 0);
    g.drawCircle(0, 0, radius);

    g.beginFill(color, alpha);
    g.drawCircle(0, 0, radius);
    g.endFill();

    g.position.set(x, y);

    return g;
}
