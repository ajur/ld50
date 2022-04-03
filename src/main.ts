import './hello.ts';
import './main.css';
import { Application } from 'pixi.js';
import { assets } from './assets';
import { preload, withGlobals, Scene, GlobalPointerSteering, msg } from '~/core';
import { GameScene } from './game/GameScene';
import { createMenu } from './menu';
import { HUD } from './gui/gui';


// prevent context menu
document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
}, false);


preload({assets: assets(), onLoaded, onClicked});

function onLoaded() {
    const app = new Application({
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        resizeTo: window,
        backgroundColor: 0xd2d2d2
    });
    const appElem = document.querySelector<HTMLDivElement>('#app') ?? document.body;
    appElem.appendChild(app.view);

    GlobalPointerSteering.initialize(app.stage);

    const menu = createMenu();
    
    const scene: Scene = new GameScene();
    app.stage.addChild(scene);
    
    const hud: HUD = new HUD();
    app.stage.addChild(hud);
    
    app.renderer.on('resize', scene.resize, scene);
    scene.resize(app.screen.width, app.screen.height);
    app.renderer.on('resize', hud.resize, scene);
    hud.resize(app.screen.width, app.screen.height);
    

    msg.emit("gameReady");

    withGlobals(app, menu);
}

function onClicked() {
    // sounds.playMusic('simon_music');
}
