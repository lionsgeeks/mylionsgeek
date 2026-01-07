import React from 'react';

export default function LaughAnimation({ show, playerIndex, assignedPlayerIndex }) {
    if (!show || playerIndex !== assignedPlayerIndex) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="relative">
                <div className="text-6xl sm:text-8xl md:text-9xl" style={{
                    animation: `laughBounce 3s ease-out forwards`
                }}>
                    😂
                </div>
                <div className="absolute -top-4 -left-4 text-4xl sm:text-6xl md:text-7xl" style={{
                    animation: `laughBounce 3s ease-out 0.2s forwards`
                }}>
                    🤣
                </div>
                <div className="absolute -top-4 -right-4 text-4xl sm:text-6xl md:text-7xl" style={{
                    animation: `laughBounce 3s ease-out 0.4s forwards`
                }}>
                    😆
                </div>
                <div className="absolute top-4 -left-8 text-3xl sm:text-5xl md:text-6xl" style={{
                    animation: `laughBounce 3s ease-out 0.1s forwards`
                }}>
                    😄
                </div>
                <div className="absolute top-4 -right-8 text-3xl sm:text-5xl md:text-6xl" style={{
                    animation: `laughBounce 3s ease-out 0.3s forwards`
                }}>
                    😅
                </div>
            </div>
        </div>
    );
}





