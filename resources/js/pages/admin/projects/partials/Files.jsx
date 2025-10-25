import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    Search
} from 'lucide-react';

const Files = ({ files = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);

    const filteredFiles = files.filter(file => 
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getFileIcon = (type) => {
        switch (type) {
            case 'pdf':
                return <FileText className="h-12 w-12 text-rose-500" />;
            case 'fig':
                return <ImageIcon className="h-12 w-12 text-purple-500" />;
            case 'sketch':
                return <ImageIcon className="h-12 w-12 text-amber-500" />;
            case 'doc':
            case 'docx':
                return <FileText className="h-12 w-12 text-blue-500" />;
            case 'xls':
            case 'xlsx':
                return <FileText className="h-12 w-12 text-green-500" />;
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
                return <ImageIcon className="h-12 w-12 text-pink-500" />;
            default:
                return <FileText className="h-12 w-12 text-gray-500" />;
        }
    };

    const handleUpload = () => {
        console.log('Uploading file:', uploadFile);
        setUploadFile(null);
        setIsUploadModalOpen(false);
    };

    return (
        <div className="space-y-6">
            {/* Header and Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-2">
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
                </div>

                <Button onClick={() => setIsUploadModalOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                </Button>
            </div>

            {/* Files Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredFiles.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        {searchTerm ? 'No files match your search' : 'No files uploaded yet'}
                    </div>
                ) : (
                    filteredFiles.map((file) => (
                        <Card
                            key={file.id}
                            className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                            <CardContent className="p-0">
                                <div className="bg-muted/30 p-6 flex items-center justify-center">
                                    {getFileIcon(file.type)}
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium truncate">{file.name}</h3>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                    <span>Open</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Download className="mr-2 h-4 w-4" />
                                                    <span>Download</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <ArrowRight className="mr-2 h-4 w-4" />
                                                    <span>Share</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive">
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    <span>Delete</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={file.uploadedBy?.avatar} alt={file.uploadedBy?.name} />
                                                <AvatarFallback>{file.uploadedBy?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs text-muted-foreground">{file.size}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(file.modified).toLocaleDateString()}
                                        </span>
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
