import './hello.ts';
import './main.css';
import { Application, Container, Sprite, Texture } from 'pixi.js';
import { assets } from './assets';
import { preload, withGlobals, Scene, GlobalPointerSteering, msg } from '~/core';
import { GameScene } from './game/GameScene';
import { createMenu } from './menu';
import { HUD } from './gui/hud';
import { GameOver } from './gui/gameover';
import { MAP_BKG_COLOR } from './consts';
import { Intro } from './gui/intro';
import { IssuesMarker } from './gui/IssuesMarkers';


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
        backgroundColor: 0x0
    });
    const appElem = document.querySelector<HTMLDivElement>('#app') ?? document.body;
    appElem.appendChild(app.view);

    const backdrop = Sprite.from(Texture.WHITE);
    backdrop.tint = MAP_BKG_COLOR;
    app.stage.addChild(backdrop);

    const menu = createMenu();
    
    const scene = new GameScene();
    app.stage.addChild(scene);
    
    const markers = new IssuesMarker();
    app.stage.addChild(markers);

    const hud = new HUD();
    app.stage.addChild(hud);

    const controllsOverlay = new Container();
    app.stage.addChild(controllsOverlay);

    const onResize = (width: number, height: number) => {
        backdrop.width = width;
        backdrop.height = height;

        scene.resize(width, height);
        markers.resize(width, height);
        hud.resize(width, height);
    }
    app.renderer.on('resize', onResize);
    onResize(app.screen.width, app.screen.height);

    const intro = new Intro();
    app.stage.addChild(intro);
    intro.resize(app.screen.width, app.screen.height);
    app.renderer.on('resize', intro.resize, intro);
    msg.on("gameStart", () => {
        app.renderer.off('resize', intro.resize, intro);
    });
    

    msg.on("gameOver", (spec) => {
        backdrop.interactive = false;
        controllsOverlay.visible = false;

        const gameOver = new GameOver(spec);
        app.stage.addChild(gameOver);
        app.renderer.on('resize', gameOver.resize, gameOver);
        gameOver.resize(app.screen.width, app.screen.height);

        setTimeout(() => {
            app.renderer.on('pointerdown', () => window.location.reload());
        }, 2000);
    });

    GlobalPointerSteering.initialize(backdrop, controllsOverlay);

    msg.emit("gameReady");

    withGlobals(app, menu);
}

function onClicked() {
    // sounds.playMusic('simon_music');
}
