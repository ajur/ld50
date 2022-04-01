import { Container, DisplayObject, Graphics } from "pixi.js";


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
export function showWireframe(obj: Container): void {
    const g = _wireframeGraphics.clone();
    const {x, y, width, height} = obj.getLocalBounds();
    g.position.set(x, y);
    g.width = width;
    g.height = height;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyObj = obj as any;
    anyObj._wireframe = obj.addChild(g);
}

/** remove wireframe if there was any added by `addWireframe` */
export function hideWireframe(obj: Container): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyObj = obj as any;
    if (anyObj._wireframe) {
        const g = anyObj._wireframe as Graphics
        g.destroy();
        delete anyObj._wireframe;
    }
}