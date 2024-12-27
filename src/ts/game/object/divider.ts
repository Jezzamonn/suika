export const halfArcSize = 1.5 / 50;

export function makeDividers(numPlayers: number): SVGElement[] {
    const dividers: SVGElement[] = []
    for (let i = 0; i < numPlayers; i++) {
        const iAmt = (i + 0.5) / numPlayers;
        const angle = iAmt * 2 * Math.PI + 0.5 * Math.PI;
        const length = 50;

        const divider = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        divider.setAttribute('viewBox', '0 0 100 100');
        divider.setAttribute('class', 'divider');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const startX = 50 + length * Math.cos(angle - halfArcSize);
        const startY = 50 + length * Math.sin(angle - halfArcSize);
        const endX = 50 + length * Math.cos(angle + halfArcSize);
        const endY = 50 + length * Math.sin(angle + halfArcSize);

        const d = `M 50 50 L ${startX} ${startY} A 50 50 0 0 1 ${endX} ${endY} Z`;
        path.setAttribute('d', d);
        path.setAttribute('fill', '#ddd');

        divider.appendChild(path);

        dividers.push(divider);
    }
    return dividers;
}