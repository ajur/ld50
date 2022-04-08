import TaggedText from "pixi-tagged-text";
import { Text } from "pixi.js";
import { COLORS, COLOR_TEXT } from "~/consts";
import { timeCounterFormatter } from "./hud";
import { Modal } from "./Modal";


export interface GameSummaryParams {
    resolved: number,
    left: number,
    guests: number,
    time: number
}

export class GameOver extends Modal {
    title: Text;
    popupText: TaggedText;
    
    
    constructor(params: GameSummaryParams) {
        super();

        this.title = this.addContent(this.createTitle());
        this.popupText = this.addContent(this.createSummary(params.time));
    }

    private createSummary(time: number): TaggedText {
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

    private createTitle(): Text {
        const title = new Text("You're GROUNDED!", {
            fill: COLORS.RED,
            fontSize: 92,
            stroke: 0xffffff,
            strokeThickness: 5,
            padding: 10,
            fontFamily: "Haeresletter",
            align: "center"
        });
        title.anchor.set(0.5);
        title.position.y = -100;
        title.rotation = -0.1;
        return title;
    }
}


