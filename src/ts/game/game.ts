import { Body, Vec2, World } from 'planck';
import { DISPLAY_TO_M, rng, TIME_STEP } from './constants';
import { Fruit } from './object/fruit';
import { PhysObject } from './object/phys-object';
import { Planet } from './object/planet';

export class Game {

    private world: World;
    private container: HTMLElement;
    private simulatedTimeMs: number | undefined;

    private unresolvedCollisions: PhysObject[][] = [];

    constructor() {
        this.container = document.querySelector('.world')!;

        this.world = new World({
            gravity: new Vec2(0.0, 0.0),
        });

        // Create planet
        const planet = new Planet(this.world);
        this.container.appendChild(planet.elem);

        // Update all the positions
        this.render();

        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                const positionRadius = 510 * DISPLAY_TO_M;
                const positionAngle = rng() * Math.PI * 2;
                const position = new Vec2(Math.cos(positionAngle), Math.sin(positionAngle)).mul(positionRadius);

                const fruitType = Math.floor(rng() * Fruit.maxSpawnType + 1);
                const circle = new Fruit(this.world, fruitType);
                circle.body.setPosition(position);

                this.container.appendChild(circle.elem);
            }
        });

        this.world.on('begin-contact', (contact) => {
            const objA = contact.getFixtureA().getBody().getUserData() as PhysObject;
            const objB = contact.getFixtureB().getBody().getUserData() as PhysObject;

            this.unresolvedCollisions.push([objA, objB]);
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

        // Resolve collisions
        for (const [objA, objB] of this.unresolvedCollisions) {
            if (objA instanceof Fruit && objB instanceof Fruit && objA.fruitType === objB.fruitType && !objA.destroyed && !objB.destroyed) {
                const posA = objA.body.getPosition();
                const posB = objB.body.getPosition();
                const midPoint = posA.clone().add(posB).mul(0.5);

                // Destroy the old fruits
                this.world.destroyBody(objA.body);
                this.world.destroyBody(objB.body);
                this.container.removeChild(objA.elem);
                this.container.removeChild(objB.elem);
                objA.destroyed = true;
                objB.destroyed = true

                const newFruitType = objA.fruitType + 1;
                if (newFruitType >= Fruit.maxFruitType) {
                    continue;
                }

                // Create a new fruit at the midpoint
                const newFruit = new Fruit(this.world, newFruitType);
                newFruit.body.setPosition(midPoint);
                this.container.appendChild(newFruit.elem);
            }
        }
        this.unresolvedCollisions = [];
    }

}
