import { SoundSpriteDataMap } from "@pixi/sound";
import { IAddOptions, LoaderResource } from "pixi.js";

export function assets(): IAddOptions[] {
    return [
        { name: "Haeresletter", url: "Haeresletter.otf"},
        { name: "house2", url: "house2v2.jpg"},
        { name: "marker", url: "marker.png"},
        { name: "door_slam", url: "door_slam.mp3"},
        { name: "record_scratch", url: "record-scratch.mp3"},
        { name: "theme", url: "theme.m4a"},
        { name: "track_alt", url: "track_alt.m4a"},
        { name: "track_main", url: "track_main.m4a"},
    ].map(fixBasePath);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const withSoundSprites = 
    (sprites: SoundSpriteDataMap) => 
        (resource: LoaderResource) => resource.sound?.addSprites(sprites);

const fixBasePath = 
    (opt: IAddOptions) => {
        if (opt.url) {
            return {...opt, url: import.meta.env.BASE_URL + opt.url};
        }
        return opt;
    };
