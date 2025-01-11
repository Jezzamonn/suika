
export class SelectPlayersUI {

    onPlayersSelect = (numPlayers: number) => {};

    elem: HTMLDivElement;

    constructor() {
        this.elem = document.createElement('div');
        this.elem.classList.add('select-players-ui');

        const heading = document.createElement('h2');
        heading.classList.add('select-players-heading');
        heading.textContent = 'Choose the number of players';
        this.elem.appendChild(heading);

        const maxPlayers = 8;

        const buttons = document.createElement('div');
        buttons.classList.add('select-players-buttons');

        for (let i = 0; i < maxPlayers; i++) {
            const numPlayers = (i + 1);
            const button = document.createElement('button');
            button.classList.add('select-players-button');
            button.innerText = numPlayers.toString();
            button.addEventListener('click', () => {
                this.onPlayersSelect(numPlayers);
            });
            buttons.appendChild(button);
        }

        this.elem.appendChild(buttons);
    }

    remove() {
        this.elem.remove();
    }
}