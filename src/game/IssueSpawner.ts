import { EventEmitter } from "@pixi/utils";
import { Guest } from "./Guest";
import { Room } from "./HouseMap";
import { randomInt, randomUniform } from "d3-random";
import { Issue } from "./Issue";

export class IssueSpawner extends EventEmitter {
    private rooms: Room[];
    private guests: Guest[];

    private timeFromLastSpawn: number;
    private spawnRate: number;
    private hardIssueChance = 0.01;
    private rng01: () => number;

    constructor(rooms: Room[], guests: Guest[]) {
        super();
        this.rooms = rooms;
        this.guests = guests;

        this.timeFromLastSpawn = 0;
        this.spawnRate = 5000;

        this.rng01 = randomUniform();
    }

    update(elapsedMS: number) {
        this.timeFromLastSpawn += elapsedMS;
        if (this.timeFromLastSpawn > this.spawnRate) {
            this.timeFromLastSpawn = 0;
            this.spawnIssue();
        }
    }

    private spawnIssue() {
        const guest = this.guests[randomInt(this.guests.length)()];
        const room = this.rooms.find(r => r.contains(guest.x, guest.y));

        if (!room)
            return;

        const pos = room.randomPoint(Issue.margin)
        const isHard = (this.rng01() < this.hardIssueChance);

        this.emit("spawnedIssue", new Issue(pos, isHard));
    }
}
