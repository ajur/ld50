import { Vector } from "matter-js";
import { Container, Graphics, InteractionEvent } from "pixi.js";
import { Pane } from "tweakpane";
import { localLoadDefault, localSave } from "./storage";
import { clamp } from "./math";


const STORAGE_KEY = "pointer_config";

export class GlobalPointerSteering {
    private eventSource: Container;
    private paintTarget: Container;
    private _isDown = false;
    private pointerStart: Graphics;
    private pointerPos: Graphics;
    private vectorMaxMagnitude = 64;
    private currentMoveVector = Vector.create(0, 0);
    private _showPointerHelper = true;
    
    private static instance: GlobalPointerSteering | null = null;
    
    public static initialize(eventSource: Container, paintTarget: Container) {
        if (GlobalPointerSteering.instance) {
            throw new Error("Cannot initialize twice!");
        }
        GlobalPointerSteering.instance = new GlobalPointerSteering(eventSource, paintTarget);
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
    
    private constructor(eventSource: Container, paintTarget: Container) {
        this.eventSource = eventSource;
        this.paintTarget = paintTarget;

        this.eventSource.on("pointerdown", this.pointerdown, this);
        this.eventSource.on("pointermove", this.pointermove, this);
        this.eventSource.on("pointerup", this.pointerup, this);
        this.eventSource.on("pointerout", this.pointerup, this);
        this.eventSource.on("pointerupoutside", this.pointerup, this);

        this.pointerStart = paintTarget.addChild(this.pointerHelper(this.vectorMaxMagnitude));
        this.pointerPos = paintTarget.addChild(this.pointerHelper(16));

        this._showPointerHelper = localLoadDefault(STORAGE_KEY, true);

        this.enable();
    }

    public enable() {
        this.eventSource.interactive = true;
    }

    public disable() {
        this.eventSource.interactive = false;
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
        this.paintTarget.addChild(this.pointerStart, this.pointerPos);
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
        const vpmn3 = vpmn ** 2;  // scale for better progression
        this.currentMoveVector = Vector.mult(normed, vpmn3);
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
