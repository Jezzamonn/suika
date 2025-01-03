import { experp } from "../lib/util";
import { maxFruitType } from "./constants";

const preloadedAudio = new Audio();
preloadedAudio.src = 'sfx/pop.mp3';

const cachedSounds: HTMLAudioElement[] = [];

console.log(maxFruitType);

for (let i = 0; i <= maxFruitType; i++) {
    const fruitAmt = i / maxFruitType;
    const newAudio = preloadedAudio.cloneNode() as HTMLAudioElement;
    newAudio.volume = 0.3;
    newAudio.playbackRate = experp(1.2, 0.6, fruitAmt);
    newAudio.preservesPitch = false;
    (newAudio as any).mozPreservesPitch = false;
    (newAudio as any).webkitPreservesPitch = false;
    cachedSounds.push(newAudio);
}

class SfxClass {
    private popsThisFrame = 0;

    resetPops() {
        this.popsThisFrame = 0;
    }

    pop(fruitType: number) {
        if (this.popsThisFrame > 3) {
            return;
        }
        this.popsThisFrame++;

        const audio = cachedSounds[fruitType];
        if (audio) {
            audio.play();
        }
    }
}

export const sfx = new SfxClass();