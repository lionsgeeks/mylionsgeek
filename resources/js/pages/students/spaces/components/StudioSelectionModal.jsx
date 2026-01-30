import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const StudioSelectionModal = ({ isOpen, onClose, studios, onSelectStudio }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto bg-light dark:bg-dark">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Select a Studio</DialogTitle>
                    <p className="mt-1 text-sm text-muted-foreground">Choose a studio to make a reservation</p>
                </DialogHeader>
                <div className="py-6">
                    <div
                        className="custom-scrollbar flex gap-6 overflow-x-auto px-1 pb-4"
                        style={{ scrollbarWidth: 'thin', scrollbarColor: '#ffc801 transparent' }}
                    >
                        {studios.map((studio) => (
                            <button
                                key={studio.id}
                                onClick={() => onSelectStudio(studio)}
                                className="w-[240px] flex-shrink-0 rounded-xl border-2 border-gray-200 bg-card p-5 backdrop-blur-sm transition-all hover:scale-105 hover:border-alpha hover:shadow-lg dark:border-gray-700 dark:bg-neutral-800/90 dark:hover:border-alpha"
                            >
                                {studio.image ? (
                                    <img
                                        src={studio.image}
                                        alt={studio.name}
                                        className="mb-4 h-40 w-full rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                                    />
                                ) : (
                                    <div className="mb-4 flex h-40 w-full items-center justify-center rounded-lg border border-gray-200 bg-muted dark:border-gray-700">
                                        <span className="text-sm text-muted-foreground">No Image</span>
                                    </div>
                                )}
                                <div className="text-center">
                                    <div className="mb-1 text-base font-semibold text-foreground">{studio.name}</div>
                                    <div className="inline-block rounded-full bg-muted/50 px-2 py-1 text-xs text-muted-foreground capitalize">
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
