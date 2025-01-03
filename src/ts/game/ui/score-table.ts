import { readScores } from "../score";

export function makeScoreTable(): HTMLElement {
    const scores = readScores();
    // Sort scores by score descending
    scores.sort((a, b) => b.score - a.score);

    const div = document.createElement('div');
    div.classList.add('score-table-container');

    const table = document.createElement('table');
    table.classList.add('score-table');
    const thead = document.createElement('thead');
    thead.innerHTML = `<tr><th>Score</th><th>Date</th><th>Players</th></tr>`;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    scores.forEach(score => {
        const row = document.createElement('tr');
        const scoreCell = document.createElement('td');
        scoreCell.textContent = score.score.toString();
        const dateCell = document.createElement('td');
        dateCell.textContent = score.date;
        const playersCell = document.createElement('td');
        playersCell.textContent = score.numPlayers?.toString() ?? '';

        row.appendChild(scoreCell);
        row.appendChild(dateCell);
        row.appendChild(playersCell);
        tbody.appendChild(row);
    });

    table.appendChild(tbody);

    div.appendChild(table);

    return div;
}