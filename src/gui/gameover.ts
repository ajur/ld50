import TaggedText from "pixi-tagged-text";
import { Container, Sprite, Text, Texture } from "pixi.js";
import { COLORS, COLOR_TEXT } from "~/consts";
import { Scene } from "~/core";
import { scaleDownToFit } from "~/core/display";
import { timeCounterFormatter } from "./hud";


export interface GameSummaryParams {
    resolved: number,
    left: number,
    guests: number,
    time: number
}

export class GameOver extends Container implements Scene {
    bkg: Sprite;
    title: Text;
    popupText: TaggedText;
    
    
    constructor(params: GameSummaryParams) {
        super();

        this.bkg = this.addBackground();
        this.title = this.addTitle();
        this.popupText = this.addSummary(params.time);
    }

    resize(width: number, height: number): void {
        this.position.set(width / 2, height / 2);
        this.scale.set(scaleDownToFit(this, width, height));
    }

    private addSummary(time: number): TaggedText {
        const text = new TaggedText(`
But hey, at least you managed to
<topic>delay the inevitable</topic>
by <time>${timeCounterFormatter(time)}</time> minutes!
Congrats!`, {
            default: {
                fill: COLOR_TEXT,
                fontSize: 40,
                stroke: COLORS.WHITE,
                strokeThickness: 2,
                padding: 10,
                fontFamily: "Haeresletter",
                align: "justify-center"
            },
            topic: {
                fill: COLORS.GREEN,
                stroke: COLORS.BLACK
            },
            time: {
                fill: COLORS.BLUE,
                fontSize: 64,
                strokeThickness: 4,
            }
        }, {debug: true});
        const {width, height} = text.getBounds();
        text.position.set(-width / 2, -height / 2 + 50);
        text.debugContainer.destroy(); // hack to get proper bounds
        return this.addChild(text);
    }

    private addTitle(): Text {
        const title = this.addChild(new Text("You're GROUNDED!", {
            fill: COLORS.RED,
            fontSize: 92,
            stroke: 0xffffff,
            strokeThickness: 5,
            padding: 10,
            fontFamily: "Haeresletter",
            align: "center"
        }));
        title.anchor.set(0.5);
        title.position.y = -100;
        title.rotation = -0.1;
        return title;
    }

    private addBackground() {
        const spr = Sprite.from(Texture.WHITE);
        spr.anchor.set(0.5);
        spr.width = 500;
        spr.height = 400;
        spr.alpha = 0.5;
        spr.tint = COLORS.BLACK;
        return this.addChild(spr);
    }
}