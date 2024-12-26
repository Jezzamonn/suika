import { Circle, Vec2, World } from "planck";
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
            density: 1.0,
        });

        this.elem = Fruit.createElem(fruitType);

        this.body.setUserData(this);
    }

    static getRadiusDisp(fruitType: number): number {
        return 2.5 + 6 * fruitType;
    }

    static createElem(fruitType: number): HTMLElement {
        const radiusDisp = Fruit.getRadiusDisp(fruitType);

        const elem = document.createElement('div');
        elem.className = 'circle world-object';
        elem.style.width = `${radiusDisp * 2}px`;
        elem.style.height = `${radiusDisp * 2}px`;

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
        this.elem.style.left = `${xDisp - this.radiusDisp}px`;
        this.elem.style.top = `${yDisp - this.radiusDisp}px`;
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

export class HeldFruit {
    elem: HTMLElement;
    fruitType: number;
    posDisp: Vec2;

    constructor() {
        this.fruitType = Math.floor(rng() * Fruit.maxSpawnType + 1);
        this.elem = Fruit.createElem(this.fruitType);
        this.elem.classList.add('held-fruit');
    }

    get radiusDisp() {
        return Fruit.getRadiusDisp(this.fruitType);
    }

    createFruit(world: World): Fruit {
        const fruit = new Fruit(world, this.fruitType);
        fruit.body.setPosition(this.posDisp.clone().mul(DISPLAY_TO_M));
        return fruit;
    }

    setElemPosition(posDisp: Vec2) {
        this.posDisp = posDisp;
        this.elem.style.left = `${posDisp.x - this.radiusDisp}px`;
        this.elem.style.top = `${posDisp.y - this.radiusDisp}px`;
    }
}
