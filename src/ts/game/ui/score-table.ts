import { readScores } from "../score";

export function makeScoreTable(): HTMLTableElement {
    const scores = readScores();
    // Sort scores by score descending
    scores.sort((a, b) => b.score - a.score);

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `<tr><th>Score</th><th>Date</th></tr>`;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    scores.forEach(score => {
        const row = document.createElement('tr');
        const scoreCell = document.createElement('td');
        scoreCell.textContent = score.score.toString();
        const dateCell = document.createElement('td');
        dateCell.textContent = score.date;

        row.appendChild(scoreCell);
        row.appendChild(dateCell);
        tbody.appendChild(row);
    });

    table.appendChild(tbody);

    return table;
}