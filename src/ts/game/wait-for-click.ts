let resolveFn: (() => void) | undefined;

function resolve() {
    resolveFn?.();
    resolveFn = undefined;
}

document.addEventListener('click', () => resolve());
document.addEventListener('touchend', () => resolve());

export function waitForClick(): Promise<void> {
    return new Promise<void>(resolve => {
        resolveFn = resolve;
    });
}