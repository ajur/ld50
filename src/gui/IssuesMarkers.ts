import { Vector } from "matter-js";
import { Container, IPointData, PI_2, Sprite } from "pixi.js";
import { COLOR_HARD_ISSUE, COLOR_ISSUE } from "~/consts";
import { msg } from "~/core";
import { Rect, withinEpsilon } from "~/core/math";
import { Issue } from "~/game/Issue";
import { Player } from "~/game/Player";

const PI = Math.PI;
const tan = Math.tan;
const atan2 = Math.atan2;


export class IssuesMarker extends Container {
    markers: Sprite[];
    screenRect: Rect;
    
    lastPlayerPos: IPointData;
    lastIssuesCount: number;

    constructor() {
        super();

        this.markers = [];
        this.screenRect = new Rect();

        this.lastPlayerPos = {x: 0, y: 0};
        this.lastIssuesCount = 0;

        msg.on('gameUpdate', this.gameUpdate, this);
    }

    resize(width: number, height: number) {
        this.screenRect.width = width;
        this.screenRect.height = height;

        this.position.set(this.screenRect.cx, this.screenRect.cy);
    }
    
    gameUpdate(player: Player, issues: Map<number, Issue>) {
        if (!this.hasChanged(player, issues.size)) return;
        
        this.lastIssuesCount = issues.size;
        this.lastPlayerPos = Vector.clone(player.position);

        let idx = 0;
        for (const issue of issues.values()) {
            const issuePosRel = Vector.sub(issue.position, this.lastPlayerPos);
            if (this.issueVisible(issuePosRel)) continue;
            const {x, y, angle} = markerPos(issuePosRel, this.screenRect);
            const marker = this.getMarker(idx);
            marker.position.set(x, y);
            marker.rotation = angle;
            marker.visible = true;
            marker.tint = issue.isHard ? COLOR_HARD_ISSUE : COLOR_ISSUE;
            ++idx;
        }
        for (;idx < this.markers.length; ++idx) {
            this.markers[idx].visible = false;
        }
    }

    private issueVisible(issuePosRel: IPointData) {
        const {x, y} = Vector.add(issuePosRel, {x: this.screenRect.cx, y: this.screenRect.cy});
        return this.screenRect.contains(x, y);
    }

    private hasChanged(player: Player, issuesCount: number) {
        return !withinEpsilon(player.position.x, this.lastPlayerPos.x)
            || !withinEpsilon(player.position.y, this.lastPlayerPos.y)
            || this.lastIssuesCount != issuesCount;
    }

    private getMarker(idx: number) {
        if (!this.markers[idx]) {
            this.markers[idx] = this.addMarker();
        }
        return this.markers[idx];
    }

    private addMarker() {
        const g = Sprite.from("marker");
        g.anchor.set(1, 0.5);
        g.scale.set(0.5);
        // g.alpha = 0.5;
        return this.addChild(g);
    }
}

interface MarkerPosition extends IPointData {
    angle: number
}

function markerPos(vecFromCenter: IPointData, {cx, cy}: Rect): MarkerPosition {
    
    const ad = atan2(vecFromCenter.y, vecFromCenter.x);
    const a = ad < 0 ? PI_2 + ad : ad;

    const a1 = atan2(cy, cx);
    const a2 = PI - a1;
    const a3 = PI + a1;
    const a4 = PI_2 - a1;

    let tx = 0;
    let ty = 0;

    if (a >= a1 && a < a2) {
        tx = cy / tan(a);
        ty = cy;
    }
    else if (a >= a2 && a < a3) {
        tx = -cx;
        ty = -cx * tan(a);
    }
    else if (a >= a3 && a < a4) {
        tx = -cy / tan(a);
        ty = -cy;
    }
    else if (a >= a4 || a < a1) {
        tx = cx;
        ty = cx * tan(a);
    }
    return {x: tx, y: ty, angle: a};
}