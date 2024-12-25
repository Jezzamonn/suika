import { Body, Vec2, World } from 'planck';
import { DISPLAY_TO_M, TIME_STEP } from './constants';
import { Fruit } from './object/fruit';
import { PhysObject } from './object/phys-object';
import { Planet } from './object/planet';

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
        const planet = new Planet(this.world);
        this.container.appendChild(planet.elem);

        // Create circles
        for (let i = 0; i < 5; i++) {
            const circle = new Fruit(this.world);
            this.container.appendChild(circle.elem);
        }

        // Update all the positions
        this.render();

        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                const circle = new Fruit(this.world);
                this.container.appendChild(circle.elem);
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
        const obj = body.getUserData() as PhysObject;
        if (obj == undefined) {
            return;
        }

        const pos = body.getPosition();
        const xDisp = pos.x / DISPLAY_TO_M;
        const yDisp = pos.y / DISPLAY_TO_M;
        obj.elem.style.left = `${xDisp - obj.elem.offsetWidth / 2}px`;
        obj.elem.style.top = `${yDisp - obj.elem.offsetHeight / 2}px`;
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
