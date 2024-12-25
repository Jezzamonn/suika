import { Body, Vec2, World } from 'planck';
import { DISPLAY_TO_M, TIME_STEP } from './constants';
import { makeCircle } from './object/circle';
import { makePlanet } from './object/planet';

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
        const planet = makePlanet(this.world);
        this.container.appendChild(planet.getUserData() as HTMLElement);

        // Create circles
        for (let i = 0; i < 5; i++) {
            const circle = makeCircle(this.world);
            this.container.appendChild(circle.getUserData() as HTMLElement);
        }

        // Update all the positions
        this.render();

        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                const circle = makeCircle(this.world);
                this.container.appendChild(circle.getUserData() as HTMLElement);
            }
        });
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
        // Add physic forces:
        for (let body = this.world.getBodyList(); body; body = body.getNext()) {
            if (body.getType() === 'dynamic') {
                const pos = body.getPosition();
                const force = pos.clone().neg().mul(body.getMass() * 10); // Gravity force towards the center
                body.applyForceToCenter(force);
            }
        }

        this.world.step(dt);
    }

}
