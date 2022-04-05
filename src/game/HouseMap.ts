import { Circle, DisplayObject, IPointData, ISize, Rectangle } from "pixi.js";
import { enumFromStringValue } from "~/core/func";
import { Bodies, Body } from "matter-js";
import { circleWireframe, rectWireframe } from "~/core/display";
import { randomInt } from "d3-random";
import { center, clamp } from "~/core/math";
import { CATEGORY_WALLS, COLORS } from "~/consts";
import { IRect } from "~/core";

export class HouseMapLoader {
    static fromObjectsFromString(tmxContents: string): MapObjects {
        return loadMapFromTMXString(tmxContents);
    }
}

export interface MapObjects {
    walls: Wall[],
    rooms: Room[],
    spawn: SpawnPoint[]
}

export class Room extends Rectangle {
    readonly roomType: RoomType;
    readonly roomName: string;
    xPosRng: () => number;
    yPosRng: () => number;

    constructor(x: number, y: number, w: number, h: number, type: string, name: string) {
        super(x, y, w, h);
        this.roomType = enumFromStringValue(RoomType, type);
        this.roomName = name;

        this.xPosRng = randomInt(this.left, this.right);
        this.yPosRng = randomInt(this.top, this.bottom);
    }

    randomPoint(offset = 0): IPointData {
        return {
            x: clamp(this.xPosRng(), this.left + offset, this.right - offset),
            y: clamp(this.yPosRng(), this.top + offset, this.bottom - offset)
        };
    }
}

export enum RoomType {
    BATHROOM = "bathroom",
    KITCHEN = "kitchen",
    BEDROOM = "bedroom",
    LIVINGROOM = "livingroom",
    HALL = "hall",
    GARDEN = "garden",
    GARAGE = "garage",
    EXIT = "exit"
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

export interface Wall extends IPointData, ISize {
    body: Body;
    displayObject: DisplayObject;
    contains(x: number, y: number): boolean;
}

export class RectWall extends Rectangle implements Wall {
    body: Body;
    displayObject: DisplayObject;
    constructor(x: number, y: number, width: number, height: number) {
        super(x, y, width, height);
        const {x: cx, y: cy} = center(x, y, width, height);
        this.body = Bodies.rectangle(cx, cy, width, height, {
            isStatic: true,
            collisionFilter: {
                category: CATEGORY_WALLS
            }
        });
        this.displayObject = rectWireframe({x: cx, y: cy, width, height, color: COLORS.RED});
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
            isStatic: true,
            collisionFilter: {
                category: CATEGORY_WALLS
            }
        });
        this.displayObject = circleWireframe({x, y, radius, color: COLORS.RED});
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
                objects.walls = (objects.walls || []).concat(parseWalls(group));
                break;
            case "furniture":
                objects.walls = (objects.walls || []).concat(parseWalls(group));
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
        const {x, y, width, height} = getObjectSpec(obj);

        if (!isEllipse) {
            return new RectWall(x, y, width, height);
        }
        else {
            const r = Math.min(width, height) / 2;
            const {x: cx, y: cy} = center(x, y, width, height);
            return new CircleWall(cx, cy, r);
        }
    })
}

function parseRooms(group: Element): Room[] | undefined {
    return Array.from(group.getElementsByTagName("object")).map(obj => {
        const {x, y, width, height, type, name} = getObjectSpec(obj);
        return new Room(x, y, width, height, type, name);
    });
}

function parseSpawns(group: Element): SpawnPoint[] {
    return Array.from(group.getElementsByTagName("object")).map(obj => {
        const {x, y, name, type} = getObjectSpec(obj);
        return new SpawnPoint(x, y, type, name);
    });
}

interface ObjectSpec extends IRect {
    type: string,
    name: string
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

function getObjectSpec(obj: Element): ObjectSpec {
    return {
        ...getPointData(obj),
        ...getSizeData(obj),
        type: obj.getAttribute("type") || "",
        name: obj.getAttribute("name") || ""
    }
}
