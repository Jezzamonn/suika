import { Game } from "./game/game";

const urlParams = new URLSearchParams(window.location.search);
const numFruits = parseInt(urlParams.get('numFruits') || '2');
const game = new Game(numFruits);

game.start();