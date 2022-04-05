import { EventEmitter } from "@pixi/utils";
import { Guest } from "./Guest";
import { randomInt, randomUniform } from "d3-random";
import { Issue } from "./Issue";
import { msg } from "~/core";
import { House } from "./House";

export class IssueSpawner extends EventEmitter {
    private house: House;
    private guests: Guest[];

    private timeFromLastSpawn: number;
    private minSpawnRate: number;
    private hardIssueChance = 0.001;
    private rng01: () => number;

    constructor(house: House, guests: Guest[]) {
        super();
        this.house = house;
        this.guests = guests;

        this.timeFromLastSpawn = 0;
        this.minSpawnRate = 10000;

        this.rng01 = randomUniform();

        msg.on("triggerIssueSpawn", this.spawnIssue, this);
    }

    update(elapsedMS: number) {
        this.timeFromLastSpawn += elapsedMS;
        if (this.timeFromLastSpawn > this.minSpawnRate) {
            this.timeFromLastSpawn = 0;
            this.spawnIssueRandomGuest();
        }
    }

    private spawnIssueRandomGuest() {
        const guest = this.guests[randomInt(this.guests.length)()];
        this.spawnIssue(guest, true);
    }

    private spawnIssue(guest: Guest, forceHard = false) {
        this.timeFromLastSpawn = 0;

        const pos = this.house.randomPointNearGuest(guest);

        const hardIssueChanceWaged = this.hardIssueChance * this.guests.length;
        const isHard = forceHard || (this.rng01() < hardIssueChanceWaged);

        this.emit("spawnedIssue", new Issue(pos, isHard));
    }
}
