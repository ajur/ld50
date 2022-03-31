import './hello.ts';
import './main.css';
import { Application } from 'pixi.js';
import { Pane } from 'tweakpane';
import { assets } from './assets';
import { preload } from './preloader';
import { sounds } from './Sounds';
import { withGlobals } from './debug';
import { Splash } from './scenes/splash';
import { Scene } from './interfaces';


preload({assets: assets(), onLoaded, onClicked});

function onLoaded() {
    const app = new Application({
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        resizeTo: window,
        backgroundColor: 0x000000
    });
    const appElem = document.querySelector<HTMLDivElement>('#app') ?? document.body;
    appElem.appendChild(app.view);


    const scene: Scene = new Splash();
    app.stage.addChild(scene);
    app.renderer.on('resize', scene.resize, scene);
    scene.resize(app.screen.width, app.screen.height);

    const menu = createTweakPane();

    withGlobals(app, menu);
}

function onClicked() {
    // sounds.playMusic('simon_music');
}

function createTweakPane(): Pane {

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const menuDiv = document.getElementById('menu')!
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const toggleButton = document.getElementById('menu-toggle')!
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const container = document.getElementById('menu-container')!

    const pane = new Pane({container});

    sounds.addSoundsControlPanel(pane);

    toggleButton.addEventListener('pointerdown', () => {
        menuDiv.classList.toggle('closed');
    });

    pane.addSeparator();

    pane.addButton({
        title: 'Close menu',
    }).on('click', () => {
        menuDiv.classList.add('closed');
    });
    

    return pane;
}
