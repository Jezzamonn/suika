import { experp } from "../lib/util";

const preloadedAudio = new Audio();
preloadedAudio.src = 'sfx/pop.mp3';

export function pop(fruitAmt: number) {
    const newAudio = preloadedAudio.cloneNode() as HTMLAudioElement;
    newAudio.volume = 0.3;
    newAudio.playbackRate = experp(1.2, 0.6, fruitAmt);
    newAudio.preservesPitch = false;
    (newAudio as any).mozPreservesPitch = false;
    (newAudio as any).webkitPreservesPitch = false;
    newAudio.play();
}