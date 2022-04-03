import { Circle, DisplayObject, IPointData, ISize, Rectangle } from "pixi.js";
import { enumFromStringValue } from "~/core/func";
import { Bodies, Body } from "matter-js";
import { circleWireframe, rectWireframe } from "~/core/display";

export class HouseMapLoader {
    static fromObjectsFromString(tmxContents: string): MapObjects {
        return loadMapFromTMXString(tmxContents);
    }
}

export class Room extends Rectangle {
    roomType: RoomType;
    roomName: string;

    constructor(x: number, y: number, w: number, h: number, type: string, name: string) {
        super(x, y, w, h);
        this.roomType = enumFromStringValue(RoomType, type);
        this.roomName = name;
    }
}

export enum RoomType {
    BATHROOM = "bathroom",
    KITCHEN = "kitchen",
    BEDROOM = "bedroom",
    LIVINGROOM = "livingroom",
    HALL = "hall",
    GARDEN = "garden"
}


export interface Wall extends IPointData, ISize {
    body: Body;
    displayObject: DisplayObject;
}

export enum SpawnPointType {
    PLAYER = "player",
    GUEST = "guest"
}

export class SpawnPoint implements IPointData {
    x: number;
    y: number;
    type: SpawnPointType;
    name: string;

    constructor(x: number, y: number, type: string, name = "") {
        this.x = x;
        this.y = y;
        this.type = enumFromStringValue(SpawnPointType, type);
        this.name = name;
    }

    static isPlayer(point: SpawnPoint) {
        return point.type == SpawnPointType.PLAYER;
    }

    static isGuest(point: SpawnPoint) {
        return point.type == SpawnPointType.GUEST;
    }
}

export interface MapObjects {
    walls: Wall[],
    rooms: Room[],
    spawn: SpawnPoint[]
}

export class RectWall extends Rectangle implements Wall {
    body: Body;
    displayObject: DisplayObject;
    constructor(x: number, y: number, width: number, height: number) {
        super(x, y, width, height);
        this.body = Bodies.rectangle(x, y, width, height, {
            isStatic: true
        });
        this.displayObject = rectWireframe({x, y, width, height, color: 0xff0000});
    }
}

export class CircleWall extends Circle implements Wall {
    width: number;
    height: number;
    body: Body;
    displayObject: DisplayObject;
    constructor(x: number, y: number, radius: number) {
        super(x, y, radius);
        this.width = radius * 2;
        this.height = radius * 2;
        this.body = Bodies.circle(x, y, radius, {
            isStatic: true
        });
        this.displayObject = circleWireframe({x, y, radius, color: 0xff0000});
    }
}

export function loadMapFromTMXString(xmlstr: string): MapObjects {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlstr, "application/xml");

    const objects: Partial<MapObjects> = {};

    const groups = doc.querySelectorAll("objectgroup");
    groups.forEach(group => {
        const groupName = group.getAttribute("name");
        switch(groupName) {
            case "walls": 
                objects.walls = parseWalls(group);
                break;
            case "rooms":
                objects.rooms = parseRooms(group);
                break;
            case "spawn":
                objects.spawn = parseSpawns(group);
                break;
        }
    });

    return objects as MapObjects;
}


function parseWalls(group: Element): Wall[] {
    return Array.from(group.getElementsByTagName("object")).map(obj => {
        const isEllipse = !!obj.querySelector('ellipse');
        const {x, y, width, height} = getCenteredObjectSpec(obj);

        if (!isEllipse) {
            return new RectWall(x, y, width, height);
        }
        else {
            return new CircleWall(x, y, Math.min(width, height) / 2);
        }
    })
}

function parseRooms(group: Element): Room[] | undefined {
    return Array.from(group.getElementsByTagName("object")).map(obj => {
        const {x, y, width, height} = getCenteredObjectSpec(obj);
        const roomType = obj.getAttribute("type") || "";
        const roomName = obj.getAttribute("name") || "";

        return new Room(x, y, width, height, roomType, roomName);
    });
}

function parseSpawns(group: Element): SpawnPoint[] {
    return Array.from(group.getElementsByTagName("object")).map(obj => {
        const {x, y} = getPointData(obj);
        const pointType = obj.getAttribute("type") || "";
        const pointName = obj.getAttribute("name") || "";
        return new SpawnPoint(x, y, pointType, pointName);
    });
}

function getPointData(obj: Element): IPointData {
    return {
        x: +(obj.getAttribute("x") || "0"),
        y: +(obj.getAttribute("y") || "0")
    }
}

function getSizeData(obj: Element): ISize {
    return {
        width: +(obj.getAttribute("width") || "0"),
        height: +(obj.getAttribute("height") || "0")
    }
}

interface ObjectSpec extends IPointData, ISize {}

function getCenteredObjectSpec(obj: Element): ObjectSpec {
    const {x, y} = getPointData(obj);
    const {width, height} = getSizeData(obj);
    return {
        x: x + width / 2,
        y: y + height / 2,
        width,
        height
    }
}
