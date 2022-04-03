import { Container, Text } from "pixi.js";
import { COLORS, COLOR_TEXT } from "~/consts";
import { msg, Scene } from "~/core";



export class HUD extends Container implements Scene {
    issuesCounter: Text;
    
    constructor() {
        super();

        this.issuesCounter = this.addCounter("active issues", "issuesCounterChanged", -10, COLORS.RED);
        this.issuesCounter = this.addCounter("resolved issues", "resolvedIssuesCounterChanged", -130, COLORS.GREEN, 0.8);
        this.issuesCounter = this.addCounter("guests", "guestsCountChanged", -250, COLORS.VIOLET, 0.8);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    resize(width: number, height: number): void {
        // allign top right
        this.position.set(width, 0);
    }

    private addCounter(labelText: string, updateEvent: string, xPos: number, tint: number, scale = 1): Text {
        const label = hudText(labelText, 32);
        label.anchor.set(1, 1);
        label.position.set(xPos, 28)
        label.scale.set(scale);
        
        const counter = hudText("0", 64, tint);
        counter.anchor.set(1, 0);
        counter.position.set(xPos, 10);
        counter.scale.set(scale);

        msg.on(updateEvent, (count) => {
            counter.text = '' + count;
        })
        
        this.addChild(counter, label);
        return counter;
    }
}


function hudText(text: string, fontSize = 32, fill = COLOR_TEXT): Text {
    const txt = new Text(text, {
        fill,
        fontSize,
        stroke: 0xffffff,
        strokeThickness: 2,
        padding: 10,
        fontFamily: "Haeresletter"
    });
    txt.anchor.set(0.5);
    return txt;
}