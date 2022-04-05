import { Container, IPointData, Sprite } from "pixi.js";
import { HouseMapLoader, SpawnPoint, Wall, Room } from "./HouseMap";
import { addDebugMenu } from "~/menu";
import { FolderApi } from "tweakpane";
import { Body } from "matter-js";
import { randomInt } from "d3-random";
import { Guest } from "./Guest";

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
        this._wallsContainer.visible = false;

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

    getWallsBodies(): Body[] {
        return this.walls.map(w => w.body);
    }

    randomPointNearGuest(guest: Guest): IPointData {
        const room = this.rooms.find(r => r.contains(guest.x, guest.y));
        if (room){ 
            for(let i = 0; i < 5; ++i) {
                const pos = room.randomPoint();
                if (this.notBlocked(pos)) {
                    return pos;
                }
            }
        }
        // fallback
        return guest.position;
    }

    private notBlocked(pos: IPointData): boolean {
        for (const wall of this.walls) {
            if (wall.contains(pos.x, pos.y)) {
                return false;
            }
        }
        return true;
    }
    
    private debugMenu(folder: FolderApi): void {
        folder.addInput(this._wallsContainer, "visible", {label: "show walls"});
    }
}
