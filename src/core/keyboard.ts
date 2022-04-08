import { Vector } from "matter-js";
import { enumIncludes } from "./func";
import { msg } from "./msg";

export enum HandledKeys {
    ArrowUp = "ArrowUp",
    ArrowDown = "ArrowDown",
    ArrowLeft = "ArrowLeft",
    ArrowRight = "ArrowRight",
    KeyW = "KeyW",
    KeyS = "KeyS",
    KeyA = "KeyA",
    KeyD = "KeyD",
    Enter = "Enter",
    Space = "Space",
    ShiftLeft = "ShiftLeft",
}

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
        if (enumIncludes(HandledKeys, e.code)) {
            Keyboard.state.set(e.code, true)
            msg.emit("keydown", e.code);
        }
        else {
            Keyboard.resetAll();
        }
    }
    private static keyUp(e: KeyboardEvent): void {
        if (Keyboard.state.has(e.code)) {
            Keyboard.state.set(e.code, false);
            msg.emit("keyup", e.code);
        }
    }

    static get up() {
        return Keyboard.state.get(HandledKeys.ArrowUp) || Keyboard.state.get(HandledKeys.KeyW);
    }
    static get down() {
        return Keyboard.state.get(HandledKeys.ArrowDown) || Keyboard.state.get(HandledKeys.KeyS);
    }
    static get left() {
        return Keyboard.state.get(HandledKeys.ArrowLeft) || Keyboard.state.get(HandledKeys.KeyA);
    }
    static get right() {
        return Keyboard.state.get(HandledKeys.ArrowRight) || Keyboard.state.get(HandledKeys.KeyD);
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
