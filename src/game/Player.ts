import { Bodies, Body, Vector } from "matter-js";
import { Container, DisplayObject, Graphics, IPointData } from "pixi.js";
import { FolderApi } from "tweakpane";
import { addDebugMenu } from "~/menu";


export class Player extends Container {
    img: DisplayObject;
    body: Body;

    maxSpeed = 10; // max body speed
    speedCoef = 0.01;
    stamina = 1;
    size = 64;

    constructor(pos: IPointData) {
        super();

        this.img = this.addChild(this.createImg());
        this.body = Bodies.circle(pos.x, pos.y, this.size / 2, {
            frictionAir: 0.1,
            friction: 0.01,
        });
        this.position.copyFrom(pos);

        addDebugMenu("player", this.debugMenu, this);
    }

    move(vec: Vector) {
        if (this.body.speed > this.maxSpeed) {
            Body.setVelocity(this.body, 
                Vector.mult(
                    Vector.normalise(this.body.velocity),
                    this.maxSpeed));
        }

        const f = Vector.mult(vec, this.speedCoef * this.stamina);
        Body.applyForce(this.body, this.body.position, f);
    }

    update() {
        this.position.copyFrom(this.body.position);
    }

    private createImg() {
        const g = new Graphics();
        g.beginFill(0x00bbf9);
        g.drawCircle(0, 0, this.size / 2);
        g.endFill();
        return g;
    }

    private debugMenu(folder: FolderApi): void {
        folder.addInput(this, "speedCoef", {min: 0.001, max: 0.1, step: 0.001});
        folder.addInput(this.body, "frictionAir");
        folder.addInput(this.body, "friction");
    }
}
