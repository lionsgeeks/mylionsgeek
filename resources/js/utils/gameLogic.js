import { COLORS } from './deck';

export function canPlay(card, top) {
    if (!card || !top) return false;
    if (card.type === 'wild') return true;
    if (top.type === 'wild' && top.chosenColor) return card.color === top.chosenColor;
    return card.color === top.color || card.value === top.value;
}

// Apply effects and return { nextIndexDelta, drawsForNext }
export function applyCardEffects(card, direction, playersCount) {
    if (card.type === 'action') {
        if (card.value === 'Skip') return { nextIndexDelta: 2 * direction, drawsForNext: 0 };
        if (card.value === 'Reverse') return { nextIndexDelta: 1 * -direction, reverse: true, drawsForNext: 0 };
        if (card.value === 'Draw2') return { nextIndexDelta: 2 * direction, drawsForNext: 2 };
    }
    if (card.type === 'wild' && card.value === 'WildDraw4') {
        return { nextIndexDelta: 2 * direction, drawsForNext: 4 };
    }
    return { nextIndexDelta: 1 * direction, drawsForNext: 0 };
}

// Stacking rules: allow stacking Draw2 on Draw2, and +4 on +4
export function canStackOnTop(played, top) {
    if (!top) return false;
    if (played.type === 'action' && played.value === 'Draw2' && top.type === 'action' && top.value === 'Draw2') return true;
    if (played.type === 'wild' && played.value === 'WildDraw4' && top.type === 'wild' && top.value === 'WildDraw4') return true;
    return false;
}

export function bestCpuMove(hand, top) {
    // Prefer: stack same +4/+2 if applicable -> wild -> color match -> value match
    const playable = hand.filter(c => canPlay(c, top));
    if (playable.length === 0) return null;
    const stackable = playable.find(c => canStackOnTop(c, top));
    if (stackable) return stackable;
    const wild4 = playable.find(c => c.type === 'wild' && c.value === 'WildDraw4');
    if (wild4) return wild4;
    const wild = playable.find(c => c.type === 'wild');
    if (wild) return wild;
    const colorMatch = playable.find(c => top.chosenColor ? c.color === top.chosenColor : c.color === top.color);
    if (colorMatch) return colorMatch;
    const valueMatch = playable.find(c => c.value === top.value);
    return valueMatch || playable[0];
}

export function chooseWildColorFromHand(hand) {
    const counts = COLORS.reduce((acc, c) => ({ ...acc, [c]: 0 }), {});
    hand.forEach(c => { if (c.color) counts[c.color]++; });
    return Object.entries(counts).sort((a,b) => b[1]-a[1])[0][0] || 'red';
}


