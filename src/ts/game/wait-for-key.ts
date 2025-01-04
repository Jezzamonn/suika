interface KeyPromise {
    key: string,
    resolve: () => void
}

const promises: KeyPromise[] = [];

document.addEventListener('keydown', (evt: KeyboardEvent) => {
    for (let i = 0; i < promises.length; i++) {
        const {key, resolve} = promises[i];
        if (evt.key === key) {
            resolve();
            promises.splice(i, 1);
            i--;
        }
    }
});

export function waitForKey(key: string): Promise<void> {
    const promise = new Promise<void>(resolve => {
        const entry: KeyPromise = {
            key,
            resolve,
        }
        promises.push(entry);
    });
    return promise;
}