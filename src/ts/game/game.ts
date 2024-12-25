import { Body, Circle, Vec2, World } from 'planck';
import { lerp } from '../lib/util';
import { DISPLAY_TO_M, rng, TIME_STEP } from './constants';

export class Game {

    private world: World;
    private container: HTMLElement;
    private simulatedTimeMs: number | undefined;

    constructor() {
        this.container = document.querySelector('.world')!;

        this.world = new World({
            gravity: new Vec2(0.0, 0.0),
        });

        // Create planet
        const planetWidthDisp = 200;

        const planet = this.world.createBody({
            type: 'static',
            position: new Vec2(0.0, 0.0),
        });

        planet.createFixture({
            shape: new Circle(planetWidthDisp * DISPLAY_TO_M),
            density: 0.0,
        });

        const planetElem = document.createElement('div');
        planetElem.className = 'planet world-object';
        planetElem.style.width = `${planetWidthDisp}px`;
        planetElem.style.height = `${planetWidthDisp}px`;
        planetElem.style.backgroundColor = 'rgb(28, 28, 64)';
        this.container.appendChild(planetElem);
        planet.setUserData(planetElem);

        // Create circles
        for (let i = 0; i < 5; i++) {
            const radiusDisp = planetWidthDisp + lerp(80, 160, rng());
            const angle = lerp(0, 2 * Math.PI, rng());
            const xDisp = radiusDisp * Math.cos(angle);
            const yDisp = radiusDisp * Math.sin(angle);

            const circle = this.world.createBody({
                type: 'dynamic',
                position: new Vec2(xDisp * DISPLAY_TO_M, yDisp * DISPLAY_TO_M),
            });

            const widthDisp = 40;
            circle.createFixture({
                shape: new Circle(widthDisp * DISPLAY_TO_M),
                density: 1.0,
            });

            const circleElem = document.createElement('div');
            circleElem.className = 'circle world-object';
            circleElem.style.width = `${widthDisp}px`;
            circleElem.style.height = `${widthDisp}px`;

            // Random color
            // Min = hsl(277, 36%, 37%)
            // Max = hsl(31, 68%, 48%)
            const r = rng();
            const h = lerp(277, 31, r);
            const s = lerp(36, 68, r);
            const l = lerp(37, 48, r);

            circleElem.style.backgroundColor = `hsl(${h}, ${s}%, ${l}%)`;
            this.container.appendChild(circleElem);
            circle.setUserData(circleElem);
        }

        // Update all the positions
        this.render();
    }

    start() {
        this.doAnimationLoop();
    }

    private doAnimationLoop() {
        if (this.simulatedTimeMs == undefined) {
            this.simulatedTimeMs = Date.now();
        }

        let curTime = Date.now();
        let updateCount = 0;
        while (this.simulatedTimeMs < curTime) {
            this.update(TIME_STEP);

            this.simulatedTimeMs += 1000 * TIME_STEP;

            updateCount++;
            if (updateCount > 10) {
                this.simulatedTimeMs = curTime;
                break;
            }
        }

        this.render();

        requestAnimationFrame(() => this.doAnimationLoop());
    }

    render() {
        for (let body = this.world.getBodyList(); body; body = body.getNext()) {
            this.updateDomPosition(body);
        }
    }

    updateDomPosition(body: Body) {
        const elem = body.getUserData() as HTMLElement;
        if (elem == undefined || !(elem instanceof HTMLElement)) {
            return;
        }

        const pos = body.getPosition();
        const xDisp = pos.x / DISPLAY_TO_M;
        const yDisp = pos.y / DISPLAY_TO_M;
        elem.style.left = `${xDisp - elem.offsetWidth / 2}px`;
        elem.style.top = `${yDisp - elem.offsetHeight / 2}px`;
    }

    update(dt: number) {
        this.world.step(dt);
    }

}
