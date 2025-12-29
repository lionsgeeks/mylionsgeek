import React from 'react';

export default function UnoButton({ show, onCallUno }) {
    if (!show) return null;

    return (
        <button
            onClick={onCallUno}
            className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-base sm:text-xl md:text-2xl px-6 py-4 sm:px-8 sm:py-6 rounded-full shadow-2xl transition-all transform active:scale-90 sm:hover:scale-110 animate-pulse touch-manipulation ring-4 ring-red-400/50"
            style={{
                boxShadow: '0 10px 30px rgba(220, 38, 38, 0.6), 0 0 20px rgba(220, 38, 38, 0.4)'
            }}
        >
            Call UNO!
        </button>
    );
}




