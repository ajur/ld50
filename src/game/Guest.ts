import { Bodies, Body, Constraint } from "matter-js";
import { Container, DisplayObject, Graphics, IPointData } from "pixi.js";

export class Guest extends Container {
    img: DisplayObject;
    body: Body;
    link: Constraint;

    size = 64;

    constructor(pos: IPointData) {
        super();
        this.img = this.addChild(this.createImg());
        this.body = Bodies.circle(pos.x, pos.y, this.size / 2, {
            frictionAir: 0.1,
            friction: 0.01,
        });
        this.position.copyFrom(pos);

        this.link = Constraint.create({
            pointA: pos,
            bodyB: this.body,
            stiffness: 0.0005,
            damping: 0.1,
            length: this.size
        });
    }

    update() {
        this.position.copyFrom(this.body.position);
    }

    private createImg() {
        const g = new Graphics();
        g.beginFill(0x9b5de5);
        g.drawCircle(0, 0, this.size / 2);
        g.endFill();
        return g;
    }
}
