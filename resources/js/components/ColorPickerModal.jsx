export default function ColorPickerModal({ open, onPick }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
                <div className="mb-3 text-lg font-bold">Choose a color</div>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => onPick('red')} className="h-12 rounded-lg bg-red-600 font-semibold text-white">
                        Red
                    </button>
                    <button onClick={() => onPick('green')} className="h-12 rounded-lg bg-green-600 font-semibold text-white">
                        Green
                    </button>
                    <button onClick={() => onPick('blue')} className="h-12 rounded-lg bg-blue-600 font-semibold text-white">
                        Blue
                    </button>
                    <button onClick={() => onPick('yellow')} className="h-12 rounded-lg bg-yellow-500 font-semibold text-white">
                        Yellow
                    </button>
                </div>
            </div>
        </div>
    );
}
