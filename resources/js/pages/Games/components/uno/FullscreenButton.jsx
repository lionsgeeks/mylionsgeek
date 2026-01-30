export default function FullscreenButton({ isFullscreen, onToggle }) {
    return (
        <div className="absolute top-2 right-2 z-20 sm:top-4 sm:right-4">
            <button
                onClick={onToggle}
                className="flex transform items-center gap-1 rounded-lg border border-[#ffc801]/50 bg-[#ffc801] px-2.5 py-1.5 text-xs font-semibold text-[#171717] shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#ffd633] hover:shadow-xl active:scale-95 sm:gap-2 sm:rounded-xl sm:px-5 sm:py-3 sm:text-base"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
                {isFullscreen ? (
                    <>
                        <svg className="h-3.5 w-3.5 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="hidden sm:inline">Exit</span>
                    </>
                ) : (
                    <>
                        <svg className="h-3.5 w-3.5 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                            />
                        </svg>
                        <span className="hidden sm:inline">Fullscreen</span>
                    </>
                )}
            </button>
        </div>
    );
}
