import { msg } from "~/core";
import { House } from "./House";
import { Guest } from "./Guest";
import { randomInt } from "d3-random";
import { GuestSpot } from "./HouseMap";


interface GuestSpotCounter {
    count: number;
    limit: number;
    idx: number;
}

export class GuestSpawner {

    nextGuestAfterResolvedIssues = 5;
    guestsSpots: GuestSpot[];
    guestsAtSpot: GuestSpotCounter[];
    
    initialSpotsCount: number;
    
    guestsSpotsRng: () => number;

    constructor(house: House) {
        this.guestsSpots = [...house.guestsSpawns].sort((a, b) => a.order - b.order);
        this.guestsAtSpot = this.guestsSpots.map((gs, idx) => ({ idx, count: 0, limit: gs.limit}));
        this.initialSpotsCount = this.guestsSpots.filter(gs => gs.order == this.guestsSpots[0].order).length;

        this.guestsSpotsRng = randomInt(0, this.guestsSpots.length);

        msg.on("resolvedIssuesCounterChanged", this.issueCounterChanged, this);
    }

    spawnInitial(count: number) {
        let i = 0;
        while (i < this.initialSpotsCount && i < count) {
            this.spawnGuestAt(i);
            ++i;
        }
        while (i < count) {
            this.spawnGuestAt(this.getGuestSpawnPointIndex());
            ++i;
        }
    }

    issueCounterChanged(resolvedIssues: number) {
        if (resolvedIssues >= this.nextGuestAfterResolvedIssues) {
            this.nextGuestAfterResolvedIssues += randomInt(3, 6)();
            this.spawnGuestAt(this.getGuestSpawnPointIndex());
        }
    }

    spawnGuestAt(spotIndex: number) {
        const guest = new Guest(this.guestsSpots[spotIndex]);
        this.guestsAtSpot[spotIndex].count += 1;
        msg.emit("spawnedGuest", guest);
    }

    getGuestSpawnPointIndex(): number {
        // fist, add some company to loners
        let spots = this.guestsAtSpot.filter(gas => gas.count == 1 && gas.limit > 1);
        let idx: number;
        if (spots.length > 0) {
            idx = spots[randomInt(spots.length)()].idx;
        }
        else {
            // now add guest to spot where there is still some space left
            spots = this.guestsAtSpot.filter(gas => gas.count < gas.limit);
            if (spots.length > 0) {
                idx = spots[randomInt(spots.length)()].idx;
            }
            else {
                // if all places are full, just add it anywhere
                idx = this.guestsSpotsRng();
            }
        }

        return idx;
    }
}
