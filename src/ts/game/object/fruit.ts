import { Circle, Vec2, World } from "planck";
import { clamp, experp } from "../../lib/util";
import { DISPLAY_TO_M, rng } from "../constants";
import { pop } from "../sfx";
import * as divider from './divider';
import { PhysObject } from "./phys-object";

const fruitNames = [
    'cherry',
    'strawberry',
    'grapes',
    'dekopon',
    'orange',
    'apple',
    'pear',
    'peach',
    'pineapple',
    'cantaloupe',
    'watermelon',
]

export class Fruit implements PhysObject {
    static maxFruitType = 10;
    static maxSpawnType = 5;

    body: any;
    elem: HTMLElement;
    destroyed = false;
    hasTouchedGround = false;

    isOutsideBoundsCount = 0;

    constructor(world: World, public fruitType: number = 0) {
        this.body = world.createBody({
            type: 'dynamic',
            position: new Vec2(0, 0),
        });

        const radiusDisp = Fruit.getRadiusDisp(fruitType);

        this.body.createFixture({
            shape: new Circle(radiusDisp * DISPLAY_TO_M),
            density: 0.5,
        });

        this.elem = Fruit.createElem(fruitType);

        this.body.setUserData(this);
    }

    static getRadiusDisp(fruitType: number): number {
        const amt = fruitType / Fruit.maxFruitType;
        return experp(0.8, 10, amt) * 1.3;
    }

    static createElem(fruitType: number): HTMLElement {
        const radiusDisp = Fruit.getRadiusDisp(fruitType);

        const elem = document.createElement('div');
        elem.className = 'circle world-object';
        elem.style.width = `${radiusDisp * 2}cqmin`;
        elem.style.height = `${radiusDisp * 2}cqmin`;
        elem.classList.add('fruit');
        elem.classList.add(fruitNames[fruitType]);
        return elem;
    }

    get radiusDisp() {
        return Fruit.getRadiusDisp(this.fruitType);
    }

    updateElemPosition() {
        const pos = this.body.getPosition();
        const xDisp = pos.x / DISPLAY_TO_M;
        const yDisp = pos.y / DISPLAY_TO_M;
        this.elem.style.left = `${xDisp - this.radiusDisp + 50}cqmin`;
        this.elem.style.top = `${yDisp - this.radiusDisp + 50}cqmin`;
        this.elem.style.rotate = `${this.body.getAngle()}rad`;
    }

    isOutsideBounds() {
        const pos = this.body.getPosition();
        const posLen = pos.length();
        return posLen > (50 * 0.9) * DISPLAY_TO_M;
    }

    updateIsOutsideBoundsCount(dt: number) {
        if (this.hasTouchedGround && this.isOutsideBounds()) {
            this.isOutsideBoundsCount += dt;
        } else {
            this.isOutsideBoundsCount = 0;
        }
    }

    static merge(fruitA: Fruit, fruitB: Fruit, world: World, container: HTMLElement) {
        if (fruitA.fruitType === fruitB.fruitType && !fruitA.destroyed && !fruitB.destroyed) {
            const posA = fruitA.body.getPosition();
            const posB = fruitB.body.getPosition();
            const midPoint = posA.clone().add(posB).mul(0.5);
            const averageVelocity = fruitA.body.getLinearVelocity().clone().add(fruitB.body.getLinearVelocity()).mul(0.5);

            // Destroy the old fruits
            world.destroyBody(fruitA.body);
            world.destroyBody(fruitB.body);
            container.removeChild(fruitA.elem);
            container.removeChild(fruitB.elem);
            fruitA.destroyed = true;
            fruitB.destroyed = true;

            const newFruitType = fruitA.fruitType + 1;
            const newFruitAmt = newFruitType / Fruit.maxFruitType;

            pop(newFruitAmt);

            if (newFruitType > Fruit.maxFruitType) {
                return;
            }

            // Create a new fruit at the midpoint
            const newFruit = new Fruit(world, newFruitType);
            newFruit.body.setPosition(midPoint);
            newFruit.body.setLinearVelocity(averageVelocity);
            container.appendChild(newFruit.elem);
        }
    }
}

export const holdRadiusDisp = 50;
export const nextRadiusDisp = 58;

export class HeldFruit {
    elem: HTMLElement;
    fruitType: number;
    posDisp: Vec2;
    dropped = false;
    rotation = 0;

    halfAngleDeltaAfterPadding: number;
    halfAngleDeltaAfterDivider: number;

    constructor(public middleAngle: number, public halfAngleDelta: number) {
        this.fruitType = Math.floor(rng() * (Fruit.maxSpawnType + 1));
        this.elem = Fruit.createElem(this.fruitType);
        this.elem.classList.add('held-fruit');

        this.halfAngleDeltaAfterDivider = this.halfAngleDelta - divider.halfArcSize;

        const radiusDisp = Fruit.getRadiusDisp(this.fruitType);
        const radiusAngle = radiusDisp / holdRadiusDisp;
        this.halfAngleDeltaAfterPadding = this.halfAngleDeltaAfterDivider - radiusAngle;

        this.posDisp = new Vec2(
            Math.cos(this.middleAngle) * nextRadiusDisp,
            Math.sin(this.middleAngle) * nextRadiusDisp,
        );
        this.updateElemPosition();
    }

    isInRange(x: number, y: number) {
        let angle = Math.atan2(y, x);
        let angleDiff = (angle - this.middleAngle) % (2 * Math.PI);
        while (angleDiff < -Math.PI) {
            angleDiff += 2 * Math.PI;
        }
        while (angleDiff > Math.PI) {
            angleDiff -= 2 * Math.PI;
        }

        return Math.abs(angleDiff) < this.halfAngleDeltaAfterDivider;
    }

    get radiusDisp() {
        return Fruit.getRadiusDisp(this.fruitType);
    }

    createFruit(world: World): Fruit {
        const fruit = new Fruit(world, this.fruitType);
        fruit.body.setPosition(this.posDisp.clone().mul(DISPLAY_TO_M));
        fruit.body.setAngle(this.rotation);

        this.dropped = true;

        return fruit;
    }

    setElemPosition(x: number, y: number) {
        let angle = Math.atan2(y, x);
        let angleDiff = (angle - this.middleAngle) % (2 * Math.PI);
        if (angleDiff < -Math.PI) {
            angleDiff += 2 * Math.PI;
        }
        if (angleDiff > Math.PI) {
            angleDiff -= 2 * Math.PI;
        }

        // Now clamp to the angle range
        angleDiff = clamp(angleDiff, -this.halfAngleDeltaAfterPadding, this.halfAngleDeltaAfterPadding);
        angle = this.middleAngle + angleDiff;

        this.posDisp = new Vec2(
            Math.cos(angle) * holdRadiusDisp,
            Math.sin(angle) * holdRadiusDisp,
        );

        this.rotation = angle + 0.5 * Math.PI;

        this.updateElemPosition();
    }

    private updateElemPosition() {
        this.elem.style.left = `${this.posDisp.x - this.radiusDisp + 50}cqmin`;
        this.elem.style.top = `${this.posDisp.y - this.radiusDisp + 50}cqmin`;
        this.elem.style.rotate = `${this.rotation}rad`;
    }
}
