import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar,  } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Send, AtSign } from 'lucide-react';

const TaskComments = ({ comments = [], teamMembers = [], onUpdateComments }) => {
    const [newComment, setNewComment] = useState('');
    const [showMentions, setShowMentions] = useState(false);
    const [mentionPosition, setMentionPosition] = useState(0);
    const inputRef = useRef(null);

    const handleAddComment = () => {
        if (newComment.trim()) {
            const newCommentObj = {
                id: comments.length + 1,
                user: { 
                    name: "You", 
                    avatar: "/placeholder.svg?height=32&width=32" 
                },
                content: newComment,
                timestamp: new Date().toISOString()
            };
            onUpdateComments([...comments, newCommentObj]);
            setNewComment('');
        }
    };

    const handleMention = (member) => {
        if (member?.name) {
            const beforeCursor = newComment.substring(0, mentionPosition);
            const afterCursor = newComment.substring(mentionPosition);
            const newText = beforeCursor + `@${member.name} ` + afterCursor;
            setNewComment(newText);
            setShowMentions(false);
            inputRef.current?.focus();
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setNewComment(value);
        
        // Check for @ mentions
        const cursorPos = e.target.selectionStart;
        const textBeforeCursor = value.substring(0, cursorPos);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        
        if (lastAtIndex !== -1) {
            const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
            if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
                setShowMentions(true);
                setMentionPosition(lastAtIndex);
            } else {
                setShowMentions(false);
            }
        } else {
            setShowMentions(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddComment();
        }
    };

    return (
        <Card className="bg-background/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Comments
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Dynamic comments */}
                {comments.map((comment, index) => (
                    <div key={comment.id}>
                        <div className="flex gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={comment.user.avatar} />
                                <AvatarFallback>{comment.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">{comment.user.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(comment.timestamp).toLocaleString(undefined, {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            day: "numeric",
                                            month: "short",
                                        })}
                                    </span>
                                </div>
                                <p className="text-sm">{comment.content}</p>
                            </div>
                        </div>
                        {index < comments.length - 1 && <Separator className="mt-4" />}
                    </div>
                ))}

                {/* Add comment */}
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <Input
                            ref={inputRef}
                            placeholder="Add a comment... (use @ to mention someone)"
                            value={newComment}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            className="flex-1"
                        />
                        <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                    
                    {/* Mention dropdown */}
                    {showMentions && (
                        <div className="border rounded-lg bg-background shadow-lg p-2 max-h-32 overflow-y-auto">
                            <div className="text-xs text-muted-foreground mb-2">Mention someone:</div>
                            {teamMembers.slice(0, 5).map((member) => (
                                <Button
                                    key={member?.id || Math.random()}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-full justify-start"
                                    onClick={() => handleMention(member)}
                                >
                                    <AtSign className="h-3 w-3 mr-2" />
                                    {member?.name || 'Unknown'}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default TaskComments;
