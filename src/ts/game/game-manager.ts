import { Game } from "./game";
import { music } from "./music";
import { GameOverPopup } from "./ui/game-over-popup";
import { SelectPlayersUI } from "./ui/select-players-ui";

export class GameManager {

    game: Game | undefined;
    gameOverElem: GameOverPopup | undefined;
    selectPlayersUI: SelectPlayersUI | undefined;

    container: HTMLElement;

    numPlayers: number = 2;

    constructor() {
        this.container = document.querySelector('.content')!;
    }

    start() {
        this.showSelectPlayers();

        document.addEventListener('keydown', (event) => {
            if (event.key === 'm' || event.key === 'M') {
                music.toggleMute();
            }
        });
    }

    private showSelectPlayers() {
        this.selectPlayersUI = new SelectPlayersUI();
        this.selectPlayersUI.onPlayersSelect = (numPlayers) => {
            this.selectPlayersUI?.remove();
            this.selectPlayersUI = undefined;

            this.numPlayers = numPlayers;
            this.startGame();
        }
        this.container.append(this.selectPlayersUI.elem);
    }

    private startGame() {
        this.game = new Game(this.numPlayers);
        this.container.append(this.game.elem)
        this.game.start();

        this.game.onGameOver = () => this.showScores();

        music.playIfNotPlaying();
        music.clearLowPassFilter();
    }

    private showScores() {
        this.gameOverElem = new GameOverPopup();
        this.gameOverElem.onPlayAgain = () => {
            this.gameOverElem?.remove();
            this.gameOverElem = undefined;

            this.game?.remove();
            this.game = undefined;

            this.startGame();
        }
        this.container.appendChild(this.gameOverElem.elem);

        music.addLowPassFilter();
    }
}