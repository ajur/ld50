import { Container, DisplayObject, Sprite, Texture } from "pixi.js";
import { COLORS } from "~/consts";
import { Scene } from "~/core";
import { scaleDownToFit } from "~/core/display";

export class Modal extends Container implements Scene {
    protected bkg: Sprite;
    protected content: Container;

    constructor(color = COLORS.BLACK, alpha = 0.8) {
        super();
        this.bkg = this.addBackground(color, alpha);
        this.content = this.addChild(new Container());
    }

    resize(width: number, height: number): void {
        this.position.set(width / 2, height / 2);
        this.bkg.width = width;
        this.bkg.height = height;
        this.content.scale.set(scaleDownToFit(this.content, width, height));
    }

    protected addContent<T extends DisplayObject>(obj: T): T {
        return this.content.addChild(obj);
    }

    private addBackground(color: number, alpha: number) {
        const spr = Sprite.from(Texture.WHITE);
        spr.anchor.set(0.5);
        spr.width = 500;
        spr.height = 400;
        spr.alpha = alpha;
        spr.tint = color;
        return this.addChild(spr);
    }
}
