import { Body, Composite, Engine, Events, IEventCollision, IPair } from "matter-js";
import { Container, Ticker } from "pixi.js";
import { msg, Scene, sounds } from "~/core";
import { Player } from "./Player";
import { House } from "./House";
import { Guest } from "./Guest";
import { IssueSpawner } from "./IssueSpawner";
import { Issue } from "./Issue";
import { CATEGORY_ISSUES } from "~/consts";
import { clamp } from "~/core/math";

import basicHouseXMLContents from "./house2.tmx?raw";
import { GuestSpawner } from "./GuestSpawner";
import { Room } from "./HouseMap";
import { sound } from "@pixi/sound";

type LevelSpec = [string, string];
const LEVEL_SPEC: LevelSpec = ["house2", basicHouseXMLContents];


export class GameScene extends Container implements Scene {
    house: House;
    guestsLayer: Container;
    guests: Guest[];
    guestsSpawner: GuestSpawner;
    player: Player;
    currentRoom: Room;
    
    physicsEngine: Engine;
    issueSpawner: IssueSpawner;
    issues: Map<number, Issue>;
    issuesLayer: Container;

    screenWidth = 0;
    screenHeight = 0;

    resolvedIssues = 0;

    playTime = 0;
    groundedProgress = 100;

    isPaused = true;
    
    constructor() {
        super();

        this.physicsEngine = Engine.create();
        this.physicsEngine.gravity.x = 0;
        this.physicsEngine.gravity.y = 0;

        this.house = this.addHouse(LEVEL_SPEC);
        this.issuesLayer = this.addChild(new Container());
        this.guestsLayer = this.addChild(new Container());
        
        this.guests = [];
        this.guestsSpawner = new GuestSpawner(this.house);
        msg.on("spawnedGuest", this.spawnedGuest, this);
        this.guestsSpawner.spawnInitial(10);
        
        this.player = this.addPlayer();
        this.currentRoom = this.house.roomAt(this.player.position) || this.house.rooms[0];

        this.issues = new Map<number, Issue>();
        this.issueSpawner = new IssueSpawner(this.house, this.guests);
        msg.on("spawnedIssue", this.spawnedIssue, this);
        msg.on("issueResolved", this.issueResolved, this);

        Events.on(this.physicsEngine, "collisionStart", (evt) => this.onCollisionEvent(evt));
        Events.on(this.physicsEngine, "collisionEnd", (evt) => this.onCollisionEvent(evt));

        Ticker.shared.add(this.update, this);
        msg.once("gameStart", this.startGame, this);

        this.interactiveChildren = false;  // optimization
    }

    resize(width: number, height: number): void {
        this.screenWidth = width;
        this.screenHeight = height;
        this.updateCameraPosition();
    }

    update() {
        const deltaMS = Ticker.shared.deltaMS;
        if (!this.isPaused) {
            this.player.move();
            this.guests.forEach(g => g.update(deltaMS));
            this.issueSpawner.update(deltaMS);
            this.issues.forEach(issue => issue.update(deltaMS));
            this.playTime += deltaMS;
            msg.emit("playTimeUpdated", this.playTime);
        }
        
        Engine.update(this.physicsEngine, deltaMS);
        
        this.guests.forEach(g => g.updatePosition());
        this.player.updatePosition();
        this.updateCameraPosition();
        this.updateRoom();
        msg.emit('gameUpdate', this.player, this.issues);
    }

    updateCameraPosition() {
        const cx = this.screenWidth / 2;
        const cy = this.screenHeight / 2;
        
        const ox = cx - this.player.x;
        const oy = cy - this.player.y;

        this.position.set(ox, oy);
    }

    updateRoom() {
        const room = this.house.roomAt(this.player.position);
        if (room && room !== this.currentRoom) {
            this.currentRoom = room;
            msg.emit('enteredRoom', room);
        }
    }

    private startGame() {
        this.isPaused = false;
        msg.emit("issuesCounterChanged", this.issues.size);
        msg.emit("resolvedIssuesCounterChanged", this.resolvedIssues);
        msg.emit("guestsCountChanged", this.guests.length);
        this.emitGameProgress();
        sounds.playMusic('track_main', {startAt: 0});
    }

    private gameOver() {
        this.isPaused = true;
        sound.play('record_scratch', {volume: 0.5});
        setTimeout(() => {
            sound.play('door_slam');
            sounds.stopMusic(false);
            sounds.playMusic('theme', {startAt: 60, fadeTime: 5});
        }, 300);
        msg.emit("gameOver", {
            resolved: this.resolvedIssues,
            left: this.issues.size,
            guests: this.guests.length,
            time: this.playTime
        });
    }

    private emitGameProgress() {
        const progress = clamp(100 - this.groundedProgress, 0, 100) / 100;
        msg.emit("groundedProgressChanged", progress);
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

    private spawnedGuest(guest: Guest) {
        this.guests.push(guest);
        this.guestsLayer.addChild(guest);
        Composite.add(this.physicsEngine.world, [guest.body, guest.link]);
        msg.emit("guestsCountChanged", this.guests.length);
    }

    private spawnedIssue(issue: Issue) {
        this.issues.set(issue.body.id, issue);
        this.issuesLayer.addChild(issue);
        Composite.add(this.physicsEngine.world, [issue.body]);
        msg.emit("issuesCounterChanged", this.issues.size);
        
        this.groundedProgress -= issue.groundedProgress;
        this.emitGameProgress();
        if (this.groundedProgress <= 0) {
            this.gameOver();
        }
    }

    private issueResolved(issue: Issue) {
        this.issues.delete(issue.body.id);
        Composite.remove(this.physicsEngine.world, issue.body);
        msg.emit("issuesCounterChanged", this.issues.size);

        this.resolvedIssues += 1;
        msg.emit("resolvedIssuesCounterChanged", this.resolvedIssues);
        
        this.groundedProgress += issue.groundedDelayed;
        this.emitGameProgress();
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
