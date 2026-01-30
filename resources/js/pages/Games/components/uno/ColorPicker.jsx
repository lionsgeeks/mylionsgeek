import { COLORS } from './constants';

export default function ColorPicker({ show, selectedCard, onColorSelect, onCancel }) {
    if (!show || !selectedCard) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent px-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl sm:p-8">
                <h3 className="mb-4 text-center text-xl font-bold sm:mb-6 sm:text-2xl">Choose a Color</h3>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {COLORS.map((color) => (
                        <button
                            key={color}
                            onClick={() => onColorSelect(color)}
                            className={`touch-manipulation rounded-lg px-4 py-4 text-base font-bold text-white capitalize shadow-lg transition-transform active:scale-95 sm:px-6 sm:py-6 sm:text-lg sm:hover:scale-105 ${
                                color === 'red'
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : color === 'green'
                                      ? 'bg-green-600 hover:bg-green-700'
                                      : color === 'blue'
                                        ? 'bg-blue-600 hover:bg-blue-700'
                                        : 'bg-yellow-600 hover:bg-yellow-700'
                            }`}
                        >
                            {color}
                        </button>
                    ))}
                </div>
                <button
                    onClick={onCancel}
                    className="mt-4 w-full touch-manipulation rounded-lg bg-gray-300 px-4 py-3 font-semibold hover:bg-gray-400 sm:mt-6"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
