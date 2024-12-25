import { Circle, Vec2, World } from "planck";
import { lerp } from "../../lib/util";
import { DISPLAY_TO_M, rng } from "../constants";
import { PhysObject } from "./phys-object";
import { planetRadiusDisp } from "./planet";

export class Fruit implements PhysObject {
    body: any;
    elem: HTMLElement;

    constructor(world: World) {
        const positionRadiusDisp = planetRadiusDisp + 200;
        const angle = lerp(0, 2 * Math.PI, rng());
        const x = positionRadiusDisp * Math.cos(angle) * DISPLAY_TO_M;
        const y = positionRadiusDisp * Math.sin(angle) * DISPLAY_TO_M;

        this.body = world.createBody({
            type: 'dynamic',
            position: new Vec2(x, y),
        });

        const radiusDisp = 20;
        this.body.createFixture({
            shape: new Circle(radiusDisp * DISPLAY_TO_M),
            density: 1.0,
        });

        this.elem = document.createElement('div');
        this.elem.className = 'circle world-object';
        this.elem.style.width = `${radiusDisp * 2}px`;
        this.elem.style.height = `${radiusDisp * 2}px`;

        // Random color
        // Min = hsl(277, 36%, 37%)
        // Max = hsl(31, 68%, 48%)
        const r = rng();
        const h = lerp(277, 31, r);
        const s = lerp(36, 68, r);
        const l = lerp(37, 48, r);

        this.elem.style.backgroundColor = `hsl(${h}, ${s}%, ${l}%)`;

        this.body.setUserData(this);
    }
}

