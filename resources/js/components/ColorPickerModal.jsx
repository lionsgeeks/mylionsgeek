import React from 'react';

export default function ColorPickerModal({ open, onPick }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
                <div className="text-lg font-bold mb-3">Choose a color</div>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => onPick('red')} className="h-12 rounded-lg text-white font-semibold bg-red-600">Red</button>
                    <button onClick={() => onPick('green')} className="h-12 rounded-lg text-white font-semibold bg-green-600">Green</button>
                    <button onClick={() => onPick('blue')} className="h-12 rounded-lg text-white font-semibold bg-blue-600">Blue</button>
                    <button onClick={() => onPick('yellow')} className="h-12 rounded-lg text-white font-semibold bg-yellow-500">Yellow</button>
                </div>
            </div>
        </div>
    );
}


