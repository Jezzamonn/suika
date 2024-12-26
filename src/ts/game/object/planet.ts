import { Circle, Vec2, World } from "planck";
import { DISPLAY_TO_M } from "../constants";
import { PhysObject } from "./phys-object";

export const planetRadiusDisp = 40;

export class Planet implements PhysObject {
    body: any;
    elem: HTMLElement;

    constructor(world: World) {
        this.body = world.createBody({
            type: 'static',
            position: new Vec2(0.0, 0.0),
        });

        this.body.createFixture({
            shape: new Circle(planetRadiusDisp * DISPLAY_TO_M),
            density: 0.0,
        });

        this.elem = document.createElement('div');
        this.elem.className = 'planet world-object';
        this.elem.style.width = `${planetRadiusDisp * 2}px`;
        this.elem.style.height = `${planetRadiusDisp * 2}px`;
        this.elem.style.backgroundColor = 'rgb(28, 28, 64)';

        this.body.setUserData(this);
    }
}

