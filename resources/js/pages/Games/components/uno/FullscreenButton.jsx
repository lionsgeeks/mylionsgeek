import React from 'react';

export default function FullscreenButton({ isFullscreen, onToggle }) {
    return (
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20">
            <button
                onClick={onToggle}
                className="bg-[#ffc801] hover:bg-[#ffd633] text-[#171717] px-2.5 py-1.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-base transition-all duration-300 flex items-center gap-1 sm:gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 border border-[#ffc801]/50"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
                {isFullscreen ? (
                    <>
                        <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="hidden sm:inline">Exit</span>
                    </>
                ) : (
                    <>
                        <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        <span className="hidden sm:inline">Fullscreen</span>
                    </>
                )}
            </button>
        </div>
    );
}

