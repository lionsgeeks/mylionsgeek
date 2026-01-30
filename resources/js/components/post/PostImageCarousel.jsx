import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { helpers } from '../utils/helpers';

const PostImageCarousel = ({ images = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { resolvePostImageUrl } = helpers();

    // Handle case where images is empty or single image
    if (!images || images.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-dark_gray dark:bg-dark">
                <p className="text-light/50">No image available</p>
            </div>
        );
    }

    // Single image - no carousel needed
    if (images.length === 1) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <img src={resolvePostImageUrl(images[0]) ?? ''} alt="Post content" className="max-h-full max-w-full rounded object-contain" />
            </div>
        );
    }

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    return (
        <div className="group relative flex h-full w-full items-center justify-center">
            {/* Main Image */}
            <img
                src={resolvePostImageUrl(images[currentIndex]) ?? ''}
                alt={`Post content ${currentIndex + 1}`}
                className="max-h-full max-w-full rounded object-contain transition-opacity duration-300"
            />

            {/* Previous Button */}
            <button
                onClick={goToPrevious}
                className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-beta/80 p-2 opacity-0 transition-all group-hover:opacity-100 hover:bg-beta focus:opacity-100 sm:left-4 sm:p-3 dark:bg-dark/80 dark:hover:bg-dark"
                aria-label="Previous image"
            >
                <ChevronLeft className="h-5 w-5 text-light sm:h-6 sm:w-6" />
            </button>

            {/* Next Button */}
            <button
                onClick={goToNext}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-beta/80 p-2 opacity-0 transition-all group-hover:opacity-100 hover:bg-beta focus:opacity-100 sm:right-4 sm:p-3 dark:bg-dark/80 dark:hover:bg-dark"
                aria-label="Next image"
            >
                <ChevronRight className="h-5 w-5 text-light sm:h-6 sm:w-6" />
            </button>

            {/* Image Counter */}
            <div className="absolute top-3 right-3 rounded-full bg-beta/80 px-3 py-1.5 text-xs font-medium text-light sm:top-4 sm:right-4 sm:text-sm dark:bg-dark/80">
                {currentIndex + 1} / {images.length}
            </div>

            {/* Dots Indicator */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-beta/80 px-3 py-2 sm:bottom-4 sm:gap-2 dark:bg-dark/80">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`rounded-full transition-all ${
                            index === currentIndex ? 'h-1.5 w-6 bg-alpha sm:h-2 sm:w-8' : 'h-1.5 w-1.5 bg-light/50 hover:bg-light/70 sm:h-2 sm:w-2'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                    />
                ))}
            </div>

            {/* Thumbnail Preview (for larger screens) */}
            {images.length <= 5 && (
                <div className="absolute bottom-16 left-1/2 hidden -translate-x-1/2 gap-2 rounded-lg bg-beta/80 px-3 py-2 lg:flex dark:bg-dark/80">
                    {images.map((img, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-12 w-12 overflow-hidden rounded transition-all ${
                                index === currentIndex ? 'scale-110 ring-2 ring-alpha' : 'opacity-60 hover:opacity-100'
                            }`}
                        >
                            <img src={resolvePostImageUrl(img) ?? ''} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PostImageCarousel;
