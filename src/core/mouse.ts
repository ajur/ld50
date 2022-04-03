import { Vector } from "matter-js";
import { Container, Graphics, InteractionEvent } from "pixi.js";
import { Pane } from "tweakpane";
import { localLoadDefault, localSave } from "./storage";
import { clamp } from "./math";


const STORAGE_KEY = "pointer_config";

export class GlobalPointerSteering {
    private stage: Container;
    private _isDown = false;
    private pointerStart: Graphics;
    private pointerPos: Graphics;
    private vectorMaxMagnitude = 64;
    private currentMoveVector = Vector.create(0, 0);
    private _showPointerHelper = true;
    
    private static instance: GlobalPointerSteering | null = null;
    
    public static initialize(stage: Container) {
        if (GlobalPointerSteering.instance) {
            throw new Error("Cannot initialize twice!");
        }
        GlobalPointerSteering.instance = new GlobalPointerSteering(stage);
    }

    public static addMenu(pane: Pane) {
        if (!GlobalPointerSteering.instance) return;

        const movement = pane.addFolder({title: "Steering"});
        movement.addInput(GlobalPointerSteering.instance, "showPointerHelper", {
            label: "show thumbsticks on move"
        });
    }

    public static enable() {
        GlobalPointerSteering.instance?.enable();
    }

    public static disable() {
        GlobalPointerSteering.instance?.disable();
    }

    public static get isMoving(): boolean {
        return GlobalPointerSteering.instance?._isDown ?? false;
    }

    public static moveVector(): Vector {
        if (!GlobalPointerSteering.instance) {
            return Vector.create(0, 0);
        }
        return GlobalPointerSteering.instance.currentMoveVector;
    }
    
    private constructor(stage: Container) {
        this.stage = stage;

        this.stage.on("pointerdown", this.pointerdown, this);
        this.stage.on("pointermove", this.pointermove, this);
        this.stage.on("pointerup", this.pointerup, this);
        this.stage.on("pointerout", this.pointerup, this);
        this.stage.on("pointerupoutside", this.pointerup, this);

        this.pointerStart = stage.addChild(this.pointerHelper(this.vectorMaxMagnitude));
        this.pointerPos = stage.addChild(this.pointerHelper(16));

        this._showPointerHelper = localLoadDefault(STORAGE_KEY, true);

        this.enable();
    }

    public enable() {
        this.stage.interactive = true;
    }

    public disable() {
        this.stage.interactive = false;
    }

    public get showPointerHelper(): boolean {
        return this._showPointerHelper;
    }

    public set showPointerHelper(val: boolean) {
        this._showPointerHelper = val;
        localSave(STORAGE_KEY, val);
    }

    private pointerdown(evt: InteractionEvent) {
        this._isDown = true;

        this.pointerStart.position.copyFrom(evt.data.global);
        this.pointerStart.visible = this.showPointerHelper;
        this.stage.addChild(this.pointerStart, this.pointerPos);
        Vector.mult(this.currentMoveVector, 0);
    }
    private pointerup() {
        if (!this._isDown) return;

        this._isDown = false;

        this.pointerStart.visible = false;
        this.pointerPos.visible = false;
        Vector.mult(this.currentMoveVector, 0);
    }
    private pointermove(evt: InteractionEvent) {
        if (!this._isDown) return;

        const vp = Vector.sub(evt.data.global, this.pointerStart.position);
        
        const vpm = clamp(Vector.magnitude(vp), 0, this.vectorMaxMagnitude);
        const normed = Vector.normalise(vp);

        const vpp = Vector.add(this.pointerStart.position, Vector.mult(normed, vpm));
        
        this.pointerPos.position.copyFrom(vpp);
        this.pointerPos.visible = this.showPointerHelper;

        const vpmn = vpm / this.vectorMaxMagnitude;
        this.currentMoveVector = Vector.mult(normed, vpmn);
    }

    private pointerHelper(radius: number): Graphics {
        const g = new Graphics();
        g.lineStyle(1, 0x000000, 0.5, 0, true);

        g.moveTo(0, 0);
        g.drawCircle(0, 0, radius);

        g.beginFill(0x000000, 0.1);
        g.drawCircle(0, 0, radius);
        g.endFill();

        g.visible = false;

        return g;
    }
}