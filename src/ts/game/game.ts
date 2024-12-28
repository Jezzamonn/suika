import { Vec2, World } from 'planck';
import { TIME_STEP } from './constants';
import { makeDividers } from './object/divider';
import { Fruit, HeldFruit } from './object/fruit';
import { PhysObject } from './object/phys-object';
import { Planet } from './object/planet';

const maxOutsideBoundsTime = 0.5;

export class Game {

    private world: World;
    private container: HTMLElement;
    private simulatedTimeMs: number | undefined;

    private unresolvedCollisions: PhysObject[][] = [];

    private heldFruit: HeldFruit[] = [];

    private fruitIndexToTouchId: Map<number, number> = new Map();
    private gameOver = false;

    private oncePerFrameActionQueue: (() => void)[] = [];

    constructor(numPlayers: number) {
        this.container = document.querySelector('.world')!;

        this.world = new World({
            gravity: new Vec2(0.0, 0.0),
        });

        // Create planet
        const planet = new Planet(this.world);
        this.container.appendChild(planet.elem);

        // Create held fruit
        for (let i = 0; i < numPlayers; i++) {
            const iAmt = i / numPlayers;
            const angle = iAmt * 2 * Math.PI + 0.5 * Math.PI;
            const angleDelta = (1 / numPlayers) * 2 * Math.PI;

            const heldFruit = new HeldFruit(angle, angleDelta / 2);
            this.heldFruit.push(heldFruit);
            this.container.appendChild(heldFruit.elem);
        }

        // Create dividers too
        for (const divider of makeDividers(numPlayers)) {
            this.container.appendChild(divider);
        }

        // Update all the positions
        this.render();

        document.addEventListener('mousedown', (event) => {
            for (let i = 0; i < this.heldFruit.length; i++) {
                if (this.isInHeldItemRange(i, event.clientX, event.clientY)) {
                    this.dropFruit(i);
                    break;
                }
            }
        });

        document.addEventListener('mousemove', (event) => {
            for (let i = 0; i < this.heldFruit.length; i++) {
                if (this.isInHeldItemRange(i, event.clientX, event.clientY)) {
                    this.updateHeldItemPosition(i, event.clientX, event.clientY);
                    break;
                }
            }
        });

        document.addEventListener('touchstart', (event) => {
            for (const touch of event.changedTouches) {
                for (let i = 0; i < this.heldFruit.length; i++) {
                    if (this.isInHeldItemRange(i, touch.clientX, touch.clientY)) {
                        this.fruitIndexToTouchId.set(i, touch.identifier);
                        this.updateHeldItemPosition(i, touch.clientX, touch.clientY);
                        break;
                    }
                }

            }
            event.preventDefault();
        }, { passive: false });

        document.addEventListener('touchmove', (event) => {
            for (let i = 0; i < this.heldFruit.length; i++) {
                const touchId = this.fruitIndexToTouchId.get(i);
                if (touchId == undefined) {
                    continue;
                }

                let touch = [...event.touches].find(t => t.identifier === touchId);

                if (touch == undefined) {
                    continue;
                }

                this.updateHeldItemPosition(i, touch.clientX, touch.clientY);
            }
            event.preventDefault();
        }, { passive: false });

        document.addEventListener('touchend', (event) => {
            for (let i = 0; i < this.heldFruit.length; i++) {
                const touchId = this.fruitIndexToTouchId.get(i);
                if (touchId == undefined) {
                    continue;
                }

                let touch = [...event.changedTouches].find(t => t.identifier === touchId);

                if (touch == undefined) {
                    continue;
                }

                this.updateHeldItemPosition(i, touch.clientX, touch.clientY);
                this.dropFruit(i);

                this.fruitIndexToTouchId.delete(i);
            }

            event.preventDefault();
        }, { passive: false });

        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                for (let i = 0; i < this.heldFruit.length; i++) {
                    this.dropFruit(i);
                }
            }
        });

        this.world.on('begin-contact', (contact) => {
            const objA = contact.getFixtureA().getBody().getUserData() as PhysObject;
            const objB = contact.getFixtureB().getBody().getUserData() as PhysObject;

            this.unresolvedCollisions.push([objA, objB]);
        });
    }

    isInHeldItemRange(index: number, clientX: number, clientY: number) {
        const rect = this.container.getBoundingClientRect();
        const x = clientX - (rect.left + rect.width / 2);
        const y = clientY - (rect.top + rect.height / 2);

        return this.heldFruit[index].isInRange(x, y);
    }

    updateHeldItemPosition(index: number, clientX: number, clientY: number) {
        const rect = this.container.getBoundingClientRect();
        const x = clientX - (rect.left + rect.width / 2);
        const y = clientY - (rect.top + rect.height / 2);

        this.heldFruit[index].setElemPosition(x, y);
    }

    dropFruit(index: number) {
        const heldFruit = this.heldFruit[index];
        const fruit = heldFruit.createFruit(this.world);

        this.container.appendChild(fruit.elem);

        heldFruit.elem.remove();

        const newFruit = new HeldFruit(heldFruit.middleAngle, heldFruit.halfAngleDelta);
        newFruit.setElemPosition(heldFruit.posDisp.x, heldFruit.posDisp.y);
        this.container.appendChild(newFruit.elem);

        this.heldFruit[index] = newFruit;
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
        if (this.oncePerFrameActionQueue.length > 0) {
            this.oncePerFrameActionQueue.pop()!();
        }

        requestAnimationFrame(() => this.doAnimationLoop());
    }

    render() {
        for (let body = this.world.getBodyList(); body; body = body.getNext()) {
            const obj = body.getUserData() as PhysObject;
            obj.updateElemPosition?.();
        }
    }

    endGame() {
        this.gameOver = true;

        // Remove all held items.
        for (const heldFruit of this.heldFruit) {
            heldFruit.elem.remove();
        }
        this.heldFruit = [];
    }

    update(dt: number) {
        if (this.gameOver) {
            return;
        }

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
            if ('hasTouchedGround' in objA && 'hasTouchedGround' in objB) {
                objA.hasTouchedGround = objA.hasTouchedGround || objB.hasTouchedGround;
                objB.hasTouchedGround = objA.hasTouchedGround || objB.hasTouchedGround;;
            }

            if (objA instanceof Fruit && objB instanceof Fruit) {
                Fruit.merge(objA, objB, this.world, this.container, this.oncePerFrameActionQueue);
            }
         }
        this.unresolvedCollisions = [];

        for (let body = this.world.getBodyList(); body; body = body.getNext()) {
            if (body.getUserData() instanceof Fruit) {
                const fruit = body.getUserData() as Fruit;
                fruit.updateIsOutsideBoundsCount(dt);
                if (fruit.isOutsideBoundsCount > maxOutsideBoundsTime) {
                    this.endGame();
                }
            }
        }
    }

}
