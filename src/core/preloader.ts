/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { gsap } from "gsap";
import { WebfontLoaderPlugin } from "pixi-webfont-loader";
import { IAddOptions, Loader } from 'pixi.js';
import { msg } from '.';

Loader.registerPlugin(WebfontLoaderPlugin);


export type PreloaderOptions = {
    assets: IAddOptions[],
    onLoaded: Loader.OnCompleteSignal,
    onClicked?: () => void,
    onRevealed?: () => void,
    revealTime?: number,
    logoAnimTime?: number
}


export function preload({assets, onLoaded, onClicked, onRevealed, revealTime = 0.3, logoAnimTime = 1}: PreloaderOptions) {
    const preloaderDiv: HTMLDivElement = document.querySelector('#preloader')!;
    const footerDiv: HTMLDivElement = preloaderDiv.querySelector(".preloader-footer")!;
    const logoPath: SVGPathElement = preloaderDiv.querySelector("svg path")!;
    
    const logoPathLength = logoPath.getTotalLength();
    logoPath.style.strokeDasharray = `${logoPathLength} ${logoPathLength}`;
    logoPath.style.strokeDashoffset = `${logoPathLength}`;
    logoPath.style.strokeOpacity = '1.0';
    gsap.to(logoPath.style, {duration: logoAnimTime, strokeDashoffset: 0, ease: 'power2.inOut'});
    
    
    const preloaderRevealed = () => {
        gsap.killTweensOf(logoPath.style);
        preloaderDiv.remove();
        msg.emit("preloaderClosed");
        onRevealed?.();
    }
    
    const preloaderClicked = () => {
        gsap.to(preloaderDiv!, {duration: revealTime, top: '-100%', onComplete: preloaderRevealed});
        msg.emit("preloaderClosing");
        onClicked?.();
    }
    
    const loadingCompleted: Loader.OnCompleteSignal = (...args) => {
        loader.onProgress.detachAll();
        footerDiv.innerHTML = '<span class="blink">ready</div>'
        preloaderDiv.addEventListener('pointerdown', preloaderClicked, {once: true});
        msg.emit("assetsLoaded");
        onLoaded(...args);
    }

    const updateProgress: Loader.OnProgressSignal = (progLoader: Loader) => {
        footerDiv.style.width = `${progLoader.progress}%`;
    }
    
    const loader = Loader.shared;

    loader.onProgress.add(updateProgress);
    loader.onComplete.once(loadingCompleted);
    
    loader.add(assets);
    loader.load();
}
