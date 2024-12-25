import { Circle, Vec2, World } from "planck";
import { DISPLAY_TO_M } from "../constants";

export const planetRadiusDisp = 100;

export function makePlanet(world: World) {
    const planet = world.createBody({
        type: 'static',
        position: new Vec2(0.0, 0.0),
    });

    planet.createFixture({
        shape: new Circle(planetRadiusDisp * DISPLAY_TO_M),
        density: 0.0,
    });

    const planetElem = document.createElement('div');
    planetElem.className = 'planet world-object';
    planetElem.style.width = `${planetRadiusDisp * 2}px`;
    planetElem.style.height = `${planetRadiusDisp * 2}px`;
    planetElem.style.backgroundColor = 'rgb(28, 28, 64)';
    planet.setUserData(planetElem);

    return planet;
}
