import React from 'react';
import { Paperclip, Image, File, FileCode, FileSpreadsheet, FileAudio, FileVideo, FileArchive, FileText, Download } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

const getFileIcon = (mimeType, fileName) => {
    if (mimeType.startsWith('image/')) return <Image className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
    if (mimeType.startsWith('video/')) return <FileVideo className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
    if (mimeType.startsWith('audio/')) return <FileAudio className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
    if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <FileSpreadsheet className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
    if (mimeType.includes('text')) return <FileCode className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
    if (mimeType.includes('zip') || mimeType.includes('archive')) return <FileArchive className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;

    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'jpg': case 'jpeg': case 'png': case 'gif': case 'bmp': return <Image className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
        case 'mp4': case 'avi': case 'mov': return <FileVideo className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
        case 'mp3': case 'wav': return <FileAudio className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
        case 'pdf': return <FileText className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
        case 'xls': case 'xlsx': case 'csv': return <FileSpreadsheet className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
        case 'js': case 'ts': case 'jsx': case 'tsx': case 'html': case 'css': case 'json': case 'php': return <FileCode className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
        case 'zip': case 'rar': case '7z': return <FileArchive className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
        default: return <File className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
    }
};

const ProjectAttachments = ({ attachments = [] }) => {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-dark dark:text-light">Project Attachments</h2>
            {(attachments.length > 0) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {attachments.map(attachment => (
                        <div key={attachment.id} className="flex items-center justify-between p-4 bg-light/80 dark:bg-neutral-800 rounded-xl border border-alpha/20 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-light/30 dark:bg-zinc-700 rounded-lg">
                                    {getFileIcon(attachment.mime_type, attachment.original_name)}
                                </div>
                                <div>
                                    {attachment.mime_type && attachment.mime_type.startsWith('image/') ? (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <p className="text-dark font-medium dark:text-light cursor-pointer hover:text-alpha transition-colors">{attachment.original_name}</p>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 bg-white border-none shadow-none">
                                                <img src={`/storage/${attachment.path}`} alt={attachment.original_name} className="max-w-xs max-h-xs rounded-lg shadow-xl" />
                                            </PopoverContent>
                                        </Popover>
                                    ) : (
                                        <p className="text-dark font-medium dark:text-light">{attachment.original_name}</p>
                                    )}
                                    <p className="text-xs text-dark/50 dark:text-zinc-400">
                                        {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a className='text-dark/60 dark:text-alpha hover:text-alpha dark:hover:text-alpha hover:bg-alpha/20 p-2 rounded-md' download={true} href={`/storage/${attachment.path}`} target="_blank" rel="noopener noreferrer">
                                    <Download className="h-5 w-5" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed border-alpha/30 rounded-xl bg-gradient-to-br from-light/40 to-light/20 dark:from-dark/40 dark:to-dark/20 hover:from-alpha/10 hover:to-alpha/5 transition-all duration-300 group">
                    <Paperclip className="h-20 w-20 text-alpha/60 mx-auto mb-6 group-hover:text-alpha transition-colors" />
                    <p className="text-lg font-semibold text-dark/80 mb-2 group-hover:text-dark dark:text-light/80 dark:group-hover:text-light transition-colors">No attachments yet</p>
                    <p className="text-sm text-dark/50 mb-8 group-hover:text-dark/70 dark:text-light/50 dark:group-hover:text-light/70 transition-colors">Project has no attachments.</p>
                </div>
            )}
        </div>
    );
};

export default ProjectAttachments;
