import { Bodies, Body, Vector } from "matter-js";
import { Container, Graphics, IPointData } from "pixi.js";
import { Keyboard } from "~/core";

export class Player extends Container {
    img: Graphics;
    body: Body;

    speed = 0.01;
    stamina = 1;
    size = 64;

    constructor(pos: IPointData) {
        super();

        this.img = this.addChild(this.createImg());
        this.body = Bodies.circle(pos.x, pos.y, this.size / 2, {
            frictionAir: 0.1,
            friction: 0.01
        });
        this.position.copyFrom(pos);
    }

    move(dt: number) {
        // keyboard controls
        let f = Vector.create(0, 0);
        if (Keyboard.up) {
            f.y -= 1;
        }
        if (Keyboard.down) {
            f.y += 1;
        }
        if (Keyboard.left) {
            f.x -= 1;
        }
        if (Keyboard.right) {
            f.x += 1;
        }
        
        f = Vector.normalise(f);
        f = Vector.mult(f, dt * this.speed * this.stamina);

        Body.applyForce(this.body, this.body.position, f);
    }

    update() {
        this.position.copyFrom(this.body.position);
    }

    private createImg() {
        const g = new Graphics();
        g.beginFill(0x00bbf9);
        g.drawCircle(0, 0, 32);
        g.endFill();
        return g;
    }
}
