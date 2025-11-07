import React from 'react';

const UndoRemove = ({ state, onUndo }) => {
    if (!state) return null;


    return (
        <>
            <div className={`fixed ${state ? 'bottom-10' : '-bottom-50'} left-1/2 -translate-x-1/2 z-50 
              bg-alpha text-dark dark:text-beta px-4 py-3 rounded-xl 
              flex items-center justify-between gap-4 w-[260px] shadow-lg 
              backdrop-blur-sm border border-dark/10 dark:border-light/10`}>

                <p className="text-sm font-medium">
                    Post Removed
                </p>

                <button onClick={onUndo} className="text-sm font-semibold underline hover:text-beta/70 cursor-pointer transition">
                    Undo
                </button>
            </div>
        </>
    );
};

export default UndoRemove;