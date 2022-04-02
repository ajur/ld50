import { Container, Point, Sprite } from "pixi.js";
import { HouseMapLoader, MapObjects } from "./HouseMap";
import { addDebugMenu } from "~/menu";
import { FolderApi } from "tweakpane";

export class House extends Container {
    private bkg: Sprite;
    private objects: MapObjects;
    private _wallsContainer: Container;

    constructor(spriteName: string, tmxContents: string) {
        super();
        this.bkg = this.addChild(Sprite.from(spriteName));
        this.objects = HouseMapLoader.fromObjectsFromString(tmxContents);
        console.log(this.objects);

        this._wallsContainer = this.addChild(new Container);
        this._wallsContainer.addChild(...this.objects.walls.map(w => w.displayObject));

        addDebugMenu("house", this.debugMenu, this);
    }

    get mapWidth() {
        return this.bkg.texture.width;
    }
    get mapHeight() {
        return this.bkg.texture.height;
    }
    getStartingPoint() {
        return (new Point()).copyFrom(this.objects.player.start);
    }

    getWallsBodies() {
        return this.objects.walls.map(w => w.body);
    }

    private debugMenu(folder: FolderApi): void {
        folder.addInput(this._wallsContainer, "visible", {label: "show walls"});
    }
}
