import { seededRandom } from "../lib/util";

export const TIME_STEP = 1 / 60;

export const DISPLAY_WIDTH = 800;
export const DISPLAY_HEIGHT = 800;

export const M_TO_DISPLAY = 10;
export const DISPLAY_TO_M = 1 / M_TO_DISPLAY;

// Not really a constant :) But it's shared.
export const rng = seededRandom('seed');