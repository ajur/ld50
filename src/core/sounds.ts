import { Sound, sound, filters } from "@pixi/sound";
import { gsap } from "gsap";
import { Pane } from "tweakpane";
import { debounce } from "./func";
import { clamp, modulo } from "./math";
import { localLoadDefault, localSave } from "./storage";

const STORAGE_KEY = "sound_config"

interface SoundConfig {
    volume: number,
    musicVolume: number
}

const soundConfigDefaults: SoundConfig = {
    volume: 0.8,
    musicVolume: 0.8
};

export type EQs = "none" | "low" | "mid";
const EQ = {
    "none": {
        "f32": 0,
        "f64": 0,
        "f125": 0,
        "f250": 0,
        "f500": 0,
        "f1k": 0,
        "f2k": 0,
        "f4k": 0,
        "f8k": 0,
        "f16k": 0
    },
    "low": {
        "f32": 2,
        "f64": 11,
        "f125": 10,
        "f250": 1,
        "f500": -13,
        "f1k": -28,
        "f2k": -40,
        "f4k": -40,
        "f8k": -40,
        "f16k": -40
    },
    "mid": {
        "f32": 0,
        "f64": 0,
        "f125": 0,
        "f250": -3,
        "f500": -7,
        "f1k": -10,
        "f2k": -13,
        "f4k": -15,
        "f8k": -15,
        "f16k": -15
    }
};


export class Sounds {

    private config: SoundConfig;
    private _currentTrack: Sound | undefined;
    private saveConfig: () => void;

    constructor() {
        this.saveConfig = debounce(() => localSave(STORAGE_KEY, this.config));

        this.config = localLoadDefault(STORAGE_KEY, { ...soundConfigDefaults });

        sound.volumeAll = this.config.volume;
    }

    playMusic(track: string, {startAt = -1, eq = "none" as EQs, fadeTime = 1} = {}) {
        const nextTrack = sound.find(track);
        if (!nextTrack) {
            console.warn(`Music track ${track} not found!`);
            return;
        }
        if (nextTrack == this._currentTrack) {
            this.equilizer(eq);
            return;
        }

        let start = startAt;
        if (this._currentTrack) {
            this.fadeOut(this._currentTrack, {duration: fadeTime});
            if (startAt < 0) {
                start = modulo(this._currentTrack.context.audioContext.currentTime, nextTrack.duration);
            }
        }
        if (start < 0) {
            start = 0;
        }
        
        nextTrack.loop = true;
        this.fadeIn(nextTrack, { isMusic: true, start, duration: fadeTime });
        this._currentTrack = nextTrack;
        this.equilizer(eq);
    }

    stopMusic(fadeOut = true) {
        if (this._currentTrack) {
            if (fadeOut) {
                this.fadeOut(this._currentTrack);
            }
            else {
                this._currentTrack.stop();
            }
            this._currentTrack = undefined;
        }
    }

    equilizer(eq: EQs) {
        if (!this._currentTrack) return;
        if (eq === "none") {
            if (this._currentTrack.filters?.length > 0) {
                const eqFl = this._currentTrack.filters[0] as filters.EqualizerFilter;
                gsap.killTweensOf(eqFl);
                gsap.to(eqFl, {...EQ["none"], onComplete: () => {
                    if (this._currentTrack) this._currentTrack.filters = [];
                }});
            }
        }
        else {
            let eqFl;
            if (this._currentTrack.filters?.length > 0) {
                eqFl = this._currentTrack.filters[0] as filters.EqualizerFilter;
                gsap.killTweensOf(eqFl);
            } else {
                eqFl = new filters.EqualizerFilter();
                this._currentTrack.filters = [eqFl];
            }
            gsap.to(eqFl, EQ[eq]);
        }
    }

    get currentTrack() {
        return this._currentTrack;
    }

    get volume() {
        return this.config.volume;
    }

    set volume(val: number) {
        sound.volumeAll = this.config.volume = clamp(val, 0, 1);
        this.saveConfig();
    }

    get musicVolume() {
        return this.config.musicVolume;
    }

    set musicVolume(val: number) {
        if (val === this.config.musicVolume) return;

        const vol = clamp(val, 0, 1);

        if (this._currentTrack) {
            this._currentTrack.volume = vol;
            if (vol > 0 && !this._currentTrack.isPlaying) {
                this.fadeIn(this._currentTrack);
            }
        }

        this.config.musicVolume = vol;
        this.saveConfig();
    }

    fadeIn(sound: Sound, { duration = 0.5, isMusic = false, start = 0 } = {}) {
        if (this.volume == 0 || isMusic && this.musicVolume == 0) return;
        const volume = isMusic ? this.config.musicVolume : 1;
        sound.volume = 0;
        sound.play({ start });
        gsap.timeline()
            .to(sound, { volume, duration, ease: "sine.inOut" });
    }

    fadeOut(sound: Sound, { duration = 0.5 } = {}) {
        gsap.timeline()
            .to(sound, { volume: 0, duration, ease: "sine.inOut" })
            .call(() => { sound.stop() });
    }

    addSoundsControlPanel(pane: Pane) {
        const snd = pane.addFolder({
            title: 'Sound'
        });
        snd.addInput(this, 'volume', { min: 0, max: 1.0, step: 0.1, label: 'global volume' });
        snd.addInput(this, 'musicVolume', { min: 0, max: 1.0, step: 0.1, label: 'music volume' });
    }
}

export const sounds = new Sounds();
