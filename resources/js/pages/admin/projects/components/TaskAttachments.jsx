import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Paperclip, Trash } from 'lucide-react';

const TaskAttachments = ({ attachments = [], onUpdateAttachments }) => {
    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            const newAttachments = files.map((file, index) => ({
                id: attachments.length + index + 1,
                name: file.name,
                type: file.type.split('/')[1] || 'file',
                size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
                url: URL.createObjectURL(file),
            }));
            onUpdateAttachments([...attachments, ...newAttachments]);
        }
    };

    const handleDownloadFile = (attachment) => {
        if (attachment.url && attachment.url !== '#') {
            const link = document.createElement('a');
            link.href = attachment.url;
            link.download = attachment.name;
            link.click();
        } else {
            //('Downloading:', attachment.name);
        }
    };

    const handleDeleteAttachment = (id) => {
        const updatedAttachments = attachments.filter((attachment) => attachment.id !== id);
        onUpdateAttachments(updatedAttachments);
    };

    return (
        <Card className="bg-background/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                    <Paperclip className="h-4 w-4" />
                    Attachments
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {/* Dynamic attachments */}
                {attachments.map((attachment) => (
                    <div key={attachment.id} className="group flex items-center justify-between">
                        <div className="flex flex-1 items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span className="truncate">{attachment.name}</span>
                            <span className="text-xs text-muted-foreground">({attachment.size})</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleDownloadFile(attachment)}>
                                <Download className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-destructive"
                                onClick={() => handleDeleteAttachment(attachment.id)}
                            >
                                <Trash className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                ))}

                {/* File upload */}
                <div className="pt-2">
                    <input type="file" onChange={handleFileUpload} className="hidden" id="file-upload" multiple />
                    <Button variant="outline" size="sm" className="w-full" onClick={() => document.getElementById('file-upload').click()}>
                        <Paperclip className="mr-2 h-4 w-4" />
                        Add File
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default TaskAttachments;
