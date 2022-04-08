import TaggedText from "pixi-tagged-text";
import { Text } from "pixi.js";
import { COLORS, COLOR_GUEST, COLOR_HARD_ISSUE, COLOR_ISSUE } from "~/consts";
import { msg } from "~/core";
import { Modal } from "./Modal";



export class Intro extends Modal {
    
    title: Text;
    popupText: TaggedText;

    constructor() {
        super();
        this.title = this.addContent(this.createTitle());
        this.popupText = this.addContent(this.createIntro());

        this.on("pointerdown", this.close, this);
        msg.on("keydown", this.close, this);
        this.interactive = true;
    }

    private close() {
        msg.off("keydown", this.close, this);
        msg.emit("gameStart");
        this.destroy();
    }

    private createIntro(): TaggedText {
        const text = new TaggedText(`
Your birthday party startet to go slightly out of hand,
new and unknown <g>guests</g> are still comming,
making more mess than you imagined.
But hay, it's still managable... for now.

Handle <i>issues</i> and fix <hi>broken stuff</hi>,
to delay the moment you'r parents are called.

How long can you make the party going?
`, {
            default: {
                fill: COLORS.WHITE,
                fontSize: 32,
                stroke: COLORS.BLACK,
                strokeThickness: 2,
                padding: 10,
                fontFamily: "Haeresletter",
                align: "justify-center"
            },
            g: {
                fill: COLOR_GUEST,
                stroke: COLORS.WHITE,
            },
            i: {
                fill: COLOR_ISSUE,
            },
            hi: {
                fill: COLOR_HARD_ISSUE,
            },
        }, {debug: true});
        const {width, height} = text.getBounds();
        text.position.set(-width / 2, -height / 2 + 70);
        text.debugContainer.destroy(); // hack to get proper bounds
        return this.addChild(text);
    }

    private createTitle(): Text {
        const title = new Text("It's Party Time!", {
            fill: COLORS.RED,
            fontSize: 92,
            stroke: 0xffffff,
            strokeThickness: 5,
            padding: 15,
            fontFamily: "Haeresletter",
            align: "center"
        });
        title.anchor.set(0.5);
        title.position.y = -130;
        title.rotation = -0.1;
        return title;
    }
}
