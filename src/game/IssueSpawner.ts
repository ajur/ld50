import { Guest } from "./Guest";
import { randomInt, randomUniform } from "d3-random";
import { Issue } from "./Issue";
import { msg } from "~/core";
import { House } from "./House";
import { addDebugMenu } from "~/menu";
import { FolderApi } from "tweakpane";


export class IssueSpawner {
    private house: House;
    private guests: Guest[];

    private minSpawnRate = 12_000;
    private hardIssueChance = 0.001;
    private rng01: () => number;
    
    private timeFromLastSpawn: number;
    
    disabled = false;

    constructor(house: House, guests: Guest[]) {
        this.house = house;
        this.guests = guests;

        this.timeFromLastSpawn = 0;

        this.rng01 = randomUniform();

        msg.on("triggerIssueSpawn", this.spawnIssue, this);

        addDebugMenu("issue spawner", this.addDebugMenu, this);
    }
    
    update(elapsedMS: number) {
        this.timeFromLastSpawn += elapsedMS;
        if (this.timeFromLastSpawn > this.minSpawnRate) {
            this.timeFromLastSpawn = 0;
            this.spawnIssueRandomGuest(true);
        }
    }

    private spawnIssueRandomGuest(forceHard = false) {
        if (this.guests.length == 0) return;
        const guest = this.guests[randomInt(this.guests.length)()];
        this.spawnIssue(guest, forceHard);
    }

    private spawnIssue(guest: Guest, forceHard = false) {
        if (this.disabled) return;

        this.timeFromLastSpawn = 0;

        const pos = this.house.randomPointNearGuest(guest);

        const hardIssueChanceWaged = this.hardIssueChance * this.guests.length;
        const isHard = forceHard || (this.rng01() < hardIssueChanceWaged);

        msg.emit("spawnedIssue", new Issue(pos, isHard));
    }

    private addDebugMenu(df: FolderApi) {
        df.addInput(this, 'disabled');
        df.addButton({title: 'Spawn issue'}).on('click', () => this.spawnIssueRandomGuest(false));
    }
}
