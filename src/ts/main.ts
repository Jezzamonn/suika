import { Game } from "./game/game";

const urlParams = new URLSearchParams(window.location.search);
const numFruits = parseInt(urlParams.get('players') || '2');
let game = new Game(numFruits);

game.onResetTriggered = () => {
    console.log('clicked');
    if (game.gameOver) {
        game.clearAll();

        game = new Game(numFruits);
        game.start();
    }
};

game.start();