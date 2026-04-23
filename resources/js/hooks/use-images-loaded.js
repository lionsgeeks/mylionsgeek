import { useEffect, useMemo, useState } from 'react';

const DEFAULT_TIMEOUT_MS = 15000;

function getDocumentImages() {
    if (typeof document === 'undefined') {
        return [];
    }

    return Array.from(document.images || []).filter((img) => img && img.tagName === 'IMG');
}

function isImageLoaded(img) {
    // `complete` is true for cached images too. naturalWidth/naturalHeight guards against broken images.
    return Boolean(img?.complete && img.naturalWidth > 0 && img.naturalHeight > 0);
}

/**
 * Tracks when all <img> elements in the current document are loaded.
 * Re-runs whenever `key` changes (e.g. on Inertia navigation).
 */
export function useImagesLoaded({ key, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
    const stableKey = useMemo(() => key ?? 'default', [key]);
    const [areImagesLoaded, setAreImagesLoaded] = useState(false);

    useEffect(() => {
        let isCancelled = false;
        let timeoutId = null;
        const cleanupFns = [];

        const finalize = () => {
            if (!isCancelled) {
                setAreImagesLoaded(true);
            }
        };

        // Reset state on each key change.
        setAreImagesLoaded(false);

        const images = getDocumentImages();
        if (images.length === 0) {
            finalize();
            return () => {};
        }

        // If everything is already loaded (cache), finish immediately.
        if (images.every(isImageLoaded)) {
            finalize();
            return () => {};
        }

        let remaining = images.filter((img) => !isImageLoaded(img)).length;

        const handleOneSettled = () => {
            remaining -= 1;
            if (remaining <= 0) {
                finalize();
            }
        };

        images.forEach((img) => {
            if (isImageLoaded(img)) {
                return;
            }

            const onLoad = () => handleOneSettled();
            const onError = () => handleOneSettled();

            img.addEventListener('load', onLoad, { once: true });
            img.addEventListener('error', onError, { once: true });

            cleanupFns.push(() => {
                img.removeEventListener('load', onLoad);
                img.removeEventListener('error', onError);
            });
        });

        // Safety net: never block the app forever.
        timeoutId = window.setTimeout(() => {
            finalize();
        }, timeoutMs);

        return () => {
            isCancelled = true;
            if (timeoutId) {
                window.clearTimeout(timeoutId);
            }
            cleanupFns.forEach((fn) => {
                try {
                    fn();
                } catch {
                    // no-op
                }
            });
        };
    }, [stableKey, timeoutMs]);

    return { areImagesLoaded };
}

