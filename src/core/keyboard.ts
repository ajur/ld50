
export class Keyboard {
    private static _initialized = false;
    
    static readonly state = new Map<string, boolean>();
    
    static initialize() {
        if (Keyboard._initialized) return;
        Keyboard._initialized = true;
        window.addEventListener("keydown", Keyboard.keyDown);
        window.addEventListener("keyup", Keyboard.keyUp);
    }

    private static keyDown(e: KeyboardEvent): void {
        Keyboard.state.set(e.code, true)
    }
    private static keyUp(e: KeyboardEvent): void {
        Keyboard.state.set(e.code, false)
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
}

Keyboard.initialize();
