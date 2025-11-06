import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar,  } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, router } from '@inertiajs/react';
import { 
    FileText, 
    ImageIcon, 
    MoreHorizontal, 
    ExternalLink, 
    ArrowRight, 
    Trash, 
    Download,
    Upload,
    Plus,
    Search,
    File,
    FileCode,
    FileSpreadsheet,
    FileAudio,
    FileVideo,
    FileArchive,
    FileQuestion,
    Image,
    Paperclip,
    X
} from 'lucide-react';

const Files = ({ projectAttachments = [], taskAttachments = [], projectId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [fileFilter, setFileFilter] = useState('all');

    // Combine all attachments (project + task attachments)
    const allAttachments = [
        ...projectAttachments.map(att => ({ ...att, source: 'project' })),
        ...taskAttachments.map(att => ({ ...att, source: 'task' }))
    ];

    const filteredFiles = allAttachments.filter(file => {
        const matchesSearch = file.original_name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                             file.name?.toLowerCase()?.includes(searchTerm?.toLowerCase());
        
        if (!matchesSearch) return false;
        
        if (fileFilter === 'all') return true;
        
        const mimeType = file.mime_type || file.type || '';
        switch (fileFilter) {
            case 'images':
                return mimeType.startsWith('image/');
            case 'documents':
                return mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text');
            case 'videos':
                return mimeType.startsWith('video/');
            case 'audio':
                return mimeType.startsWith('audio/');
            case 'archives':
                return mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('rar');
            default:
                return true;
        }
    });

    const getFileIcon = (mimeType, fileName) => {
        if (mimeType?.startsWith('image/')) return <Image className="h-12 w-12 text-pink-500" />;
        if (mimeType?.startsWith('video/')) return <FileVideo className="h-12 w-12 text-purple-500" />;
        if (mimeType?.startsWith('audio/')) return <FileAudio className="h-12 w-12 text-blue-500" />;
        if (mimeType?.includes('pdf')) return <FileText className="h-12 w-12 text-rose-500" />;
        if (mimeType?.includes('spreadsheet') || mimeType?.includes('excel')) return <FileSpreadsheet className="h-12 w-12 text-green-500" />;
        if (mimeType?.includes('text')) return <FileCode className="h-12 w-12 text-amber-500" />;
        if (mimeType?.includes('zip') || mimeType?.includes('archive')) return <FileArchive className="h-12 w-12 text-gray-500" />;

        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'jpg': case 'jpeg': case 'png': case 'gif': case 'bmp': return <Image className="h-12 w-12 text-pink-500" />;
            case 'mp4': case 'avi': case 'mov': return <FileVideo className="h-12 w-12 text-purple-500" />;
            case 'mp3': case 'wav': return <FileAudio className="h-12 w-12 text-blue-500" />;
            case 'pdf': return <FileText className="h-12 w-12 text-rose-500" />;
            case 'xls': case 'xlsx': case 'csv': return <FileSpreadsheet className="h-12 w-12 text-green-500" />;
            case 'js': case 'ts': case 'jsx': case 'tsx': case 'html': case 'css': case 'json': case 'php': return <FileCode className="h-12 w-12 text-amber-500" />;
            case 'zip': case 'rar': case '7z': return <FileArchive className="h-12 w-12 text-gray-500" />;
            default: return <File className="h-12 w-12 text-gray-500" />;
        }
    };

    const handleUpload = () => {
        if (!uploadFile) return;

        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('project_id', projectId);

        router.post('/admin/projects/attachments', formData, {
            onSuccess: () => {
                setUploadFile(null);
                setIsUploadModalOpen(false);
                // The page will reload with the new attachment
            },
            onError: (errors) => {
                console.error('Upload failed:', errors);
                alert('Upload failed: ' + (errors.message || 'Unknown error'));
            }
        });
    };

    const handleDelete = (attachmentId, source) => {
        if (source === 'project') {
            router.delete(`/admin/projects/attachments/${attachmentId}`, {
                onSuccess: () => {
                    // The page will reload with the attachment removed
                },
                onError: (errors) => {
                    console.error('Delete failed:', errors);
                }
            });
        } else {
            // For task attachments, we need to find the task and remove the attachment
            // This would require additional backend logic
            console.log('Task attachment deletion not implemented yet');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header and Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            type="search" 
                            placeholder="Search files..." 
                            className="pl-8 w-[200px] md:w-[300px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    {/* File Type Filter */}
                    <Select value={fileFilter} onValueChange={setFileFilter}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Files</SelectItem>
                            <SelectItem value="images">Images</SelectItem>
                            <SelectItem value="documents">Documents</SelectItem>
                            <SelectItem value="videos">Videos</SelectItem>
                            <SelectItem value="audio">Audio</SelectItem>
                            <SelectItem value="archives">Archives</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button onClick={() => setIsUploadModalOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                </Button>
            </div>

            {/* Files Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredFiles.length === 0 ? (
                    <div className="col-span-full text-center py-16 border-2 border-dashed border-alpha/30 rounded-xl bg-gradient-to-br from-light/40 to-light/20 dark:from-dark/40 dark:to-dark/20 hover:from-alpha/10 hover:to-alpha/5 transition-all duration-300 group">
                        <Paperclip className="h-20 w-20 text-alpha/60 mx-auto mb-6 group-hover:text-alpha transition-colors" />
                        <p className="text-lg font-semibold text-dark/80 mb-2 group-hover:text-dark dark:text-light/80 dark:group-hover:text-light transition-colors">
                            {searchTerm ? 'No files match your search' : 'No files uploaded yet'}
                        </p>
                        <p className="text-sm text-dark/50 mb-8 group-hover:text-dark/70 dark:text-light/50 dark:group-hover:text-light/70 transition-colors">
                            Upload files to get started
                        </p>
                    </div>
                ) : (
                    filteredFiles.map((file) => (
                        <Card
                            key={`${file.source}-${file.id}`}
                            className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                            <CardContent className="p-0">
                                <div className="bg-muted/30 p-6 flex items-center justify-center relative">
                                    {getFileIcon(file.mime_type, file.original_name || file.name)}
                                    <Badge 
                                        variant="outline" 
                                        className="absolute top-2 right-2 text-xs"
                                    >
                                        {file.source}
                          
                                    </Badge>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex-1 min-w-0">
                                            {file.type && file.type?.startsWith('image/') ? (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <h3 className="font-medium truncate cursor-pointer hover:text-alpha transition-colors">
                                                            {file.original_name || file.name}
                                                        </h3>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-4 bg-white border border-gray-200 shadow-xl rounded-lg">
                                                        <img 
                                                            src={`/storage/${file.path}`} 
                                                            alt={file.original_name || file.name} 
                                                            className="max-w-sm max-h-sm rounded-lg shadow-sm" 
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            ) : (
                                                <h3 className="font-medium truncate">
                                                    {file.original_name || file.name}
                                                </h3>
                                            )}
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <a 
                                                        href={`/storage/${file.path}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="flex items-center w-full"
                                                    >
                                                        <ExternalLink className="mr-2 h-4 w-4" />
                                                        <span>Open</span>
                                                    </a>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <a 
                                                        href={`/storage/${file.path}`} 
                                                        download={file.original_name || file.name}
                                                        className="flex items-center w-full"
                                                    >
                                                        <Download className="mr-2 h-4 w-4" />
                                                        <span>Download</span>
                                                    </a>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {file.source === 'project' && (
                                                    <DropdownMenuItem 
                                                        className="text-destructive"
                                                        onClick={() => handleDelete(file.id, file.source)}
                                                    >
                                                        <Trash className="mr-2 h-4 w-4" />
                                                        <span>Delete</span>
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage 
                                                    src={file.uploaded_by?.image ? `/storage/${file.uploaded_by.image}` : null} 
                                                    alt={file.uploaded_by?.name} 
                                                />
                                                <AvatarFallback>
                                                    {file.uploaded_by?.name?.substring(0, 2).toUpperCase() || '??'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium text-foreground">
                                                    {file.uploaded_by?.name || 'Unknown User'}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-muted-foreground block">
                                                {new Date(file.uploaded_at).toLocaleDateString()}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(file.uploaded_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Upload File Modal */}
            <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload File</DialogTitle>
                        <DialogDescription>
                            Choose a file to upload to this project
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="file">Select File</Label>
                            <Input 
                                id="file" 
                                type="file"
                                onChange={(e) => setUploadFile(e.target.files[0])}
                            />
                        </div>
                        {uploadFile && (
                            <div className="p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    <span className="text-sm font-medium">{uploadFile.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpload} disabled={!uploadFile}>
                            Upload File
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Files;
