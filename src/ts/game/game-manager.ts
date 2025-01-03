import { Game } from "./game";
import { GameOverPopup } from "./ui/game-over-popup";

export class GameManager {

    game: Game | undefined;
    gameOverElem: GameOverPopup | undefined;

    container: HTMLElement;

    numFruits: number;

    constructor() {
        const urlParams = new URLSearchParams(window.location.search);
        this.numFruits = parseInt(urlParams.get('players') || '2');

        this.container = document.querySelector('.content')!;
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
        this.gameOverElem = new GameOverPopup();
        this.gameOverElem.onPlayAgain = () => this.startGame();
        this.container.appendChild(this.gameOverElem.elem);
    }
}