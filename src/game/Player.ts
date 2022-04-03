import { Bodies, Body, Vector } from "matter-js";
import { Container, DisplayObject, Graphics, IPointData } from "pixi.js";
import { FolderApi } from "tweakpane";
import { GlobalPointerSteering, Keyboard, msg } from "~/core";
import { addDebugMenu } from "~/menu";
import { CATEGORY_PLAYER, COLOR_PLAYER } from "~/consts";
import { Issue } from "./Issue";


export class Player extends Container {
    img: DisplayObject;
    body: Body;

    maxSpeed = 10; // max body speed
    speedCoef = 0.01;
    stamina = 1;
    size = 64;

    activeIssues: Set<Issue>;

    constructor(pos: IPointData) {
        super();

        this.img = this.addChild(this.createImg());
        this.body = Bodies.circle(pos.x, pos.y, this.size / 2, {
            frictionAir: 0.1,
            friction: 0.01,
            collisionFilter: {
                category: CATEGORY_PLAYER
            }
        });
        this.position.copyFrom(pos);

        this.activeIssues = new Set<Issue>();

        msg.on("issueResolved", this.issueResolved, this);

        addDebugMenu("player", this.debugMenu, this);
    }

    move() {
        if (this.body.speed > this.maxSpeed) {
            Body.setVelocity(this.body, 
                Vector.mult(
                    Vector.normalise(this.body.velocity),
                    this.maxSpeed));
        }

        if (Keyboard.isMoving) {
            this.applyMoveVector(Keyboard.moveVector());
        }
        else if (GlobalPointerSteering.isMoving) {
            this.applyMoveVector(GlobalPointerSteering.moveVector());
        }
    }

    private applyMoveVector(vec: Vector) {
        const f = Vector.mult(vec, this.speedCoef * this.stamina);
        Body.applyForce(this.body, this.body.position, f);
    }

    updatePosition() {
        this.position.copyFrom(this.body.position);
    }

    issuesEntered(issues: Issue[]) {
        for (const issue of issues) {
            this.activeIssues.add(issue);
            issue.startResolving();
        }
        
    }
    issuesExited(issues: Issue[]) {
        for (const issue of issues) {
            this.activeIssues.delete(issue);
            issue.stopResolving();
        }
    }

    issueResolved(issue: Issue) {
        this.activeIssues.delete(issue);
    }

    private createImg() {
        const g = new Graphics();
        g.beginFill(COLOR_PLAYER);
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
