import { Container, DisplayObject, Graphics, Text } from 'pixi.js';

export const math = {
    clamp: (val: number, min: number, max: number): number => val < min ? min : val > max ? max : val
}

export const storage = {
    load: localStorageLoad,
    loadDefault: localStorageLoadDefault,
    save: localStorageSave
}

export const fun = {
    debounce 
}

export const display = {
    scaleToFit,
    scaleDownToFit,
    showWireframe,
    hideWireframe
}

export const text = {
    handWriting
}


function localStorageLoad<Type>(key: string): Type | undefined {
    return localStorageLoadDefault(key, undefined);
}
function localStorageLoadDefault<Type>(key: string, fallback: Type): Type {
    const saved = globalThis.localStorage.getItem(key)
    if (saved) {
        return JSON.parse(saved) as Type;
    }
    return fallback;
}

function localStorageSave<Type>(key: string, data: Type): void {
    globalThis.localStorage.setItem(key, JSON.stringify(data));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DebouncedFunction<P extends unknown[]> = (this: any, ...p: P) => void;
function debounce<P extends unknown[]>(func: DebouncedFunction<P>, waitMS = 300): DebouncedFunction<P>  {
    let timeout: number;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, waitMS);
    }
}


export function scaleToFit(obj: DisplayObject, width: number, height: number): number {
    const bounds = obj.getLocalBounds();
    const w = Math.max(1, bounds.width);
    const h = Math.max(1, bounds.height);
    return Math.min(width / w, height / h);
}

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
function showWireframe(obj: Container): void {
    const g = _wireframeGraphics.clone();
    const {x, y, width, height} = obj.getLocalBounds();
    g.position.set(x, y);
    g.width = width;
    g.height = height;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyObj = obj as any;
    anyObj._wireframe = obj.addChild(g);
}
function hideWireframe(obj: Container): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyObj = obj as any;
    if (anyObj._wireframe) {
        const g = anyObj._wireframe as Graphics
        g.destroy();
        delete anyObj._wireframe;
    }
}

function handWriting(text: string, fontSize = 32, fill = 0xe7e7e7) {
    const txt = new Text(text, {
        fill,
        fontSize,
        padding: fontSize / 2,
        fontFamily: "Haeresletter"
    });
    txt.anchor.set(0.5);
    return txt;
}