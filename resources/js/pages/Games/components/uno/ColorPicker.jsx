import React from 'react';
import { COLORS } from './constants';

export default function ColorPicker({ show, selectedCard, onColorSelect, onCancel }) {
    if (!show || !selectedCard) return null;

    return (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Choose a Color</h3>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {COLORS.map(color => (
                        <button
                            key={color}
                            onClick={() => onColorSelect(color)}
                            className={`px-4 py-4 sm:px-6 sm:py-6 rounded-lg font-bold text-white capitalize text-base sm:text-lg shadow-lg active:scale-95 sm:hover:scale-105 transition-transform touch-manipulation ${
                                color === 'red' ? 'bg-red-600 hover:bg-red-700' :
                                color === 'green' ? 'bg-green-600 hover:bg-green-700' :
                                color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                                'bg-yellow-600 hover:bg-yellow-700'
                            }`}
                        >
                            {color}
                        </button>
                    ))}
                </div>
                <button
                    onClick={onCancel}
                    className="mt-4 sm:mt-6 w-full px-4 py-3 bg-gray-300 rounded-lg hover:bg-gray-400 font-semibold touch-manipulation"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}






