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
    furniture: Wall[],
    spots: GuestSpot[],
    nodes: PathNode[],
    playerSpawn: SpawnPoint[],
    guestsSpawn: SpawnPoint[]
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

enum ObjectType {
    Wall = "Wall",
    Room = "Room",
    Furniture = "Furniture",
    GuestSpot = "GuestSpot",
    PathNode = "PathNode",
    GuestSpawnPoint = "GuestSpawnPoint",
    PlayerSpawnPoint = "PlayerSpawnPoint",
    Exit = "Exit",
}

export enum SpawnPointType {
    PLAYER = "player",
    GUEST = "guest"
}

export class SpawnPoint implements IPointData {
    constructor(
        readonly id: number,
        readonly x: number,
        readonly y: number,
        readonly type: SpawnPointType,
        readonly name = "") {    
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

export class GuestSpot implements IPointData {
    constructor(
        readonly id: number,
        readonly x: number , 
        readonly y: number,
        readonly limit: number,
        readonly order: number) {
    }
}

export class PathNode implements IPointData {
    constructor(
        readonly id: number,
        readonly x: number,
        readonly y: number,
        readonly links: number[]){
    }
}

export function loadMapFromTMXString(xmlstr: string): MapObjects {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlstr, "application/xml");

    const objects: MapObjects = {
        walls: objectsByType(doc, ObjectType.Wall, parseWall),
        rooms: objectsByType(doc, ObjectType.Room, parseRoom),
        furniture: objectsByType(doc, ObjectType.Furniture, parseWall),
        spots: objectsByType(doc, ObjectType.GuestSpot, parseGuestSpot),
        nodes: objectsByType(doc, ObjectType.PathNode, parsePathNode),
        playerSpawn: objectsByType(doc, ObjectType.PlayerSpawnPoint, parseSpawn),
        guestsSpawn: objectsByType(doc, ObjectType.GuestSpawnPoint, parseSpawn)
    };

    return objects as MapObjects;
}

function objectsByType<T>(doc: Document, type: ObjectType, parser: (el: Element) => T): T[] {
    const els = doc.querySelectorAll(`object[type=${type}]`);
    return Array.from(els).map(parser);
}


function parseWall(obj: Element): Wall {
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
}

function parseRoom(obj: Element): Room {
    const {x, y, width, height, name} = getObjectSpec(obj);
    const typeVal = getProperty(obj, "roomType", "bedroom");
    const type = enumFromStringValue(RoomType, typeVal);
    return new Room(x, y, width, height, type, name);
}

function parseSpawn(obj: Element): SpawnPoint {
    const {id, x, y, name, type} = getObjectSpec(obj);
    const typeVal = type == 'PlayerSpawnPoint' ? SpawnPointType.PLAYER : SpawnPointType.GUEST;
    return new SpawnPoint(id, x, y, typeVal, name);
}

function parseGuestSpot(obj: Element): GuestSpot {
    const {id, x, y} = getObjectSpec(obj);
    const limit = +getProperty(obj, "limit", "0");
    const order = +getProperty(obj, "order", "0");
    return new GuestSpot(id, x, y, limit, order);
}

function parsePathNode(obj: Element): PathNode {
    const {id, x, y} = getObjectSpec(obj);
    const links: number[] = Array.from({length: 10})
        .map((_,idx) => +getProperty(obj, 'link'+idx, '0'))
        .filter(prop => prop > 0)
    return new PathNode(id, x, y, links);
}

interface ObjectSpec extends IRect {
    id: number,
    type: string,
    name: string
}

function getObjectSpec(obj: Element): ObjectSpec {
    return {
        id: getNumberAttr(obj, "id"),
        x: getNumberAttr(obj, "x"),
        y: getNumberAttr(obj, "y"),
        width: getNumberAttr(obj, "width"),
        height: getNumberAttr(obj, "height"),
        type: getStringAttr(obj, "type"),
        name: getStringAttr(obj, "name")
    }
}

function getAttribute<T>(el: Element, name: string, fallback: T, parser: (a: string) => T): T {
    const val = el.getAttribute(name);
    return val != null ? parser(val) : fallback;
}
function getStringAttr(el: Element, name: string, fallback = ""): string {
    return getAttribute(el, name, fallback, v => v);
}
function getNumberAttr(el: Element, name: string, fallback = 0): number {
    return getAttribute(el, name, fallback, v => +v);
}

function getProperty(obj: Element, name: string): string | undefined;
function getProperty(obj: Element, name: string, fallback: string): string;
function getProperty(obj: Element, name: string, fallback?: string): string | undefined {
    return obj.querySelector(`property[name=${name}]`)?.getAttribute('value') ?? fallback;
}
