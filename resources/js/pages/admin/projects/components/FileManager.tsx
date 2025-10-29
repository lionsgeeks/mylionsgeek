import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { Calendar, Download, File, FileText, Image, Music, Trash, Upload, User, Video } from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface Attachment {
    id: number;
    name: string;
    original_name: string;
    path: string;
    mime_type: string;
    size: number;
    uploaded_by: number;
    uploader?: { name: string };
    created_at: string;
}

interface FileManagerProps {
    attachments: Attachment[];
    onFileUpload: (file: File, taskId?: number) => void;
    onFileDelete: (id: number) => void;
    tasks: Array<{ id: number; title: string }>;
}

const FileManager: React.FC<FileManagerProps> = ({ attachments, onFileUpload, onFileDelete, tasks }) => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [filterDate, setFilterDate] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedTask, setSelectedTask] = useState('');

    const { setData: setUploadData, processing } = useForm({
        file: null as File | null,
        task_id: null as number | null,
    });

    const filteredAttachments = useMemo(() => {
        return attachments.filter((attachment) => {
            const matchesSearch = attachment.original_name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'all' || getFileType(attachment.mime_type) === filterType;
            const matchesDate = filterDate === 'all' || isWithinDateRange(attachment.created_at, filterDate);

            return matchesSearch && matchesType && matchesDate;
        });
    }, [attachments, searchTerm, filterType, filterDate]);

    const getFileType = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType.startsWith('audio/')) return 'audio';
        if (mimeType === 'application/pdf') return 'pdf';
        if (mimeType.startsWith('application/')) return 'document';
        return 'file';
    };

    const getFileIcon = (mimeType: string) => {
        const type = getFileType(mimeType);
        switch (type) {
            case 'image':
                return <Image className="h-5 w-5 text-green-600" />;
            case 'video':
                return <Video className="h-5 w-5 text-red-600" />;
            case 'audio':
                return <Music className="h-5 w-5 text-purple-600" />;
            case 'pdf':
                return <FileText className="h-5 w-5 text-red-600" />;
            case 'document':
                return <FileText className="h-5 w-5 text-blue-600" />;
            default:
                return <File className="h-5 w-5 text-gray-600" />;
        }
    };

    const getFileTypeColor = (mimeType: string) => {
        const type = getFileType(mimeType);
        switch (type) {
            case 'image':
                return 'bg-green-100 text-green-800';
            case 'video':
                return 'bg-red-100 text-red-800';
            case 'audio':
                return 'bg-purple-100 text-purple-800';
            case 'pdf':
                return 'bg-red-100 text-red-800';
            case 'document':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatFileSize = (bytes: number) => {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(1)} ${units[unitIndex]}`;
    };

    const isWithinDateRange = (dateString: string, range: string) => {
        const date = new Date(dateString);
        const now = new Date();

        switch (range) {
            case 'today':
                return date.toDateString() === now.toDateString();
            case 'week': {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return date >= weekAgo;
            }
            case 'month': {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return date >= monthAgo;
            }
            default:
                return true;
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setUploadData('file', file);
        }
    };

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedFile) {
            onFileUpload(selectedFile, selectedTask && selectedTask !== 'none' ? parseInt(selectedTask) : undefined);
            setIsUploadModalOpen(false);
            setSelectedFile(null);
            setSelectedTask('');
            setUploadData({ file: null, task_id: null });
        }
    };

    const fileStats = useMemo(() => {
        const total = attachments.length;
        const images = attachments.filter((a) => getFileType(a.mime_type) === 'image').length;
        const documents = attachments.filter((a) => getFileType(a.mime_type) === 'document').length;
        const videos = attachments.filter((a) => getFileType(a.mime_type) === 'video').length;
        const totalSize = attachments.reduce((sum, a) => sum + a.size, 0);

        return { total, images, documents, videos, totalSize };
    }, [attachments]);

    return (
        <div className="space-y-6">
            {/* File Statistics */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <File className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium">Total Files</p>
                                <p className="text-2xl font-bold">{fileStats.total}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Image className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="text-sm font-medium">Images</p>
                                <p className="text-2xl font-bold">{fileStats.images}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium">Documents</p>
                                <p className="text-2xl font-bold">{fileStats.documents}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Video className="h-5 w-5 text-red-600" />
                            <div>
                                <p className="text-sm font-medium">Videos</p>
                                <p className="text-2xl font-bold">{fileStats.videos}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* File Management */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Project Files</CardTitle>
                        <Button onClick={() => setIsUploadModalOpen(true)} className="bg-[var(--color-alpha)] hover:bg-[var(--color-alpha)]/90">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload File
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                        <div className="flex-1">
                            <Input placeholder="Search files..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="image">Images</SelectItem>
                                <SelectItem value="document">Documents</SelectItem>
                                <SelectItem value="video">Videos</SelectItem>
                                <SelectItem value="audio">Audio</SelectItem>
                                <SelectItem value="pdf">PDFs</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterDate} onValueChange={setFilterDate}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Date" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">This Week</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Files Grid */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredAttachments.map((attachment) => (
                            <Card key={attachment.id} className="transition-shadow hover:shadow-md">
                                <CardContent className="p-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">{getFileIcon(attachment.mime_type)}</div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate font-medium">{attachment.original_name}</h3>
                                            <p className="text-sm text-muted-foreground">{formatFileSize(attachment.size)}</p>
                                            <Badge className={`mt-1 ${getFileTypeColor(attachment.mime_type)}`}>
                                                {getFileType(attachment.mime_type)}
                                            </Badge>
                                            <div className="mt-2 flex items-center space-x-2 text-xs text-muted-foreground">
                                                <User className="h-3 w-3" />
                                                <span>{attachment.uploader?.name}</span>
                                                <Calendar className="h-3 w-3" />
                                                <span>{new Date(attachment.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onFileDelete(attachment.id)} className="text-red-600">
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredAttachments.length === 0 && (
                        <div className="py-8 text-center">
                            <File className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="text-lg font-medium">No files found</h3>
                            <p className="text-muted-foreground">Upload files to share with your team.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Upload Modal */}
            <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload File</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="file">Select File</Label>
                            <Input id="file" type="file" onChange={handleFileSelect} required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="task">Associate with Task (Optional)</Label>
                            <Select value={selectedTask} onValueChange={setSelectedTask}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select task" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No task</SelectItem>
                                    {tasks.map((task) => (
                                        <SelectItem key={task.id} value={task.id.toString()}>
                                            {task.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedFile && (
                            <div className="rounded-lg bg-gray-50 p-3">
                                <div className="flex items-center space-x-2">
                                    {getFileIcon(selectedFile.type)}
                                    <div>
                                        <p className="font-medium">{selectedFile.name}</p>
                                        <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsUploadModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing || !selectedFile}
                                className="bg-[var(--color-alpha)] hover:bg-[var(--color-alpha)]/90"
                            >
                                {processing ? 'Uploading...' : 'Upload File'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FileManager;
