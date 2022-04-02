import { Composite, Engine } from "matter-js";
import { Container, Ticker } from "pixi.js";
import { Scene } from "~/core";
import { Player } from "./Player";
import { House } from "./House";

import basicHouseXMLContents from "./basicHouse.tmx?raw";


export class GameScene extends Container implements Scene {
    house: House;
    
    player: Player;
    
    screenWidth = 0;
    screenHeight = 0;
    physicsEngine: Engine;

    
    constructor() {
        super();

        this.physicsEngine = Engine.create();
        this.physicsEngine.gravity.x = 0;
        this.physicsEngine.gravity.y = 0;

        const world = this.physicsEngine.world;

        this.house = this.addChild(new House("basicHouse", basicHouseXMLContents));

        Composite.add(world, this.house.getWallsBodies());

        this.player = this.addChild(new Player(this.house.getStartingPoint()));

        Composite.add(world, [this.player.body]);


        Ticker.shared.add(this.update, this);
    }
    
    resize(width: number, height: number): void {
        this.screenWidth = width;
        this.screenHeight = height;
        this.moveCamera();
    }

    moveCamera() {
        const cx = this.screenWidth / 2;
        const cy = this.screenHeight / 2;
        
        const ox = cx - this.player.x;
        const oy = cy - this.player.y;

        this.position.set(ox, oy);
    }

    update(dt: number) {
        this.player.move(dt);
        Engine.update(this.physicsEngine, Ticker.shared.deltaMS);
        this.player.update();
        this.moveCamera();
    }
}
