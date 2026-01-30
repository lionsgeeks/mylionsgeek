export default function UnoButton({ show, onCallUno }) {
    if (!show) return null;

    return (
        <button
            onClick={onCallUno}
            className="fixed right-4 bottom-20 z-50 transform animate-pulse touch-manipulation rounded-full bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 text-base font-bold text-white shadow-2xl ring-4 ring-red-400/50 transition-all hover:from-red-700 hover:to-red-800 active:scale-90 sm:right-6 sm:bottom-6 sm:px-8 sm:py-6 sm:text-xl sm:hover:scale-110 md:text-2xl"
            style={{
                boxShadow: '0 10px 30px rgba(220, 38, 38, 0.6), 0 0 20px rgba(220, 38, 38, 0.4)',
            }}
        >
            Call UNO!
        </button>
    );
}
