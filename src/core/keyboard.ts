import { Vector } from "matter-js";

const HANDLED_KEYS = [
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "KeyW",
    "KeyS",
    "KeyA",
    "KeyD",
    "Space",
    "ShiftLeft",
];


export class Keyboard {
    private static _initialized = false;
    
    static readonly state = new Map<string, boolean>();
    
    static initialize() {
        if (Keyboard._initialized) return;
        Keyboard._initialized = true;
        window.addEventListener("keydown", Keyboard.keyDown);
        window.addEventListener("keyup", Keyboard.keyUp);
    }

    static resetAll() {
        Keyboard.state.clear();
    }

    private static keyDown(e: KeyboardEvent): void {
        if (HANDLED_KEYS.includes(e.code)) {
            Keyboard.state.set(e.code, true)
        }
        else {
            Keyboard.resetAll();
        }
    }
    private static keyUp(e: KeyboardEvent): void {
        if (Keyboard.state.has(e.code)) {
            Keyboard.state.set(e.code, false);
        }
    }
    
    static get up() {
        return Keyboard.state.get("ArrowUp") || Keyboard.state.get("KeyW");
    }
    static get down() {
        return Keyboard.state.get("ArrowDown") || Keyboard.state.get("KeyS");
    }
    static get left() {
        return Keyboard.state.get("ArrowLeft") || Keyboard.state.get("KeyA");
    }
    static get right() {
        return Keyboard.state.get("ArrowRight") || Keyboard.state.get("KeyD");
    }

    static get isMoving() {
        return this.up || this.down || this.left || this.right;
    }

    static moveVector(): Vector {
        const v = Vector.create(0, 0);
        if (Keyboard.up) {
            v.y -= 1;
        }
        if (Keyboard.down) {
            v.y += 1;
        }
        if (Keyboard.left) {
            v.x -= 1;
        }
        if (Keyboard.right) {
            v.x += 1;
        }
        return Vector.normalise(v);
    }
}

Keyboard.initialize();
