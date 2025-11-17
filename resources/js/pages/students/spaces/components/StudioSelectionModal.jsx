import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const StudioSelectionModal = ({ isOpen, onClose, studios, onSelectStudio }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-light dark:bg-dark">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Select a Studio</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">Choose a studio to make a reservation</p>
                </DialogHeader>
                <div className="py-6">
                    <div className="flex gap-6 overflow-x-auto pb-4 px-1 custom-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: '#ffc801 transparent' }}>
                        {studios.map(studio => (
                            <button
                                key={studio.id}
                                onClick={() => onSelectStudio(studio)}
                                className="flex-shrink-0 w-[240px] rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-alpha dark:hover:border-alpha p-5 transition-all hover:shadow-lg hover:scale-105 bg-card dark:bg-neutral-800/90 backdrop-blur-sm"
                            >
                                {studio.image ? (
                                    <img
                                        src={studio.image}
                                        alt={studio.name}
                                        className="w-full h-40 object-cover rounded-lg mb-4 border border-gray-200 dark:border-gray-700"
                                    />
                                ) : (
                                    <div className="w-full h-40 rounded-lg mb-4 bg-muted flex items-center justify-center border border-gray-200 dark:border-gray-700">
                                        <span className="text-muted-foreground text-sm">No Image</span>
                                    </div>
                                )}
                                <div className="text-center">
                                    <div className="font-semibold text-foreground text-base mb-1">{studio.name}</div>
                                    <div className="text-xs text-muted-foreground capitalize px-2 py-1 rounded-full bg-muted/50 inline-block">
                                        {studio.type}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default StudioSelectionModal;

