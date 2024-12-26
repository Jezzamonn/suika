import { Vec2, World } from 'planck';
import { TIME_STEP } from './constants';
import { Fruit, HeldFruit } from './object/fruit';
import { PhysObject } from './object/phys-object';
import { Planet } from './object/planet';

export class Game {

    private world: World;
    private container: HTMLElement;
    private simulatedTimeMs: number | undefined;

    private unresolvedCollisions: PhysObject[][] = [];

    private heldFruit: HeldFruit;
    private nextFruit: HeldFruit;

    constructor() {
        this.container = document.querySelector('.world')!;

        this.world = new World({
            gravity: new Vec2(0.0, 0.0),
        });

        // Create planet
        const planet = new Planet(this.world);
        this.container.appendChild(planet.elem);

        // Create held fruit
        this.heldFruit = new HeldFruit();
        // this.nextFruit = new HeldFruit();

        this.container.appendChild(this.heldFruit.elem);
        // this.container.appendChild(this.nextFruit.elem);

        // Update all the positions
        this.render();

        document.addEventListener('mousedown', (event) => {
            this.dropFruit();
        });

        document.addEventListener('touchend', (event) => {
            this.dropFruit();
        });

        document.addEventListener('mousemove', (event) => {
            this.updateHeldItemPosition(event.clientX, event.clientY);
        });

        document.addEventListener('touchmove', (event) => {
            const touch = event.touches[0];
            this.updateHeldItemPosition(touch.clientX, touch.clientY);
        });

        this.world.on('begin-contact', (contact) => {
            const objA = contact.getFixtureA().getBody().getUserData() as PhysObject;
            const objB = contact.getFixtureB().getBody().getUserData() as PhysObject;

            this.unresolvedCollisions.push([objA, objB]);
        });
    }

    updateHeldItemPosition(clientX: number, clientY: number) {
        const rect = this.container.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        this.heldFruit.setElemPosition(new Vec2(x, y));
    }

    dropFruit() {
        const fruit = this.heldFruit.createFruit(this.world);

        this.container.appendChild(fruit.elem);

        this.heldFruit.elem.remove();

        const newFruit = new HeldFruit();
        newFruit.setElemPosition(this.heldFruit.posDisp);

        this.heldFruit = newFruit;
        this.container.appendChild(this.heldFruit.elem);
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
            const obj = body.getUserData() as PhysObject;
            obj.updateElemPosition?.();
        }
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
            if (objA instanceof Fruit && objB instanceof Fruit) {
                Fruit.merge(objA, objB, this.world, this.container);
            }
        }
        this.unresolvedCollisions = [];
    }

}
