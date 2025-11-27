import React from 'react';
import { X, Download, ChevronLeft, ChevronRight, Image as ImageIcon, Video as VideoIcon, FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Panel dial preview f right side dial chatbox
export default function PreviewPanel({ attachment, onClose, onPrevious, onNext, hasMultiple, currentIndex, totalCount }) {
    if (!attachment) return null;

    const isImage = attachment.type === 'image' || attachment.path?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
    const isVideo = attachment.type === 'video' || attachment.path?.match(/\.(mp4|webm|mov|avi)$/i);

    const handleDownload = () => {
        const url = attachment.path.startsWith('/storage/') || attachment.path.startsWith('blob:') 
            ? attachment.path 
            : `/storage/${attachment.path}`;
        const link = document.createElement('a');
        link.href = url;
        link.download = attachment.name || 'attachment';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full h-full bg-dark_gray dark:bg-dark flex flex-col">
            {/* Controls Header */}
            <div className="flex items-center justify-between p-4 border-b shrink-0 bg-background">
                <h3 className="text-sm font-semibold">Preview</h3>
                <div className="flex items-center gap-2">
                    {hasMultiple && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onPrevious}
                                className="h-8 w-8"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-xs text-muted-foreground">
                                {currentIndex + 1} / {totalCount}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onNext}
                                className="h-8 w-8"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDownload}
                        className="h-8 w-8"
                        title="Download"
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Content - Full Height */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-black/90">
                {isImage && attachment.path && (
                    <img
                        src={attachment.path.startsWith('/storage/') || attachment.path.startsWith('blob:') 
                            ? attachment.path 
                            : `/storage/${attachment.path}`}
                        alt={attachment.name || 'Attachment'}
                        className="w-full h-full object-contain rounded-lg"
                    />
                )}

                {isVideo && attachment.path && (
                    <video
                        src={attachment.path.startsWith('/storage/') || attachment.path.startsWith('blob:') 
                            ? attachment.path 
                            : `/storage/${attachment.path}`}
                        controls
                        className="w-full h-full object-contain rounded-lg"
                    />
                )}

                {!isImage && !isVideo && attachment.path && (
                    <div className="bg-beta dark:bg-dark_gray rounded-lg p-12 flex flex-col items-center gap-4 max-w-md">
                        <FileIcon className="h-24 w-24 text-alpha" />
                        <p className="text-light text-center font-medium">{attachment.name || 'Attachment'}</p>
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
        </div>
    );
}

