import { Vector } from "matter-js";
import { Container, Graphics, InteractionEvent } from "pixi.js";
import { Pane } from "tweakpane";
import { localLoadDefault, localSave } from "./storage";
import { clamp } from "./math";


const STORAGE_KEY = "steeringSettings";


type SteeringType = "Thumbstick" | "Pointer";

class SteeringSettings {
    _showHelper: boolean;
    _type: SteeringType;
    
    constructor() {
        const {_showHelper, _type} = localLoadDefault(STORAGE_KEY, {
            _showHelper: true,
            _type: "Thumbstick" as SteeringType
        });
        this._showHelper = _showHelper;
        this._type = _type;
    }

    get showHelper(): boolean {
        return this._showHelper;
    }
    set showHelper(val: boolean) {
        if (val == this._showHelper) return;
        this._showHelper = val;
        localSave(STORAGE_KEY, this);
    }
    get type(): SteeringType {
        return this._type;
    }
    set type(val: SteeringType) {
        if (val == this._type) return;
        this._type = val;
        localSave(STORAGE_KEY, this);
        changeSteering(this._type);
    }
}

interface Steering {
    readonly eventSource: Container;
    readonly paintTarget: Container;
    readonly isMoving: boolean;
    readonly moveVector: Vector;
    destroy(): void;
}


const __settings = new SteeringSettings();
let __steering: Steering;


export const GlobalPointerSteering = {
    initialize,
    addMenu: addConfigMenu,

    get isMoving(): boolean {
        return __steering.isMoving;
    },
    get moveVector(): Vector {
        return __steering.moveVector;
    }
}



function initialize(eventSource: Container, paintTarget: Container): void {
    if (!__steering) {
        __steering = createSteering(__settings.type, eventSource, paintTarget);
        eventSource.interactive = true;
    }
}


function addConfigMenu(pane: Pane): void {
    const movement = pane.addFolder({title: "Steering"});

    movement.addInput(__settings, "showHelper", {
        label: "Show steering helper"
    });
    movement.addInput(__settings, "type", {
        view: "list",
        label: "Type",
        options: [
            {text: "Virtual thumbstic", value: "Thumbstick"},
            {text: "Fallow pointer", value: "Pointer"},
        ]
    });
}

abstract class SteeringBase implements Steering {
    pointerStart: Graphics;
    pointerPos: Graphics;
    
    _deadZone = 0.1;
    _isDown = false;
    currentMoveVector = Vector.create(0, 0);

    constructor(
        readonly eventSource: Container,
        readonly paintTarget: Container,
        readonly vectorMaxMagnitude: number,
        withFill = true
    ) {
        this.eventSource.on("pointerdown", this.pointerdown, this);
        this.eventSource.on("pointermove", this.pointermove, this);
        this.eventSource.on("pointerup", this.pointerup, this);
        this.eventSource.on("pointerout", this.pointerup, this);
        this.eventSource.on("pointerupoutside", this.pointerup, this);

        this.pointerStart = this.paintTarget.addChild(circularPointerHelper(this.vectorMaxMagnitude, withFill));
        this.pointerPos = this.paintTarget.addChild(circularPointerHelper(16));
    }

    get isMoving(): boolean {
        return this._isDown;
    }
    get moveVector(): Vector {
        return this.currentMoveVector;
    }
    destroy(): void {
        this.eventSource.off("pointerdown", this.pointerdown, this);
        this.eventSource.off("pointermove", this.pointermove, this);
        this.eventSource.off("pointerup", this.pointerup, this);
        this.eventSource.off("pointerout", this.pointerup, this);
        this.eventSource.off("pointerupoutside", this.pointerup, this);

        this.paintTarget.removeChild(this.pointerStart);
        this.paintTarget.removeChild(this.pointerPos);
    }

    protected pointerup(): void {
        if (!this._isDown) return;

        this._isDown = false;
        this.pointerStart.visible = false;
        this.pointerPos.visible = false;
        this.currentMoveVector = Vector.create();
    }

    protected pointerdown(evt: InteractionEvent) {
        this._isDown = true;

        this.pointerStart.position.copyFrom(this.pointerStartPosition(evt));
        this.pointerStart.visible = __settings.showHelper;
        this.paintTarget.addChild(this.pointerStart, this.pointerPos);
        this.currentMoveVector = Vector.create();

        this.pointermove(evt);
    }

    protected pointermove(evt: InteractionEvent) {
        if (!this._isDown) return;

        const vp = Vector.sub(evt.data.global, this.pointerStart.position);
        
        const vpm = clamp(Vector.magnitude(vp), 0, this.vectorMaxMagnitude);
        const normed = Vector.normalise(vp);

        const vpp = Vector.add(this.pointerStart.position, Vector.mult(normed, vpm));
        
        this.pointerPos.position.copyFrom(vpp);
        this.pointerPos.visible = __settings.showHelper;

        const vpmn = vpm / this.vectorMaxMagnitude;
        const vpmn2 = vpmn < this._deadZone ? 0 : vpmn;
        this.currentMoveVector = Vector.mult(normed, vpmn2);
    }

    protected abstract pointerStartPosition(evt: InteractionEvent): Vector;
}

class PointerSteering extends SteeringBase {

    constructor(eventSource: Container, paintTarget: Container) {
        super(eventSource, paintTarget, 192, false);
    }
    
    protected pointerStartPosition(): Vector {
        return Vector.create(
            this.eventSource.width / 2,
            this.eventSource.height / 2
        );
    }
}

class ThumbsticSteering extends SteeringBase {

    constructor(eventSource: Container, paintTarget: Container) {
        super(eventSource, paintTarget, 64, true);
    }
    
    protected pointerStartPosition(evt: InteractionEvent): Vector {
        return evt.data.global;
    }
    
}

function createSteering(type: SteeringType, eventSource: Container, paintTarget: Container): Steering {
    switch(type) {
        case "Pointer":
            return new PointerSteering(eventSource, paintTarget);
        case "Thumbstick":
            return new ThumbsticSteering(eventSource, paintTarget);
    }
}

function changeSteering(type: SteeringType) {
    const {eventSource, paintTarget} = __steering;
    const oldSteering = __steering;
    __steering = createSteering(type, eventSource, paintTarget);
    oldSteering.destroy();
}

function circularPointerHelper(radius: number, withFill = true): Graphics {
    const g = new Graphics();
    g.lineStyle(1, 0x000000, 0.5, 0, true);

    g.moveTo(0, 0);
    g.drawCircle(0, 0, radius);

    if (withFill) {
        g.beginFill(0x000000, 0.1);
        g.drawCircle(0, 0, radius);
        g.endFill();
    }

    g.visible = false;

    return g;
}
