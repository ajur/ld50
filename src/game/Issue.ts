import { Bodies, Body } from "matter-js";
import { Container, DisplayObject, Graphics, IPointData, PI_2 } from "pixi.js";
import { gsap } from 'gsap';
import { msg } from "~/core";
import { CATEGORY_ISSUES, CATEGORY_PLAYER, COLOR_HARD_ISSUE, COLOR_ISSUE, COLOR_ISSUE_PROGRESS } from "~/consts";
import { clamp } from "~/core/math";


export class Issue extends Container {
    static margin = 32;

    private img: DisplayObject;
    private progressBar?: Graphics;
    readonly body: Body;

    private size = 64;
    private cleanRadius = 48;

    readonly isHard;

    private defaultResolutionDelay = 500;
    private resolutionDelay = this.defaultResolutionDelay;
    private baseResolutionTime = 2000;
    private resolutionTime = this.baseResolutionTime;
    private isResolving = false;
    private isResolved = false;

    constructor(pos: IPointData, isHard = false) {
        super();

        this.isHard = isHard;

        if (isHard) {
            this.baseResolutionTime *= 2;
        }
        this.resolutionTime = this.baseResolutionTime;

        this.img = this.addChild(this.createImg(isHard));

        this.body = Bodies.circle(pos.x, pos.y, this.cleanRadius, {
            isSensor: true,
            collisionFilter: {
                category: CATEGORY_ISSUES,
                mask: CATEGORY_PLAYER
            }
        });

        this.position.copyFrom(pos);
    }

    stopResolving() {
        this.isResolving = false;
        gsap.killTweensOf(this.scale);
        gsap.to(this.scale, {x: 1, y: 1, duration: 0.1});
    }
    startResolving() {
        if (this.isResolved) return;
        if (!this.progressBar) {
            this.addProgressBar()
        }
        this.isResolving = true;
        this.resolutionDelay = this.defaultResolutionDelay;
        gsap.killTweensOf(this.scale);
        gsap.to(this.scale, {x: 1.2, y: 1.2, duration: this.defaultResolutionDelay/1000});
    }

    update(deltaMS: number) {
        if (!this.isResolved && this.isResolving) {
            if (this.resolutionDelay > 0) {
                this.resolutionDelay -= deltaMS;
            }
            else {
                this.resolutionTime -= deltaMS;
                this.updateProgress();
                if (this.resolutionTime < 0) {
                    this.resolved();
                }
            }
        }
    }

    private resolved() {
        this.stopResolving();
        this.isResolved = true;
        gsap.killTweensOf(this.scale);
        gsap.to(this.scale, {x: 0, y: 0, duration: 0.1, onComplete: () => {this.destroy()}});
        msg.emit("issueResolved", this);
    }

    get groundedProgress(): number {
        return this.isHard ? 5 : 2;
    }
    get groundedDelayed(): number {
        return 2;
    }

    private createImg(isHard: boolean): DisplayObject {
        const color = isHard ? COLOR_HARD_ISSUE : COLOR_ISSUE;
        const g = new Graphics();
        g.beginFill(color, 0.4);
        g.drawCircle(0, 0, this.cleanRadius);
        g.endFill();
        
        g.beginFill(color, 1);
        g.drawCircle(0, 0, this.size / 2);
        g.endFill();
        return g;
    }

    private addProgressBar() {
        const g = new Graphics();
        g.rotation = -Math.PI / 2;
        this.progressBar = this.addChild(g);
    }

    private updateProgress() {
        if (!this.progressBar) return;
        const g = this.progressBar;
        const r0 = this.size / 2 - 1;
        const r1 = this.cleanRadius + 1;
        
        const p = 1 - this.resolutionTime / this.baseResolutionTime;
        const a = clamp(p * PI_2, 0, PI_2);

        g.clear();
        g.lineStyle(0);
        g.beginFill(COLOR_ISSUE_PROGRESS, 1);
        g.moveTo(r0, 0);
        g.lineTo(r1, 0);
        g.arc(0, 0, r1, 0, a);
        g.arc(0, 0, r0, a, 0, true);
        g.endFill()
    }
}
