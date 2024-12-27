import { Circle, Vec2, World } from "planck";
import { clamp, experp } from "../../lib/util";
import { DISPLAY_TO_M, rng } from "../constants";
import * as divider from './divider';
import { PhysObject } from "./phys-object";

const colors = [
    'rgb(245, 39, 39)',   // cherry
    'rgb(248, 69, 69)', // strawberry
    'rgb(142, 69, 133)',  // grapes
    'rgb(248, 170, 53)',   // dekopon
    'rgb(255, 123, 0)',   // orange
    'rgb(233, 19, 19)',     // apple
    'rgb(209, 226, 49)',  // pear
    'rgb(247, 186, 185)', // peach
    'rgb(227, 205, 57)',  // pineapple
    'rgb(139, 203, 99)',  // cantaloupe
    'rgb(13, 115, 45)', // watermelon
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
        return experp(0.8, 10, amt);
    }

    static createElem(fruitType: number): HTMLElement {
        const radiusDisp = Fruit.getRadiusDisp(fruitType);

        const elem = document.createElement('div');
        elem.className = 'circle world-object';
        elem.style.width = `${radiusDisp * 2}cqmin`;
        elem.style.height = `${radiusDisp * 2}cqmin`;

        elem.style.backgroundColor = colors[fruitType];

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
            fruitB.destroyed = true

            const newFruitType = fruitA.fruitType + 1;
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

export class HeldFruit {
    elem: HTMLElement;
    fruitType: number;
    posDisp: Vec2;
    dropped = false;

    halfAngleDeltaAfterPadding: number;
    halfAngleDeltaAfterDivider: number;

    constructor(public middleAngle: number, public halfAngleDelta: number) {
        this.fruitType = Math.floor(rng() * Fruit.maxSpawnType + 1);
        this.elem = Fruit.createElem(this.fruitType);
        this.elem.classList.add('held-fruit');

        this.posDisp = new Vec2(
            Math.cos(this.middleAngle) * holdRadiusDisp,
            Math.sin(this.middleAngle) * holdRadiusDisp,
        );

        this.halfAngleDeltaAfterDivider = this.halfAngleDelta - divider.halfArcSize;

        const radiusDisp = Fruit.getRadiusDisp(this.fruitType);
        const radiusAngle = radiusDisp / holdRadiusDisp;
        this.halfAngleDeltaAfterPadding = this.halfAngleDeltaAfterDivider - radiusAngle;

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

        this.updateElemPosition();
    }

    private updateElemPosition() {
        this.elem.style.left = `${this.posDisp.x - this.radiusDisp + 50}cqmin`;
        this.elem.style.top = `${this.posDisp.y - this.radiusDisp + 50}cqmin`;
    }
}
