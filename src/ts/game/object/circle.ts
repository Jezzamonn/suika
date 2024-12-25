import { Circle, Vec2, World } from "planck";
import { lerp } from "../../lib/util";
import { DISPLAY_TO_M, rng } from "../constants";
import { planetRadiusDisp } from "./planet";

export function makeCircle(world: World) {
    const positionRadiusDisp = planetRadiusDisp + 200;
    const angle = lerp(0, 2 * Math.PI, rng());
    const x = positionRadiusDisp * Math.cos(angle) * DISPLAY_TO_M;
    const y = positionRadiusDisp * Math.sin(angle) * DISPLAY_TO_M;

    const circle = world.createBody({
        type: 'dynamic',
        position: new Vec2(x, y),
    });

    const radiusDisp = 20;
    circle.createFixture({
        shape: new Circle(radiusDisp * DISPLAY_TO_M),
        density: 1.0,
    });

    const circleElem = document.createElement('div');
    circleElem.className = 'circle world-object';
    circleElem.style.width = `${radiusDisp * 2}px`;
    circleElem.style.height = `${radiusDisp * 2}px`;

    // Random color
    // Min = hsl(277, 36%, 37%)
    // Max = hsl(31, 68%, 48%)
    const r = rng();
    const h = lerp(277, 31, r);
    const s = lerp(36, 68, r);
    const l = lerp(37, 48, r);

    circleElem.style.backgroundColor = `hsl(${h}, ${s}%, ${l}%)`;
    circle.setUserData(circleElem);

    return circle;
}
