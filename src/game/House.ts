import { Container, IPointData, Sprite } from "pixi.js";
import { HouseMapLoader, SpawnPoint, Wall, Room, GuestSpot, MapObjects, PathNode } from "./HouseMap";
import { addDebugMenu } from "~/menu";
import { FolderApi } from "tweakpane";
import { Body, Vector } from "matter-js";
import { randomInt } from "d3-random";
import { Guest } from "./Guest";
import createGraph from "ngraph.graph";
import { lineWireframe, rectWireframe } from "~/core/display";
import { COLORS } from "~/consts";


export class House extends Container {
    readonly walls: Wall[];
    readonly rooms: Room[];
    readonly playerSpawns: SpawnPoint[];
    readonly guestsSpawns: GuestSpot[];
    
    private bkg: Sprite;
    private _wallsContainer: Container;
    private _pathContainer: Container;
    playerSpawnRng: () => number;
    
    constructor(spriteName: string, tmxContents: string) {
        super();
        this.bkg = this.addChild(Sprite.from(spriteName));
        
        const objects = HouseMapLoader.fromObjectsFromString(tmxContents);

        this.walls = [...objects.walls, ...objects.furniture];
        this.rooms = objects.rooms;
        this.playerSpawns = objects.playerSpawn;
        this.guestsSpawns = objects.spots;
        
        this.playerSpawnRng = randomInt(0, this.playerSpawns.length);
        
        this._wallsContainer = this.addWallsContainer(objects);
        this._pathContainer = this.addPathsContainer(objects);

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

    private addPathsContainer(objects: MapObjects) {
        const cont = this.addChild(new Container());

        const graph = createGraph();

        for (const node of [...objects.guestsSpawn, ...objects.spots, ...objects.nodes]) {
            const clr = (node as PathNode).links ? COLORS.GREEN : COLORS.VIOLET;
            const render = cont.addChild(rectWireframe({
                x: node.x, y: node.y, 
                width: 10, height: 10,
                color: clr
            }));

            graph.addNode(node.id, {id: node.id, node, render});
        }
        
        for (const node of objects.nodes) {
            for (const targetId of node.links) {
                const target = graph.getNode(targetId)
                const render = cont.addChild(lineWireframe(node, target?.data.node, COLORS.VIOLET));
                const dist = Vector.magnitude(Vector.sub(node, target?.data.node));
                graph.addLink(node.id, targetId, {render, dist});
            }
        }

        // const nodesDistance = (fromNode: Node, toNode: Node) => Vector.magnitude(Vector.sub(fromNode.data.node, toNode.data.node));

        // window.pathFiner = nba(graph, {
        //     distance: nodesDistance,
        //     heuristic: nodesDistance
        // });
        // window.graph = graph;


        cont.visible = false;
        return this.addChild(cont);
    }

    private addWallsContainer(objects: MapObjects) {
        const cont = new Container();
        const allWalls: Wall[] = [...objects.walls, ...objects.furniture];
        cont.addChild(...allWalls.map(w => w.displayObject));
        cont.visible = false;
        return this.addChild(cont);
    }
    
    private debugMenu(folder: FolderApi): void {
        folder.addInput(this._wallsContainer, "visible", {label: "show walls"});
        folder.addInput(this._pathContainer, "visible", {label: "show paths"});
    }
}
