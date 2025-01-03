export interface Score {
    gameId: string;
    score: number;
    date: string;
    numPlayers: number;
}

const key = 'suika-planet--scores';

export function saveScore(gameId: string, score: number, numPlayers: number) {
    const newScore: Score = { gameId, score, date: new Date().toJSON(), numPlayers };

    const savedScores = readScores();
    const existingScoreIndex = savedScores.findIndex(s => s.gameId === gameId);
    if (existingScoreIndex !== -1) {
        savedScores[existingScoreIndex] = newScore;
    } else {
        savedScores.push(newScore);
        savedScores.sort((a, b) => b.score - a.score);
    }
    localStorage.setItem(key, JSON.stringify(savedScores));
}

export function readScores(): Score[] {
    const key = 'suika-planet--scores';
    // Array of { gameId: string, score: number, date: string }, sorted by score descending
    const savedScoresStr = localStorage.getItem(key);
    return savedScoresStr ? JSON.parse(savedScoresStr) : [];
}
