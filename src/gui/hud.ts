import { Container, Sprite, Text, Texture } from "pixi.js";
import { COLORS, COLOR_TEXT } from "~/consts";
import { msg, Scene } from "~/core";


export class HUD extends Container implements Scene {
    issuesCounter: Container;
    resolvedCounter: Container;
    guestsCounter: Container;
    
    timer: Container;

    groundedProgress: ProgressBar;
    
    constructor() {
        super();

        this.issuesCounter = this.addCounter("issues", "issuesCounterChanged", COLORS.RED);
        this.resolvedCounter = this.addCounter("solved", "resolvedIssuesCounterChanged", COLORS.GREEN);
        this.guestsCounter = this.addCounter("guests", "guestsCountChanged", COLORS.VIOLET);

        this.timer = this.addCounter("party time", "playTimeUpdated", COLORS.WHITE, 0.5, timeCounterFormatter);

        this.groundedProgress = this.addProgressBar("chaos level", "groundedProgressChanged");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    resize(width: number, height: number): void {
        // allign top right
        this.position.set(width, 0);

        this.timer.position.set(-width / 2, 5);

        if (width / height < 1.4) {
            this.issuesCounter.position.set(-10, 5)
        
            this.resolvedCounter.scale.set(0.8);
            this.resolvedCounter.position.set(-75, 10)
            
            this.guestsCounter.scale.set(0.8);
            this.guestsCounter.position.set(-125, 10);

            this.groundedProgress.rotation = Math.PI / 2;
            this.groundedProgress.position.set(-10, 80);
        }
        else {
            this.issuesCounter.position.set(-10, 20)
        
            this.resolvedCounter.scale.set(0.8);
            this.resolvedCounter.position.set(-10, 85)
            
            this.guestsCounter.scale.set(0.8);
            this.guestsCounter.position.set(-10, 135);

            this.groundedProgress.rotation = Math.PI;
            this.groundedProgress.position.set(-10, 15);

            const progressMaxSize = width / 2 - this.timer.width;
            if (progressMaxSize < this.groundedProgress.width) {
                this.groundedProgress.length = progressMaxSize;
            }
        }
    }

    private addCounter(labelText: string, updateEvent: string, tint: number, anchorX = 1, formatUpdate = simpleCounterFormatter): Container {
        const container = new Container();
        
        const label = hudText(labelText, 32);
        label.position.set(0, 28);
        label.anchor.set(anchorX, 1);
        
        const counter = hudText("0", 64, tint);
        counter.position.set(0, 10);
        counter.anchor.set(anchorX, 0);        

        msg.on(updateEvent, (count) => {
            counter.text = formatUpdate(count);
        })
        
        container.addChild(counter, label);
        return this.addChild(container);
    }

    private addProgressBar(labelText: string, updateEvent: string): ProgressBar {
        const bar = new ProgressBar(300);

        msg.on(updateEvent, (progress: number) => {
            bar.progress = progress;
        });

        return this.addChild(bar);
    }
}

function simpleCounterFormatter(count: number): string {
    return '' + count;
}

export function timeCounterFormatter(count: number): string {
    const countSeconds = Math.floor(count / 1000);
    const minutes = Math.floor(countSeconds / 60);
    const seconds = countSeconds - (minutes * 60);
    return `${minutes}:${seconds.toLocaleString('en-US', {minimumIntegerDigits: 2})}`;
}

class ProgressBar extends Container {
    private frame: Sprite;
    private bar: Sprite;
    private fill: Sprite;
    
    private frameSize = 1;
    private _progress = 0;
    private _length = 0;
    private thickness = 10;
    

    constructor(length: number) {
        super();

        this.frame = this.addRect(COLORS.WHITE, true);
        this.fill = this.addRect(COLORS.BLUE);
        this.bar = this.addRect(COLORS.RED);

        this.length = length;
        this.progress = 0;
    }

    set length(val: number) {
        const l = this._length = val;
        const fs = this.frameSize;

        this.frame.width = l + fs * 2;
        this.fill.width = l;
        this.bar.width = l * this.progress;
    }

    get length() {
        return this._length;
    }

    set progress(val: number) {
        this._progress = val;
        this.bar.width = this._length * this.progress;
    }

    get progress() {
        return this._progress;
    }

    private addRect(color: number, isFrame = false): Sprite {
        const spr = Sprite.from(Texture.WHITE);
        spr.tint = color;
        if (isFrame) {
            spr.height = this.thickness + 2 * this.frameSize;
        } else {
            spr.height = this.thickness;
            spr.position.set(this.frameSize, this.frameSize);
        }
        return this.addChild(spr);
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