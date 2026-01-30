import LoadingOverlay from '@/components/LoadingOverlay';
import { Trash2 } from 'lucide-react';

const PostMediaGrid = ({ images = [], onRemove, isLoading = false }) => {
    if (!images.length && !isLoading) {
        return null;
    }

    const wrapperClasses = `relative w-full ${!images.length ? 'min-h-[180px]' : ''}`;

    return (
        <div className={wrapperClasses}>
            {isLoading && <LoadingOverlay message="Processing media..." />}
            {images.length > 0 && (
                <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                    {images.map((image) => (
                        <div key={image.id} className="group relative overflow-hidden rounded-2xl shadow">
                            <button
                                type="button"
                                onClick={() => onRemove?.(image)}
                                className="absolute top-3 right-3 z-10 rounded-full bg-error/90 p-2 text-light opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 hover:scale-110 hover:bg-error active:scale-95"
                                aria-label="Remove image"
                            >
                                <Trash2 size={16} />
                            </button>
                            <img src={image.preview} alt="Selected media" className="h-[45vh] w-full object-cover" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PostMediaGrid;
