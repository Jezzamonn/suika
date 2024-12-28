import { Game } from "./game/game";

const urlParams = new URLSearchParams(window.location.search);
const numFruits = parseInt(urlParams.get('players') || '2');
let game: Game | undefined;

const reset = () => {
    console.log('clicked');
    if (game?.gameOver ?? false) {
        game?.clearAll();

        newGame();
    }
};

function newGame() {
    let game = new Game(numFruits);
    game.start();
    game.onResetTriggered = reset;
}

newGame();
