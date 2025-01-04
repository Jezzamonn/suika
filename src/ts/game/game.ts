import { Vec2, World } from 'planck';
import { v4 as uuidv4 } from 'uuid';
import { TIME_STEP } from './constants';
import { makeDividers } from './object/divider';
import { Fruit, HeldFruit } from './object/fruit';
import { PhysObject } from './object/phys-object';
import { Planet } from './object/planet';
import { saveScore } from './score';
import { sfx } from './sfx';

const maxOutsideBoundsTime = 0.5;

export class Game {

    private world: World;
    private container: HTMLElement;
    private simulatedTimeMs: number | undefined;
    private gameId: string;

    private planet?: Planet;

    private unresolvedCollisions: PhysObject[][] = [];

    private heldFruit: HeldFruit[] = [];
    private nextFruit: HeldFruit[] = [];

    private fruitIndexToTouchId: Map<number, number> = new Map();
    gameOver = false;
    score = 0;

    removeEventListeners: () => void;

    public onGameOver = () => {};

    constructor(readonly numPlayers: number) {
        this.gameId = uuidv4();

        this.container = document.querySelector('.world')!;

        this.world = new World({
            gravity: new Vec2(0.0, 0.0),
        });

        // // Create planet
        // const planet = new Planet(this.world);
        // this.planet = planet;
        // this.container.appendChild(planet.elem);

        // Create held fruit / next fruit
        for (let i = 0; i < numPlayers; i++) {
            const iAmt = i / numPlayers;
            const angle = iAmt * 2 * Math.PI + 0.5 * Math.PI;
            const angleDelta = (1 / numPlayers) * 2 * Math.PI;

            const nextFruit = new HeldFruit(angle, angleDelta / 2);
            nextFruit.markAsNext();
            this.nextFruit.push(nextFruit);
            this.container.appendChild(nextFruit.elem);

            const heldFruit = new HeldFruit(angle, angleDelta / 2);
            heldFruit.markAsHeld();
            // Hacky -- this adjusts it to a smaller radius.
            heldFruit.setElemPosition(heldFruit.posDisp.x, heldFruit.posDisp.y);
            this.heldFruit.push(heldFruit);
            this.container.appendChild(heldFruit.elem);
        }

        // Create dividers too
        for (const divider of makeDividers(numPlayers)) {
            this.container.appendChild(divider);
        }

        // Update all the positions
        this.render();

        const onMouseDown = (event: MouseEvent) => {
            for (let i = 0; i < this.heldFruit.length; i++) {
                if (this.isInHeldItemRange(i, event.clientX, event.clientY)) {
                    this.dropFruit(i);
                    break;
                }
            }
        };

        const onMouseMove = (event: MouseEvent) => {
            for (let i = 0; i < this.heldFruit.length; i++) {
                if (this.isInHeldItemRange(i, event.clientX, event.clientY)) {
                    this.updateHeldItemPosition(i, event.clientX, event.clientY);
                    break;
                }
            }
        };

        const onTouchStart = (event: TouchEvent) => {
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
        };

        const onTouchMove = (event: TouchEvent) => {
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
        };

        const onTouchEnd = (event: TouchEvent) => {
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
        };

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.code === 'Space') {
                for (let i = 0; i < this.heldFruit.length; i++) {
                    this.dropFruit(i);
                }
            }
        };

        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('touchstart', onTouchStart, { passive: false });
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd, { passive: false });
        document.addEventListener('keydown', onKeyDown);

        this.removeEventListeners = () => {
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('touchstart', onTouchStart);
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
            document.removeEventListener('keydown', onKeyDown);
        };

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

        // Move next fruit into held fruit position
        const nextFruit = this.nextFruit[index];
        nextFruit.setElemPosition(heldFruit.posDisp.x, heldFruit.posDisp.y);
        nextFruit.markAsHeld();
        this.container.appendChild(nextFruit.elem);
        this.heldFruit[index] = nextFruit;

        // Create new next fruit
        const newFruit = new HeldFruit(heldFruit.middleAngle, heldFruit.halfAngleDelta);
        newFruit.markAsNext();
        this.container.appendChild(newFruit.elem);
        this.nextFruit[index] = newFruit;
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

        sfx.resetPops();

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

        this.removeEventListeners();

        this.onGameOver();
    }

    clearAll() {
        this.removeEventListeners();
        // Remove all items created by this game. Just remove all children of the container.
        const children = [...this.container.children];
        for (const child of children) {
            if (child.classList.contains('dont-remove')) {
                continue;
            }
            child.remove();
        }
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

                const velocity = body.getLinearVelocity();
                const dragForce = velocity.clone().neg().mul(body.getMass()); // Drag force proportional to velocity
                body.applyForceToCenter(dragForce);
            }
        }

        this.world.step(dt);

        const startScore = this.score;
        // Resolve collisions
        for (const [objA, objB] of this.unresolvedCollisions) {
            if ('hasTouchedGround' in objA && 'hasTouchedGround' in objB) {
                objA.hasTouchedGround = objA.hasTouchedGround || objB.hasTouchedGround;
                objB.hasTouchedGround = objA.hasTouchedGround || objB.hasTouchedGround;;
            }

            if (objA instanceof Fruit && objB instanceof Fruit) {
                this.score += Fruit.merge(objA, objB, this.world, this.container);
            }
        }
        this.unresolvedCollisions = [];

        if (startScore !== this.score) {
            this.planet?.setScore(this.score);
            saveScore(this.gameId, this.score, this.numPlayers);
        }

        let maxCountSeen = 0;
        for (let body = this.world.getBodyList(); body; body = body.getNext()) {
            if (body.getUserData() instanceof Fruit) {
                const fruit = body.getUserData() as Fruit;
                fruit.updateIsOutsideBoundsCount(dt);
                maxCountSeen = Math.max(maxCountSeen, fruit.isOutsideBoundsCount);
                if (fruit.isOutsideBoundsCount > maxOutsideBoundsTime) {
                    this.endGame();
                }
            }
        }

        const worldElem = this.container;
        worldElem.classList.toggle('danger', maxCountSeen > 0.1);
    }
}

