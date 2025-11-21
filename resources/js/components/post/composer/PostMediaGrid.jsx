import React from 'react';
import { Trash2 } from 'lucide-react';
import LoadingOverlay from '@/components/LoadingOverlay';

const PostMediaGrid = ({ images = [], onRemove, isLoading = false }) => {
    if (!images.length && !isLoading) {
        return null;
    }

    const wrapperClasses = `relative w-full ${!images.length ? 'min-h-[180px]' : ''}`;

    return (
        <div className={wrapperClasses}>
            {isLoading && <LoadingOverlay message="Processing media..." />}
            {images.length > 0 && (
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {images.map((image) => (
                        <div key={image.id} className="relative group rounded-2xl overflow-hidden shadow">
                            <button
                                type="button"
                                onClick={() => onRemove?.(image)}
                                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-error/90 hover:bg-error text-light shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95"
                                aria-label="Remove image"
                            >
                                <Trash2 size={16} />
                            </button>
                            <img
                                src={image.preview}
                                alt="Selected media"
                                className="w-full h-[45vh] object-cover"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PostMediaGrid;

