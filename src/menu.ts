import { FolderApi, Pane } from "tweakpane";
import { sounds, GlobalPointerSteering, isDebugOn } from "~/core";

// const isDebugOn = true; // replace with debug.isDebugOn after dev

let _menu: Pane | null = null;
let _debug: FolderApi | null = null;

export function createMenu(): Pane {

    if (_menu) return _menu;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const menuDiv = document.getElementById('menu')!
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const toggleButton = document.getElementById('menu-toggle')!
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const container = document.getElementById('menu-container')!

    const pane = new Pane({container, title: "Config"});

    sounds.addSoundsControlPanel(pane);

    GlobalPointerSteering.addMenu(pane);

    if (isDebugOn) {
        _debug = pane.addFolder({title: "Debug"});
    }

    toggleButton.addEventListener('pointerdown', () => {
        menuDiv.classList.toggle('closed');
    });

    pane.addSeparator();

    pane.addButton({
        title: 'Close menu',
    }).on('click', () => {
        menuDiv.classList.add('closed');
    });
    
    _menu = pane;

    return pane;
}

export function addDebugMenu<T>(title: string, addCb: (this: T | null, df: FolderApi) => void, context: T | null = null): void {
    if (isDebugOn && _debug) {
        const f = _debug.addFolder({title});
        addCb.call(context, f);
    }
}

