import React, { useState, useEffect } from 'react';
import { Paperclip, FileIcon, Image as ImageIcon, Video as VideoIcon, Link as LinkIcon, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Toolbox component dial attachments w posts
export default function ChatToolbox({ conversationId, otherUserId, onPreviewAttachment, messages = [] }) {
    const [attachments, setAttachments] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Get CSRF token
    const getCsrfToken = () => {
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        return metaTag ? metaTag.getAttribute('content') : '';
    };

    useEffect(() => {
        // Filter attachments from messages prop - pas audios
        if (messages && messages.length > 0) {
            const allAttachments = messages
                .filter(msg => msg.attachment_path && msg.attachment_type !== 'audio')
                .map(msg => ({
                    id: msg.id,
                    type: msg.attachment_type,
                    path: msg.attachment_path,
                    name: msg.attachment_name,
                    created_at: msg.created_at,
                }));
            setAttachments(allAttachments);
        }
        fetchPosts();
    }, [messages, otherUserId]);

    // Jib posts dial user b fetch
    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/chat/user/${otherUserId}/posts`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }

            const data = await response.json();
            setPosts(data.posts || []);
        } catch (error) {
            console.error('Failed to fetch posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = (attachment, onPreviewAttachment) => {
        if (attachment.type === 'image' || attachment.type === 'video') {
            onPreviewAttachment({
                type: attachment.type,
                path: attachment.path,
                name: attachment.name,
            });
        }
    };

    const getAttachmentIcon = (type) => {
        switch (type) {
            case 'image':
                return <ImageIcon className="h-5 w-5 text-alpha" />;
            case 'video':
                return <VideoIcon className="h-5 w-5 text-alpha" />;
            case 'audio':
                return <Paperclip className="h-5 w-5 text-alpha" />;
            default:
                return <FileIcon className="h-5 w-5 text-alpha" />;
        }
    };

    return (
        <div className="w-full h-full bg-background flex flex-col border-l">
            <Tabs defaultValue="attachments" className="flex flex-col h-full">
                <div className="p-4 border-b shrink-0">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="attachments">Attachments</TabsTrigger>
                        <TabsTrigger value="posts">Posts</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="attachments" className="flex-1 min-h-0 m-0">
                    <ScrollArea className="h-full p-4">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <span className="text-sm text-muted-foreground">Loading...</span>
                            </div>
                        ) : attachments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <Paperclip className="h-12 w-12 mb-2 opacity-20" />
                                <p className="text-sm">No attachments yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                {attachments.map((attachment) => (
                                    <div
                                        key={attachment.id}
                                        className={cn(
                                            "relative rounded-lg overflow-hidden cursor-pointer group",
                                            attachment.type === 'image' ? "aspect-square" : "aspect-video"
                                        )}
                                        onClick={() => onPreviewAttachment && handlePreview(attachment, onPreviewAttachment)}
                                    >
                                        {attachment.type === 'image' ? (
                                            <img
                                                src={attachment.path.startsWith('/storage/') || attachment.path.startsWith('blob:') 
                                                    ? attachment.path 
                                                    : `/storage/${attachment.path}`}
                                                alt={attachment.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : attachment.type === 'video' ? (
                                            <video
                                                src={attachment.path.startsWith('/storage/') || attachment.path.startsWith('blob:') 
                                                    ? attachment.path 
                                                    : `/storage/${attachment.path}`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-muted flex items-center justify-center">
                                                {getAttachmentIcon(attachment.type)}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <Eye className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="posts" className="flex-1 min-h-0 m-0">
                    <ScrollArea className="h-full p-4">
                        {posts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <LinkIcon className="h-12 w-12 mb-2 opacity-20" />
                                <p className="text-sm">No posts shared yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {posts.map((post) => (
                                    <div key={post.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                                        {post.images && post.images.length > 0 && (
                                            <img
                                                src={`/storage/img/posts/${post.images[0]}`}
                                                alt="Post"
                                                className="w-full h-48 object-cover rounded-lg mb-2"
                                            />
                                        )}
                                        <p className="text-sm line-clamp-2">{post.description}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                            <span>❤️ {post.likes_count}</span>
                                            <span>💬 {post.comments_count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>
    );
}
