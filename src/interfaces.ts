import { Container } from "pixi.js";

export interface Resizable {
    resize(width: number, height: number): void;
}

export interface Scene extends Container, Resizable {
    
}
