import React from 'react';

export default function UnoAnimation({ show, playerIndex, assignedPlayerIndex }) {
    if (!show || playerIndex !== assignedPlayerIndex) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-4">
            <div className="bg-red-600 text-white font-bold text-3xl sm:text-5xl md:text-6xl px-8 py-6 sm:px-12 sm:py-8 md:px-16 md:py-12 rounded-xl sm:rounded-2xl shadow-2xl" style={{
                animation: 'unoPulse 2s ease-out forwards'
            }}>
                UNO!
            </div>
        </div>
    );
}





