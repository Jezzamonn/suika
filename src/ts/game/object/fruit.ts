import { Circle, Vec2, World } from "planck";
import { DISPLAY_TO_M } from "../constants";
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
        return 10 + 10 * fruitType;
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
}

