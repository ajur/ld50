import { SoundSpriteDataMap } from "@pixi/sound";
import { IAddOptions, LoaderResource } from "pixi.js";

export function assets(): IAddOptions[] {
    return [
        { name: "Haeresletter", url: "Haeresletter.otf"},
        { name: "ld50splash", url: "ld50aniversary.jpeg" },
        // { name: "basicHouse", url: "basicHouse.jpg"}
        { name: "house2", url: "house2.jpg"}
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
