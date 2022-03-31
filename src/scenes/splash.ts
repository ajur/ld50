import { Container, Sprite } from "pixi.js";
import { Scene } from "../interfaces";
import { scaleDownToFit, text } from "../utils";


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

        const msg = text.handWriting(MESSAGE, 64);
        msg.position.y = splash.height / 2 + msg.height / 2;
        this.addChild(msg);
    }
    
    resize(width: number, height: number): void {
        this.scale.set(scaleDownToFit(this, width, height));
        this.position.set(width / 2, height / 2);
    }

}