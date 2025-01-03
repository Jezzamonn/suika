import { makeScoreTable } from "./score-table";

export class GameOverElem {

    onPlayAgain = () => {};

    elem: HTMLDivElement;

    constructor() {
        this.elem = document.createElement('div');
        this.elem.classList.add('game-over-elem');

        const gameOverHeading = document.createElement('h2');
        gameOverHeading.textContent = 'Game Over';
        this.elem.appendChild(gameOverHeading);

        const scoreTable = makeScoreTable();
        this.elem.appendChild(scoreTable);

        const playAgainButton = document.createElement('button');
        playAgainButton.textContent = 'Play Again';
        playAgainButton.addEventListener('click', () => this.onPlayAgain());
        this.elem.appendChild(playAgainButton);
    }

    remove() {
        this.elem.remove();
    }
}