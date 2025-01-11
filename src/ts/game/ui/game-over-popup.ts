import { makeScoreTable } from "./score-table";

export class GameOverPopup {

    onPlayAgain = () => {};
    onAdjustPlayers = () => {};

    elem: HTMLDivElement;

    constructor() {
        this.elem = document.createElement('div');
        this.elem.classList.add('game-over-popup');

        const gameOverHeading = document.createElement('h2');
        gameOverHeading.textContent = 'Game Over';
        this.elem.appendChild(gameOverHeading);

        const scoreTable = makeScoreTable();
        this.elem.appendChild(scoreTable);

        const buttonRow = document.createElement('div');
        buttonRow.classList.add('button-row');
        this.elem.appendChild(buttonRow);

        const playAgainButton = document.createElement('button');
        playAgainButton.classList.add('game-over-button', 'play-again-button');
        playAgainButton.textContent = 'Play Again';
        playAgainButton.addEventListener('click', () => this.onPlayAgain());
        buttonRow.appendChild(playAgainButton);

        const playerCountButton = document.createElement('button');
        playerCountButton.classList.add('game-over-button', 'player-count-button');
        playerCountButton.textContent = 'Change Player Count';
        playerCountButton.addEventListener('click', () => this.onAdjustPlayers());
        buttonRow.appendChild(playerCountButton);
    }

    remove() {
        this.elem.remove();
    }
}