// UNO deck generation, shuffling, and helpers

export const COLORS = ['red', 'green', 'blue', 'yellow'];
export const NUMBERS = Array.from({ length: 10 }, (_, i) => String(i));
export const ACTIONS = ['Skip', 'Reverse', 'Draw2'];
export const WILDS = ['Wild', 'WildDraw4'];

export function makeDeck() {
    const deck = [];
    for (const color of COLORS) {
        // one zero per color
        deck.push({ type: 'number', value: '0', color });
        // two of 1-9
        for (const n of NUMBERS.slice(1)) {
            deck.push({ type: 'number', value: n, color });
            deck.push({ type: 'number', value: n, color });
        }
        // two of each action per color
        for (const a of ACTIONS) {
            deck.push({ type: 'action', value: a, color });
            deck.push({ type: 'action', value: a, color });
        }
    }
    // wilds
    for (const w of WILDS) {
        for (let i = 0; i < 4; i++) deck.push({ type: 'wild', value: w });
    }
    return shuffle(deck);
}

export function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function cardToKey(card) {
    return `${card.type}:${card.color || 'wild'}:${card.value}`;
}
