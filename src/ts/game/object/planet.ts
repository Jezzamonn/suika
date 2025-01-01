import { Circle, Vec2, World } from "planck";
import { DISPLAY_TO_M } from "../constants";
import { PhysObject } from "./phys-object";

export const planetRadiusDisp = 50 / 5;

export class Planet implements PhysObject {
    body: any;
    elem: HTMLElement;
    scoreElem: HTMLElement;
    hasTouchedGround = true;

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
        this.elem.style.width = `${planetRadiusDisp * 2}cqmin`;
        this.elem.style.height = `${planetRadiusDisp * 2}cqmin`;

        // Add score element
        const scoreElem = document.createElement('div');
        scoreElem.className = 'planet-score';
        scoreElem.innerText = '0';
        this.elem.appendChild(scoreElem);
        this.scoreElem = scoreElem;

        this.body.setUserData(this);
    }

    setScore(score: number) {
        this.scoreElem.innerText = score.toString();
    }
}

