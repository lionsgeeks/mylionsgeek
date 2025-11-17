import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PostImageCarousel = ({ images = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Handle case where images is empty or single image
    if (!images || images.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-dark_gray dark:bg-dark">
                <p className="text-light/50">No image available</p>
            </div>
        );
    }

    // Single image - no carousel needed
    if (images.length === 1) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <img
                    src={'/storage/img/posts/' + images[0]}
                    alt="Post content"
                    className="max-w-full max-h-full object-contain rounded"
                />
            </div>
        );
    }

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    return (
        <div className="relative w-full h-full flex items-center justify-center group">
            {/* Main Image */}
            <img
                src={'/storage/img/posts/' + images[currentIndex]}
                alt={`Post content ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded transition-opacity duration-300"
            />

            {/* Previous Button */}
            <button
                onClick={goToPrevious}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-beta/80 dark:bg-dark/80 hover:bg-beta dark:hover:bg-dark transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Previous image"
            >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-light" />
            </button>

            {/* Next Button */}
            <button
                onClick={goToNext}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-beta/80 dark:bg-dark/80 hover:bg-beta dark:hover:bg-dark transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Next image"
            >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-light" />
            </button>

            {/* Image Counter */}
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 px-3 py-1.5 rounded-full bg-beta/80 dark:bg-dark/80 text-light text-xs sm:text-sm font-medium">
                {currentIndex + 1} / {images.length}
            </div>

            {/* Dots Indicator */}
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-full bg-beta/80 dark:bg-dark/80">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`transition-all rounded-full ${index === currentIndex
                            ? 'w-6 sm:w-8 h-1.5 sm:h-2 bg-alpha'
                            : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-light/50 hover:bg-light/70'
                            }`}
                        aria-label={`Go to image ${index + 1}`}
                    />
                ))}
            </div>

            {/* Thumbnail Preview (for larger screens) */}
            {images.length <= 5 && (
                <div className="hidden lg:flex absolute bottom-16 left-1/2 -translate-x-1/2 gap-2 px-3 py-2 rounded-lg bg-beta/80 dark:bg-dark/80">
                    {images.map((img, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-12 h-12 rounded overflow-hidden transition-all ${index === currentIndex
                                ? 'ring-2 ring-alpha scale-110'
                                : 'opacity-60 hover:opacity-100'
                                }`}
                        >
                            <img
                                src={'/storage/img/posts/' + img}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PostImageCarousel;