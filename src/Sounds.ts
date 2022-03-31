import { Sound, sound } from "@pixi/sound";
import { gsap } from "gsap";
import { Pane } from "tweakpane";
import { fun, math, storage } from "./utils";

const STORAGE_KEY = "sound_config"

interface SoundConfig {
    volume: number,
    musicVolume: number
}

const soundConfigDefaults: SoundConfig = {
    volume: 0.5,
    musicVolume: 0.5
};


export class Sounds {

    private config: SoundConfig;
    private _currentTrack: Sound | undefined;
    private saveConfig: () => void;

    constructor(){
        this.saveConfig = fun.debounce(() => storage.save(STORAGE_KEY, this.config));

        this.config = storage.loadDefault(STORAGE_KEY, {...soundConfigDefaults});
        
        sound.volumeAll = this.config.volume;
    }

    playMusic(track: string) {
        const nextTrack = sound.find(track);
        if (!nextTrack) {
            console.warn(`Music track ${track} not found!`);
            return;
        }
        if (nextTrack == this._currentTrack) {
            return;
        }

        if (this._currentTrack) {
            this.fadeOut(this._currentTrack);
        }

        nextTrack.loop = true;
        this.fadeIn(nextTrack, {isMusic: true});
        this._currentTrack = nextTrack;
    }

    get currentTrack() {
        return this._currentTrack;
    }

    get volume() {
        return this.config.volume;
    }

    set volume(val: number) {
        sound.volumeAll = this.config.volume = math.clamp(val, 0, 1);
        this.saveConfig();
    }

    get musicVolume() {
        return this.config.musicVolume;
    }

    set musicVolume(val: number) {
        if (val === this.config.musicVolume) return;

        const vol = math.clamp(val, 0, 1);
        
        if (this._currentTrack) {
            this._currentTrack.volume = vol;
            if (vol > 0 && !this._currentTrack.isPlaying) {
                this.fadeIn(this._currentTrack);
            }
        }

        this.config.musicVolume = vol;
        this.saveConfig();
    }

    fadeIn(sound: Sound, {duration = 0.5, isMusic = false} = {}) {
        if (this.volume == 0 || isMusic && this.musicVolume == 0) return;
        const volume = isMusic ? this.config.musicVolume : 1;
        sound.volume = 0;
        sound.play();
        gsap.timeline()
            .to(sound, {volume, duration, ease: "sine.inOut"});
    }

    fadeOut(sound: Sound, {duration = 0.5} = {}) {
        gsap.timeline()
            .to(sound, {volume: 0, duration, ease: "sine.inOut"})
            .call(() => {sound.stop()});
    }

    addSoundsControlPanel(pane: Pane) {
        const snd = pane.addFolder({
            title: 'Sound'
        });
        snd.addInput(this, 'volume', {min: 0, max: 1.0, step: 0.1, label: 'global volume'});
        snd.addInput(this, 'musicVolume', {min: 0, max: 1.0, step: 0.1, label: 'music volume'});
    }
}

export const sounds = new Sounds();
