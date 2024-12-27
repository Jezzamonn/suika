import { Circle, Vec2, World } from "planck";
import { clamp } from "../../lib/util";
import { DISPLAY_TO_M, rng } from "../constants";
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
    static maxFruitType = 11;
    static maxSpawnType = 5;

    body: any;
    elem: HTMLElement;
    destroyed = false;

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
        return 0.3 + 0.7 * fruitType;
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
            if (newFruitType >= Fruit.maxFruitType) {
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

const holdRadius = 50;

export class HeldFruit {
    elem: HTMLElement;
    fruitType: number;
    posDisp: Vec2;
    middleAngle: number;
    halfAngleDelta: number;

    constructor(public minAngle: number, public maxAngle: number) {
        this.fruitType = Math.floor(rng() * Fruit.maxSpawnType + 1);
        this.elem = Fruit.createElem(this.fruitType);
        this.elem.classList.add('held-fruit');
        this.middleAngle = (minAngle + maxAngle) / 2;
        this.halfAngleDelta = (maxAngle - minAngle) / 2;

        this.posDisp = new Vec2(
            Math.cos(this.middleAngle) * holdRadius,
            Math.sin(this.middleAngle) * holdRadius,
        );

        this.updateElemPosition();
    }

    get radiusDisp() {
        return Fruit.getRadiusDisp(this.fruitType);
    }

    createFruit(world: World): Fruit {
        const fruit = new Fruit(world, this.fruitType);
        fruit.body.setPosition(this.posDisp.clone().mul(DISPLAY_TO_M));
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
        angleDiff = clamp(angleDiff, -this.halfAngleDelta, this.halfAngleDelta);
        angle = this.middleAngle + angleDiff;

        this.posDisp = new Vec2(
            Math.cos(angle) * holdRadius,
            Math.sin(angle) * holdRadius,
        );

        this.updateElemPosition();
    }

    private updateElemPosition() {
        this.elem.style.left = `${this.posDisp.x - this.radiusDisp + 50}cqmin`;
        this.elem.style.top = `${this.posDisp.y - this.radiusDisp + 50}cqmin`;
    }
}
