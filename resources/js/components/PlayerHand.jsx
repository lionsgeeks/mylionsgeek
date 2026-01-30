import Card from './Card';

export default function PlayerHand({ hand, isTurn, topCard, canPlayFn, onPlay }) {
    return (
        <div className="flex flex-wrap justify-center gap-2">
            {hand.map((card, idx) => (
                <Card key={idx} card={card} playable={isTurn && canPlayFn(card, topCard)} onClick={() => onPlay(idx)} />
            ))}
        </div>
    );
}
