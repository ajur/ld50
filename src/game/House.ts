import { Container, IPointData, Sprite } from "pixi.js";
import { HouseMapLoader, SpawnPoint, Wall, Room } from "./HouseMap";
import { addDebugMenu } from "~/menu";
import { FolderApi } from "tweakpane";
import { Body } from "matter-js";
import { randomInt } from "d3-random";

export class House extends Container {
    readonly walls: Wall[];
    readonly rooms: Room[];
    readonly playerSpawns: SpawnPoint[];
    readonly guestsSpawns: SpawnPoint[];
    
    private bkg: Sprite;
    private _wallsContainer: Container;
    playerSpawnRng: () => number;
    guestsSpawnRng: () => number;

    constructor(spriteName: string, tmxContents: string) {
        super();
        this.bkg = this.addChild(Sprite.from(spriteName));
        
        const objects = HouseMapLoader.fromObjectsFromString(tmxContents);

        this.walls = objects.walls;
        this.rooms = objects.rooms;
        this.playerSpawns = objects.spawn.filter(SpawnPoint.isPlayer);
        this.guestsSpawns = objects.spawn.filter(SpawnPoint.isGuest);

        this.playerSpawnRng = randomInt(0, this.playerSpawns.length);
        this.guestsSpawnRng = randomInt(0, this.guestsSpawns.length);

        this._wallsContainer = this.addChild(new Container);
        this._wallsContainer.addChild(...this.walls.map(w => w.displayObject));

        addDebugMenu("house", this.debugMenu, this);
    }

    get mapWidth() {
        return this.bkg.texture.width;
    }
    get mapHeight() {
        return this.bkg.texture.height;
    }
    getPlayerSpawnPoint(): IPointData {
        return this.playerSpawns[this.playerSpawnRng()];
    }

    getGuestSpawnPoint(): IPointData {
        return this.guestsSpawns[this.guestsSpawnRng()];
    }

    getInitialGeustsCount(): number {
        return this.guestsSpawns.length * 2;
    }

    getWallsBodies(): Body[] {
        return this.walls.map(w => w.body);
    }

    private debugMenu(folder: FolderApi): void {
        folder.addInput(this._wallsContainer, "visible", {label: "show walls"});
    }
}
