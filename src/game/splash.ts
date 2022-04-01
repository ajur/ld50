import { Container, Sprite, Text } from "pixi.js";
import { display, Scene } from "~/core";

const MESSAGE = `
I'm in!
Finally, for the first time, I'm also going to participate :)
AJ
`

export class Splash extends Container implements Scene {
    
    constructor() {
        super();

        const splash = Sprite.from('ld50splash');
        splash.anchor.set(0.5);
        this.addChild(splash);

        const msg = handWriting(MESSAGE, 64);
        msg.position.y = splash.height / 2 + msg.height / 2;
        this.addChild(msg);
    }
    
    resize(width: number, height: number): void {
        this.scale.set(display.scaleDownToFit(this, width, height));
        this.position.set(width / 2, height / 2);
    }

}

function handWriting(text: string, fontSize = 32, fill = 0xf7f7f7): Text {
    const txt = new Text(text, {
        fill,
        fontSize,
        padding: fontSize / 2,
        fontFamily: "Haeresletter"
    });
    txt.anchor.set(0.5);
    return txt;
}