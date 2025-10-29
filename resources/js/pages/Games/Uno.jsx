import React, { useEffect, useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import GameBoard from '@/components/GameBoard';
import PlayerHand from '@/components/PlayerHand';
import ColorPickerModal from '@/components/ColorPickerModal';
import { makeDeck, COLORS } from '@/utils/deck';
import { canPlay, applyCardEffects, bestCpuMove, chooseWildColorFromHand, canStackOnTop } from '@/utils/gameLogic';

export default function Uno() {
    const [deck, setDeck] = useState(() => makeDeck());
    const [discard, setDiscard] = useState([]);
    const [p1, setP1] = useState([]);
    const [cpu, setCpu] = useState([]);
    const [turn, setTurn] = useState('p1');
    const [pendingWild, setPendingWild] = useState(null); // { player, type }
    const [stackDraw, setStackDraw] = useState(0); // accumulated draws due to stacking
    const [score, setScore] = useState({ p1: 0, cpu: 0 });

    const topCard = discard[discard.length - 1];

    const restart = () => {
        const fresh = makeDeck();
        // deal 7 each
        const p1h = fresh.slice(0, 7);
        const cpuh = fresh.slice(7, 14);
        let rest = fresh.slice(14);
        // starting top card (not wild draw)
        let top = null;
        while (rest.length && (!top || top.type === 'wild')) {
            top = rest.shift();
        }
        setDeck(rest);
        setDiscard([top]);
        setP1(p1h);
        setCpu(cpuh);
        setTurn('p1');
        setPendingWild(null);
        setStackDraw(0);
    };

    useEffect(() => {
        restart();
    }, []);

    const draw = (who, n = 1) => {
        let d = [...deck];
        let hand = who === 'p1' ? [...p1] : [...cpu];
        for (let i = 0; i < n; i++) {
            if (d.length === 0) {
                const top = discard[discard.length - 1];
                const rest = discard.slice(0, -1);
                // reshuffle
                for (let j = rest.length - 1; j > 0; j--) {
                    const k = Math.floor(Math.random() * (j + 1));
                    [rest[j], rest[k]] = [rest[k], rest[j]];
                }
                d = rest;
                setDiscard([top]);
            }
            hand.push(d.shift());
        }
        setDeck(d);
        if (who === 'p1') setP1(hand); else setCpu(hand);
    };

    const play = (who, index) => {
        if (turn !== who) return;
        const hand = who === 'p1' ? [...p1] : [...cpu];
        const card = hand[index];
        if (!canPlay(card, topCard)) return;

        // stacking handling: if stackDraw > 0, only allow stacking card
        if (stackDraw > 0 && !canStackOnTop(card, topCard)) return;

        hand.splice(index, 1);
        if (who === 'p1') setP1(hand); else setCpu(hand);
        setDiscard(prev => [...prev, card]);

        if (hand.length === 1) {
            // could show UNO toast - omitted here
        }
        if (hand.length === 0) {
            setScore(s => ({ ...s, [who]: s[who] + 1 }));
            setTimeout(restart, 600);
            return;
        }

        if (card.type === 'wild') {
            if (who === 'p1') {
                setPendingWild({ player: who, type: card.value });
            } else {
                const color = chooseWildColorFromHand(cpu);
                assignWildColor(color, card.value);
            }
            return;
        }

        advanceTurnAfterEffects(card);
    };

    const assignWildColor = (color, type) => {
        setDiscard(prev => {
            const copy = [...prev];
            copy[copy.length - 1] = { ...copy[copy.length - 1], chosenColor: color };
            return copy;
        });
        if ((pendingWild?.type || type) === 'WildDraw4') {
            // add to stack or apply
            setStackDraw(prev => prev + 4);
            setTurn(prev => (prev === 'p1' ? 'cpu' : 'p1'));
        } else {
            setTurn(prev => (prev === 'p1' ? 'cpu' : 'p1'));
        }
        setPendingWild(null);
    };

    const advanceTurnAfterEffects = (card) => {
        let next = turn === 'p1' ? 'cpu' : 'p1';
        const effects = applyCardEffects(card, 1, 2);
        if (card.type === 'action' && card.value === 'Draw2') {
            setStackDraw(prev => prev + 2);
        }
        if (effects.drawsForNext === 0 && stackDraw === 0) {
            setTurn(next);
        } else {
            // keep turn switching; the draw will be resolved at the start of opponent turn unless stacked
            setTurn(next);
        }
    };

    // Resolve start-of-turn draw if any and not stacked further
    useEffect(() => {
        if (stackDraw > 0) {
            const opp = turn;
            const hand = opp === 'p1' ? p1 : cpu;
            // if opponent has a stackable card, CPU may stack automatically, player can choose
            const stackableIndex = hand.findIndex(c => canStackOnTop(c, topCard));
            if (opp === 'cpu' && stackableIndex >= 0) {
                play('cpu', stackableIndex);
            } else if (opp === 'p1') {
                // player can choose to stack by clicking; do nothing yet
            } else {
                // draw and pass
                draw(opp, stackDraw);
                setStackDraw(0);
                setTurn(opp === 'p1' ? 'cpu' : 'p1');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [turn]);

    // CPU move when it's CPU's turn and not waiting for stack response
    useEffect(() => {
        if (turn !== 'cpu' || pendingWild) return;
        const move = bestCpuMove(cpu, topCard);
        if (!move) {
            draw('cpu', 1);
            setTurn('p1');
            return;
        }
        const idx = cpu.findIndex(c => c === move);
        play('cpu', idx);
        // if wild, color is selected in play()
        // otherwise, turn handled by advanceTurnAfterEffects
        // delay slight for UX
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [turn, cpu, topCard, pendingWild]);

    return (
        <AppLayout>
            <div className="min-h-screen bg-gradient-to-br from-blue-800 to-sky-900 text-white py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-4">
                        <Link href="/games" className="text-white/80 hover:text-white">← Back</Link>
                        <div className="font-bold text-xl">UNO</div>
                        <div />
                    </div>

                    <GameBoard
                        topCard={topCard}
                        playerHandCount={p1.length}
                        cpuHandCount={cpu.length}
                        isPlayerTurn={turn === 'p1'}
                        onDraw={() => draw(turn, 1)}
                        onRestart={restart}
                        score={score}
                    />

                    {/* CPU hand backs */}
                    <div className="mt-6 flex justify-center opacity-80">
                        <div className="flex gap-2">
                            {cpu.map((_, i) => (
                                <div key={i} className="w-12 h-18 md:w-14 md:h-20 rounded-xl bg-white/20 border-2 border-white/40" />
                            ))}
                        </div>
                    </div>

                    {/* Player hand */}
                    <div className="mt-6">
                        <PlayerHand
                            hand={p1}
                            isTurn={turn === 'p1'}
                            topCard={topCard}
                            canPlayFn={canPlay}
                            onPlay={(idx) => play('p1', idx)}
                        />
                    </div>
                </div>
            </div>
            <ColorPickerModal open={!!pendingWild} onPick={(c) => assignWildColor(c, pendingWild?.type)} />
        </AppLayout>
    );
}