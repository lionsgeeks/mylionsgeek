import React from 'react';
import { motion } from 'framer-motion';

const colorBg = {
    red: 'from-red-500 to-rose-600',
    green: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-cyan-600',
    yellow: 'from-yellow-400 to-amber-500',
};

export default function Card({ card, playable, onClick }) {
    const isWild = card.type === 'wild';
    const bg = isWild ? 'from-gray-800 to-slate-700' : (colorBg[card.color] || 'from-gray-400 to-gray-500');
    const label = card.type === 'number' ? card.value : card.value.replace('Draw', '+');

    return (
        <motion.button
            whileHover={playable ? { y: -6 } : {}}
            whileTap={playable ? { scale: 0.98 } : {}}
            onClick={onClick}
            disabled={!playable}
            className={`w-16 h-24 rounded-xl border-2 border-white/30 shadow-md bg-gradient-to-br ${bg} text-white font-extrabold flex items-center justify-center select-none ${playable ? '' : 'opacity-60 cursor-not-allowed'}`}
        >
            <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)] text-lg">{label}</span>
        </motion.button>
    );
}


