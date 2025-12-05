import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Download, FileIcon, Video as VideoIcon, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AttachmentPreview({ attachment, onClose }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    if (!attachment) return null;

    const isImage = attachment.type === 'image' || attachment.path?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
    const isVideo = attachment.type === 'video' || attachment.path?.match(/\.(mp4|webm|mov|avi)$/i);
    const attachments = Array.isArray(attachment) ? attachment : [attachment];

    const currentAttachment = attachments[currentIndex];
    const hasMultiple = attachments.length > 1;

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? attachments.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === attachments.length - 1 ? 0 : prev + 1));
    };

    const handleDownload = () => {
        const url = `/storage/${currentAttachment.path}`;
        const link = document.createElement('a');
        link.href = url;
        link.download = currentAttachment.name || 'attachment';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center p-4">
                {/* Close Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 h-10 w-10 bg-beta/80 hover:bg-beta text-light"
                >
                    <X className="h-5 w-5" />
                </Button>

                {/* Previous Button */}
                {hasMultiple && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToPrevious}
                        className="absolute left-4 z-10 h-12 w-12 bg-beta/80 hover:bg-beta text-light opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                )}

                {/* Next Button */}
                {hasMultiple && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToNext}
                        className="absolute right-4 z-10 h-12 w-12 bg-beta/80 hover:bg-beta text-light opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </Button>
                )}

                {/* Main Content */}
                <div className="max-w-[90vw] max-h-[90vh] flex items-center justify-center">
                    {isImage && currentAttachment.path && (
                        <img
                            src={`/storage/${currentAttachment.path}`}
                            alt={currentAttachment.name || 'Attachment'}
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        />
                    )}

                    {isVideo && currentAttachment.path && (
                        <video
                            src={`/storage/${currentAttachment.path}`}
                            controls
                            className="max-w-full max-h-[90vh] rounded-lg"
                        />
                    )}

                    {!isImage && !isVideo && currentAttachment.path && (
                        <div className="bg-beta dark:bg-dark_gray rounded-lg p-12 flex flex-col items-center gap-4 max-w-md">
                            <FileIcon className="h-24 w-24 text-alpha" />
                            <p className="text-light text-center font-medium">{currentAttachment.name || 'Attachment'}</p>
                            <Button
                                onClick={handleDownload}
                                className="bg-alpha text-beta hover:bg-alpha/90"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                            </Button>
                        </div>
                    )}
                </div>

                {/* Download Button */}
                {currentAttachment.path && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDownload}
                        className="absolute bottom-4 right-4 z-10 h-12 w-12 bg-beta/80 hover:bg-beta text-light"
                    >
                        <Download className="h-5 w-5" />
                    </Button>
                )}

                {/* Counter */}
                {hasMultiple && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-beta/80 text-light text-sm">
                        {currentIndex + 1} / {attachments.length}
                    </div>
                )}
            </div>
        </div>
    );
}

