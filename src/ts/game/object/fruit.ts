import { Circle, Vec2, World } from "planck";
import { lerp } from "../../lib/util";
import { DISPLAY_TO_M } from "../constants";
import { PhysObject } from "./phys-object";

export class Fruit implements PhysObject {
    static numFruits = 11;
    static maxSpawnType = 5;

    body: any;
    elem: HTMLElement;

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
        return 10 + 5 * fruitType;
    }

    static createElem(fruitType: number): HTMLElement {
        const radiusDisp = Fruit.getRadiusDisp(fruitType);

        const elem = document.createElement('div');
        elem.className = 'circle world-object';
        elem.style.width = `${radiusDisp * 2}px`;
        elem.style.height = `${radiusDisp * 2}px`;

        // Random color
        // Min = hsl(277, 36%, 37%)
        // Max = hsl(31, 68%, 48%)
        const r = fruitType / 4.7;
        const h = lerp(277, 31, r);
        const s = lerp(36, 68, r);
        const l = lerp(37, 48, r);

        elem.style.backgroundColor = `hsl(${h}, ${s}%, ${l}%)`;

        return elem;
    }
}

