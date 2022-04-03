import './hello.ts';
import './main.css';
import { Application } from 'pixi.js';
import { assets } from './assets';
import { preload, withGlobals, Scene, GlobalPointerSteering } from '~/core';
import { GameScene } from './game/GameScene';
import { createMenu } from './menu';


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
    app.renderer.on('resize', scene.resize, scene);
    scene.resize(app.screen.width, app.screen.height);

    withGlobals(app, menu);
}

function onClicked() {
    // sounds.playMusic('simon_music');
}

