import { Composite, Engine } from "matter-js";
import { Container, Ticker } from "pixi.js";
import { Keyboard, GlobalPointerSteering } from "~/core";
import { Scene } from "~/core";
import { Player } from "./Player";
import { House } from "./House";
import { Guest } from "./Guest";

import basicHouseXMLContents from "./basicHouse.tmx?raw";


export class GameScene extends Container implements Scene {
    house: House;
    player: Player;
    
    screenWidth = 0;
    screenHeight = 0;
    physicsEngine: Engine;
    guests: Guest[];
    
    constructor() {
        super();

        this.house = this.addChild(new House("basicHouse", basicHouseXMLContents));
        this.player = this.addChild(new Player(this.house.getPlayerSpawnPoint()));
        this.guests = this.addGuests(this.house.getInitialGeustsCount());

        this.physicsEngine = Engine.create();
        this.physicsEngine.gravity.x = 0;
        this.physicsEngine.gravity.y = 0;

        const world = this.physicsEngine.world;
        Composite.add(world, this.house.getWallsBodies());
        Composite.add(world, [this.player.body]);
        Composite.add(world, this.guests.flatMap(g => [g.body, g.link]));
        
        Ticker.shared.add(this.update, this);
    }
    
    resize(width: number, height: number): void {
        this.screenWidth = width;
        this.screenHeight = height;
        this.updateCameraPosition();
    }

    updateCameraPosition() {
        const cx = this.screenWidth / 2;
        const cy = this.screenHeight / 2;
        
        const ox = cx - this.player.x;
        const oy = cy - this.player.y;

        this.position.set(ox, oy);
    }

    update() {
        this.movePlayer();

        Engine.update(this.physicsEngine, Ticker.shared.deltaMS);
        
        this.player.update();
        this.guests.forEach(g => g.update());

        this.updateCameraPosition();
    }

    private addGuests(count: number): Guest[] {
        return Array.from({length: count}).map(() => {
            const g = new Guest(this.house.getGuestSpawnPoint());
            this.addChild(g);
            return g;
        })
    }

    private movePlayer() {
        if (Keyboard.isMoving) {
            this.player.move(Keyboard.moveVector());
        }
        else if (GlobalPointerSteering.isMoving) {
            this.player.move(GlobalPointerSteering.moveVector());
        }
    }
}
