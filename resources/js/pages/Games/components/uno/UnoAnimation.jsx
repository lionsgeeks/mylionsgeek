export default function UnoAnimation({ show, playerIndex, assignedPlayerIndex }) {
    if (!show || playerIndex !== assignedPlayerIndex) return null;

    return (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
                className="rounded-xl bg-red-600 px-8 py-6 text-3xl font-bold text-white shadow-2xl sm:rounded-2xl sm:px-12 sm:py-8 sm:text-5xl md:px-16 md:py-12 md:text-6xl"
                style={{
                    animation: 'unoPulse 2s ease-out forwards',
                }}
            >
                UNO!
            </div>
        </div>
    );
}
