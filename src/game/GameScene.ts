import { Body, Composite, Engine, Events, IEventCollision, IPair } from "matter-js";
import { Container, Ticker } from "pixi.js";
import { msg, Scene } from "~/core";
import { Player } from "./Player";
import { House } from "./House";
import { Guest } from "./Guest";

import basicHouseXMLContents from "./basicHouse.tmx?raw";
import { IssueSpawner } from "./IssueSpawner";
import { Issue } from "./Issue";
import { CATEGORY_ISSUES } from "~/consts";
import { randomInt } from "d3-random";


type LevelSpec = [string, string];
const LEVEL_SPEC: LevelSpec = ["basicHouse", basicHouseXMLContents];


export class GameScene extends Container implements Scene {
    house: House;
    guestsLayer: Container;
    guests: Guest[];
    player: Player;
    
    physicsEngine: Engine;
    issueSpawner: IssueSpawner;
    issues: Map<number, Issue>;
    issuesLayer: Container;

    screenWidth = 0;
    screenHeight = 0;

    resolvedIssues = 0;
    nextGuestAfterResolvedIssues = 10;

    isPaused = true;
    
    constructor() {
        super();

        this.physicsEngine = Engine.create();
        this.physicsEngine.gravity.x = 0;
        this.physicsEngine.gravity.y = 0;

        this.house = this.addHouse(LEVEL_SPEC);
        this.issuesLayer = this.addChild(new Container());
        this.guestsLayer = this.addChild(new Container());
        
        this.guests = this.addInitialGuests(10);
        
        this.player = this.addPlayer();

        this.issues = new Map<number, Issue>();
        this.issueSpawner = new IssueSpawner(this.house.rooms, this.guests);
        this.issueSpawner.on("spawnedIssue", this.spawnedIssue, this);
        msg.on("issueResolved", this.issueResolved, this);

        Events.on(this.physicsEngine, "collisionStart", (evt) => this.onCollisionEvent(evt));
        Events.on(this.physicsEngine, "collisionEnd", (evt) => this.onCollisionEvent(evt));

        Ticker.shared.add(this.update, this);
        msg.once("preloaderClosed", this.startGame, this);
    }

    resize(width: number, height: number): void {
        this.screenWidth = width;
        this.screenHeight = height;
        this.updateCameraPosition();
    }

    updateCameraPosition() {
        const cx = this.screenWidth / 2;
        const cy = this.screenHeight / 2;
        
        const ox = cx - this.player.x;
        const oy = cy - this.player.y;

        this.position.set(ox, oy);
    }

    update() {
        if (!this.isPaused) {
            this.player.move();
            this.guests.forEach(g => g.update(Ticker.shared.deltaMS));
            this.issueSpawner.update(Ticker.shared.deltaMS);
            this.issues.forEach(issue => issue.update(Ticker.shared.deltaMS));
        }
        
        Engine.update(this.physicsEngine, Ticker.shared.deltaMS);
        
        this.player.updatePosition();
        this.guests.forEach(g => g.updatePosition());
        this.updateCameraPosition();
    }

    private startGame() {
        this.isPaused = false;
        msg.emit("issuesCounterChanged", this.issues.size);
        msg.emit("resolvedIssuesCounterChanged", this.resolvedIssues);
        msg.emit("guestsCountChanged", this.guests.length);
    }

    private addHouse([sprite, xmlraw]: LevelSpec): House {
        const house = this.addChild(new House(sprite, xmlraw));
        Composite.add(this.physicsEngine.world, house.getWallsBodies());
        return house;
    }

    private addPlayer(): Player {
        const player = this.addChild(new Player(this.house.getPlayerSpawnPoint()));
        Composite.add(this.physicsEngine.world, [player.body]);
        return player;
    }

    private addInitialGuests(count: number): Guest[] {
        return Array.from({ length: count }).map(() => this.addGuest());
    }

    private addGuest() {
        const g = new Guest(this.house.getGuestSpawnPoint());
        this.guestsLayer.addChild(g);
        Composite.add(this.physicsEngine.world, [g.body, g.link]);
        return g;
    }

    private spawnedIssue(issue: Issue) {
        this.issues.set(issue.body.id, issue);
        this.issuesLayer.addChild(issue);
        Composite.add(this.physicsEngine.world, [issue.body]);
        msg.emit("issuesCounterChanged", this.issues.size);
    }

    private issueResolved(issue: Issue) {
        this.issues.delete(issue.body.id);
        Composite.remove(this.physicsEngine.world, issue.body);
        msg.emit("issuesCounterChanged", this.issues.size);

        this.resolvedIssues += 1;
        msg.emit("resolvedIssuesCounterChanged", this.resolvedIssues);
        if (this.resolvedIssues > this.nextGuestAfterResolvedIssues) {
            this.nextGuestAfterResolvedIssues += randomInt(6,10)();
            this.guests.push(this.addGuest());
            msg.emit("guestsCountChanged", this.guests.length);
        }
    }

    private onCollisionEvent(evt: IEventCollision<Engine>): void {
        if (evt.name == "collisionStart" || evt.name == "collisionEnd") {
            const issues = this.filterPlayerCollisionsWithIssues(evt.pairs);
            if (issues.length > 0) {
                if (evt.name == "collisionStart") {
                    this.player.issuesEntered(issues);
                } else {
                    this.player.issuesExited(issues);
                }
            }
        }
    }

    private filterPlayerCollisionsWithIssues(pairs: IPair[]): Issue[] {
        const playerId = this.player.body.id;
        const issues = [];
        for (const pair of pairs) {
            let body: Body | undefined;
            if (pair.bodyA.id == playerId) {
                body = pair.bodyB;
            }
            else if(pair.bodyB.id == playerId) {
                body = pair.bodyA;
            }
            if (body?.collisionFilter.category === CATEGORY_ISSUES) {
                const issue = this.issues.get(body?.id);
                if (issue) {
                    issues.push(issue);
                }
            }
        }
        return issues;
    }
}
