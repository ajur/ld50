/* eslint-disable @typescript-eslint/no-explicit-any */
import { gsap } from 'gsap';
import * as PIXI from 'pixi.js';
import * as SOUND from '@pixi/sound';
import { Pane } from 'tweakpane';

export function withGlobals(app: PIXI.Application, menu: Pane) {
    if (import.meta.env.PROD) {
        return;
    }

    const global = globalThis as any;

    console.log('Just for recap, what we have here...:')
    console.log('- PIXI - for some fun.. and dev tools')
    console.log('- PIXI.sound - make some noise!')
    global.PIXI = {
        ...PIXI,
        ...SOUND
    };
    console.log('- gsap - wiggle wiggle')
    global.gsap = gsap;

    console.log('- APP - like the whole game scene and stuff')
    global.APP = app;
    console.log('- MENU - tweakpane, until I replace it with something custom')
    global.MENU = menu;
}

export const isDebugOn = import.meta.env.DEV;
