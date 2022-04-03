import { randomInt, randomUniform } from "d3-random";
import { Bodies, Body, Constraint } from "matter-js";
import { Container, DisplayObject, Graphics, IPointData } from "pixi.js";
import { CATEGORY_GUESTS, COLOR_GUEST } from "~/consts";
import { msg } from "~/core";

export class Guest extends Container {
    img: DisplayObject;
    body: Body;
    link: Constraint;

    size = 64;
    issueChance = 0.1;
    checkIssueIn: number;
    issueTimeRng: () => number;
    issueChanceRng: () => number;

    constructor(pos: IPointData) {
        super();
        this.img = this.addChild(this.createImg());
        this.body = Bodies.circle(pos.x, pos.y, this.size / 2, {
            frictionAir: 0.1,
            friction: 0.01,
            collisionFilter: {
                category: CATEGORY_GUESTS
            }
        });
        this.position.copyFrom(pos);

        this.link = Constraint.create({
            pointA: pos,
            bodyB: this.body,
            stiffness: 0.0005,
            damping: 0.1,
            length: this.size
        });

        this.issueChanceRng = randomUniform();
        this.issueTimeRng = randomInt(4000, 6000);
        this.checkIssueIn = this.issueTimeRng();
    }

    updatePosition() {
        this.position.copyFrom(this.body.position);
    }

    update(elapsedMS: number) {
        this.checkIssueIn -= elapsedMS;
        if (this.checkIssueIn < 0) {
            this.checkIssueIn = this.issueTimeRng();
            if (this.issueChanceRng() < this.issueChance) {
                msg.emit("triggerIssueSpawn", this);
            }
        }
    }

    private createImg() {
        const g = new Graphics();
        g.beginFill(COLOR_GUEST);
        g.drawCircle(0, 0, this.size / 2);
        g.endFill();
        return g;
    }
}
