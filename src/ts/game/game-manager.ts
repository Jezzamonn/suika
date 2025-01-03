import { Game } from "./game";
import { GameOverElem } from "./ui/game-over-elem";

export class GameManager {

    game: Game | undefined;
    gameOverElem: GameOverElem | undefined;

    numFruits: number;

    constructor() {
        const urlParams = new URLSearchParams(window.location.search);
        this.numFruits = parseInt(urlParams.get('players') || '2');
    }

    startGame() {
        this.gameOverElem?.remove();
        this.gameOverElem = undefined;
        this.game?.clearAll();

        this.game = new Game(this.numFruits);
        this.game.start();

        this.game.onGameOver = () => this.showScores();
    }

    showScores() {
        this.gameOverElem = new GameOverElem();
        this.gameOverElem.onPlayAgain = () => this.startGame();
        document.body.appendChild(this.gameOverElem.elem);
    }
}