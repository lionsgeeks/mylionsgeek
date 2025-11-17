import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const ImagePreviewModal = ({ isOpen, onClose, imageSrc }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl p-0">
                {imageSrc && (
                    <img src={imageSrc} alt="Place" className="max-h-[80vh] w-full object-contain" />
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ImagePreviewModal;

