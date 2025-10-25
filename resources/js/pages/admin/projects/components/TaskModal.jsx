import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FileText, Edit, Share2, Plus, X, Pin, PinOff, MessageSquare, Paperclip, CheckSquare, Calendar, User, Tag, CheckCircle, Clock, AlertCircle, MoreHorizontal, Eye, Trash2, AtSign, Star, Flag, Zap, UploadCloud, Download } from 'lucide-react';
import { useForm, router } from '@inertiajs/react';

// Helper component for sidebar buttons
const SidebarButton = ({ icon: Icon, label, onClick, isActive = false }) => (
    <Button
        onClick={onClick}
        variant="ghost"
        className={`w-full justify-start text-sm ${isActive ? 'bg-alpha/20 text-alpha hover:bg-alpha/30' : 'bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300 hover:text-white'}`}
    >
        <Icon className="h-4 w-4 mr-2" />
        {label}
    </Button>
);

// Helper component for member popover
const MemberPopover = ({ teamMembers = [], selectedAssignees = [], onToggleAssignee, onClose }) => {
    const [search, setSearch] = useState('');
    const filteredMembers = teamMembers.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="absolute z-20 w-72 bg-zinc-800 shadow-lg rounded-md border border-zinc-700 p-3 top-0 left-full ml-2">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-400">Members</span>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-700">
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <Input
                placeholder="Search members"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 mb-2"
            />
            <ScrollArea className="h-48">
                <div className="space-y-1">
                    <span className="text-xs font-semibold text-zinc-400 block px-1 py-1">Board members</span>
                    {filteredMembers.map(member => {
                        const isSelected = selectedAssignees.includes(member.id);
                        return (
                            <div
                                key={member.id}
                                onClick={() => onToggleAssignee(member.id)}
                                className="flex items-center justify-between p-2 rounded-md hover:bg-zinc-700 cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-7 w-7">
                                        <AvatarImage src={member.image ? `/storage/${member.image}` : null} alt={member.name} />
                                        <AvatarFallback className="text-xs bg-zinc-600 text-white">{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm text-white">{member.name}</span>
                                </div>
                                {isSelected && <CheckCircle className="h-4 w-4 text-alpha" />}
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
};

// Helper component for attachment popover
const AttachPopover = ({ onClose, onFileUpload }) => {
    const [fileInput, setFileInput] = useState(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            onFileUpload(files);
            onClose();
        }
    };

    return (
        <div className="absolute z-20 w-72 bg-zinc-800 shadow-lg rounded-md border border-zinc-700 p-3 top-0 left-full ml-2">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-400">Attach</span>
                <Button onClick={onClose} variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-700">
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <div className="space-y-2">
                <Button
                    variant="ghost"
                    onClick={() => fileInput?.click()}
                    className="w-full justify-start text-sm bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                >
                    <UploadCloud className="h-4 w-4 mr-2" />
                    Attach a file from your computer
                </Button>
                <input
                    ref={setFileInput}
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                />
                <Input
                    placeholder="Search or paste a link"
                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                />
            </div>
        </div>
    );
};

const TaskModal = ({
    isOpen,
    onClose,
    selectedTask,
    teamMembers = [],
    onUpdateTask
}) => {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [isEditingPriority, setIsEditingPriority] = useState(false);
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [newSubtask, setNewSubtask] = useState('');
    const [newTag, setNewTag] = useState('');
    const [showSubtasks, setShowSubtasks] = useState(true);
    const [showAttachments, setShowAttachments] = useState(true);
    const [showMembersPopover, setShowMembersPopover] = useState(false);
    const [showAttachPopover, setShowAttachPopover] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const { data: taskData, setData: setTaskData, put: updateTask, processing: isUpdating, reset } = useForm({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        assignees: [],
        subtasks: [],
        tags: [],
        attachments: [],
        comments: [],
        is_pinned: false,
        progress: 0,
        due_date: ''
    });

    // Update form data when selectedTask changes
    useEffect(() => {
        if (selectedTask) {
            setTaskData({
                title: selectedTask.title || '',
                description: selectedTask.description || '',
                priority: selectedTask.priority || 'medium',
                status: selectedTask.status || 'todo',
                assignees: selectedTask.assignees?.map(a => a.id) || [],
                subtasks: selectedTask.subtasks || [],
                tags: selectedTask.tags || [],
                attachments: selectedTask.attachments || [],
                comments: selectedTask.comments || [],
                is_pinned: selectedTask.is_pinned || false,
                progress: selectedTask.progress || 0,
                due_date: selectedTask.due_date || ''
            });
            // Ensure subtasks are shown if they exist
            if (selectedTask.subtasks?.length > 0) {
                setShowSubtasks(true);
            }
        }
    }, [selectedTask]);

    if (!selectedTask) return null;

    // Priority and Status helpers
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
            default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'urgent': return <Zap className="h-3 w-3" />;
            case 'high': return <Flag className="h-3 w-3" />;
            case 'medium': return <Star className="h-3 w-3" />;
            case 'low': return <CheckCircle className="h-3 w-3" />;
            default: return <Star className="h-3 w-3" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'review': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'todo': return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
            default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle className="h-3 w-3" />;
            case 'in_progress': return <Clock className="h-3 w-3" />;
            case 'review': return <AlertCircle className="h-3 w-3" />;
            case 'todo': return <CheckSquare className="h-3 w-3" />;
            default: return <CheckSquare className="h-3 w-3" />;
        }
    };

    // Update handlers
    const handleUpdateTitle = () => {
        if (taskData.title === selectedTask.title) {
            setIsEditingTitle(false);
            return;
        }
        router.put(`/admin/tasks/${selectedTask.id}`, {
            title: taskData.title
        }, {
            onSuccess: () => {
                setIsEditingTitle(false);
                onUpdateTask?.();
            }
        });
    };

    const handleUpdateDescription = () => {
        router.put(`/admin/tasks/${selectedTask.id}`, {
            description: taskData.description
        }, {
            onSuccess: () => {
                setIsEditingDescription(false);
                onUpdateTask?.();
            }
        });
    };

    const handleUpdatePriority = (priority) => {
        setTaskData('priority', priority);
        router.put(`/admin/tasks/${selectedTask.id}`, {
            priority: priority
        }, {
            onSuccess: () => {
                setIsEditingPriority(false);
                onUpdateTask?.();
            }
        });
    };

    const handleUpdateStatus = (status) => {
        setTaskData('status', status);
        router.put(`/admin/tasks/${selectedTask.id}`, {
            status: status
        }, {
            onSuccess: () => {
                setIsEditingStatus(false);
                onUpdateTask?.();
            }
        });
    };

    const handleToggleAssignee = (memberId) => {
        const currentAssignees = taskData.assignees;
        const newAssignees = currentAssignees.includes(memberId)
            ? currentAssignees.filter(id => id !== memberId)
            : [...currentAssignees, memberId];

        setTaskData('assignees', newAssignees);

        router.put(`/admin/tasks/${selectedTask.id}`, {
            assignees: newAssignees
        }, {
            onSuccess: () => {
                onUpdateTask?.();
            }
        });
    };

    const handleTogglePin = () => {
        const newPinnedState = !taskData.is_pinned;
        setTaskData('is_pinned', newPinnedState);

        router.post(`/admin/tasks/${selectedTask.id}/pin`, {}, {
            onSuccess: () => {
                onUpdateTask?.();
            }
        });
    };

    const handleShare = () => {
        const taskUrl = `${window.location.origin}/admin/projects/${selectedTask.project_id}/tasks/${selectedTask.id}`;
        navigator.clipboard.writeText(taskUrl).then(() => {
            // You could add a toast notification here
            console.log('Task URL copied to clipboard');
        });
    };

    // Comment handlers
    const handleAddComment = () => {
        if (!newComment.trim()) return;

        router.post(`/admin/tasks/${selectedTask.id}/comments`, {
            content: newComment
        }, {
            onSuccess: () => {
                setNewComment('');
                onUpdateTask?.();
            }
        });
    };

    // Subtask handlers
    const handleAddSubtask = () => {
        if (!newSubtask.trim()) return;

        router.post(`/admin/tasks/${selectedTask.id}/subtasks`, {
            title: newSubtask
        }, {
            onSuccess: () => {
                setNewSubtask('');
                onUpdateTask?.();
            }
        });
    };

    const handleToggleSubtask = (subtaskId) => {
        router.put(`/admin/tasks/${selectedTask.id}/subtasks`, {
            subtask_id: subtaskId
        }, {
            onSuccess: () => {
                onUpdateTask?.();
            }
        });
    };

    const handleDeleteSubtask = (subtaskId) => {
        router.delete(`/admin/tasks/${selectedTask.id}/subtasks`, {
            data: { subtask_id: subtaskId }
        }, {
            onSuccess: () => {
                onUpdateTask?.();
            }
        });
    };

    const getSubtaskProgress = () => {
        if (!selectedTask.subtasks || selectedTask.subtasks.length === 0) return 0;
        const completed = selectedTask.subtasks.filter(s => s.completed).length;
        return Math.round((completed / selectedTask.subtasks.length) * 100);
    };

    // Tag handlers
    const handleAddTag = () => {
        if (!newTag.trim() || taskData.tags.includes(newTag.trim())) return;

        const newTags = [...taskData.tags, newTag.trim()];
        setTaskData('tags', newTags);

        router.put(`/admin/tasks/${selectedTask.id}`, {
            tags: newTags
        }, {
            onSuccess: () => {
                setNewTag('');
                onUpdateTask?.();
            }
        });
    };

    const handleRemoveTag = (tagToRemove) => {
        const newTags = taskData.tags.filter(tag => tag !== tagToRemove);
        setTaskData('tags', newTags);

        router.put(`/admin/tasks/${selectedTask.id}`, {
            tags: newTags
        }, {
            onSuccess: () => {
                onUpdateTask?.();
            }
        });
    };

    // File upload handlers
    const handleFileUpload = (files) => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('attachments[]', file);
        });

        router.post(`/admin/tasks/${selectedTask.id}/attachments`, formData, {
            forceFormData: true,
            onSuccess: () => {
                onUpdateTask?.();
            }
        });
    };

    const handleRemoveAttachment = (attachmentId) => {
        router.delete(`/admin/tasks/${selectedTask.id}/attachments/${attachmentId}`, {}, {
            onSuccess: () => {
                onUpdateTask?.();
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!max-w-4xl max-h-[90vh] !w-[90vw] p-0 bg-light dark:bg-dark border-zinc-700 shadow-2xl rounded-lg">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-700">
                    <div className="flex items-center gap-3">
                        {/* Status */}
                        <div className="flex items-center gap-2">
                            {getStatusIcon(taskData.status)}
                            <span className={`text-sm font-medium ${getStatusColor(taskData.status).split(' ')[1]}`}>
                                {isEditingStatus ? (
                                    <Select value={taskData.status} onValueChange={handleUpdateStatus}>
                                        <SelectTrigger className="w-24 h-6 bg-transparent border-none text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todo">To Do</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="review">Review</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <span onClick={() => setIsEditingStatus(true)} className="cursor-pointer">
                                        {taskData.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                )}
                            </span>
                        </div>

                        {/* Priority */}
                        <div className="flex items-center gap-2">
                            {getPriorityIcon(taskData.priority)}
                            {isEditingPriority ? (
                                <Select value={taskData.priority} onValueChange={handleUpdatePriority}>
                                    <SelectTrigger className="w-20 h-6 bg-transparent border-none text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <span onClick={() => setIsEditingPriority(true)} className="cursor-pointer text-sm font-medium">
                                    {taskData.priority.toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={handleTogglePin} className="text-zinc-400 hover:text-white hover:bg-zinc-700">
                            {taskData.is_pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleShare} className="text-zinc-400 hover:text-white hover:bg-zinc-700">
                            <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400 hover:text-white hover:bg-zinc-700">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex h-[75vh] bg-dark">
                    {/* Left Column */}
                    <div className="flex-1 bg-dark py-6 pl-6 space-y-6">
                        <ScrollArea className="h-full pr-4">
                            {/* Task Title */}
                            <div className="mb-6">
                                {isEditingTitle ? (
                                    <div className="space-y-2">
                                        <Input
                                            value={taskData.title}
                                            onChange={(e) => setTaskData('title', e.target.value)}
                                            onBlur={handleUpdateTitle}
                                            onKeyPress={(e) => e.key === 'Enter' && handleUpdateTitle()}
                                            autoFocus
                                            className="text-2xl font-bold bg-transparent border-none text-white focus-visible:ring-alpha focus-visible:ring-2"
                                        />
                                        <div className="flex items-center gap-2">
                                            <Button
                                                onClick={handleUpdateTitle}
                                                disabled={isUpdating}
                                                className="bg-alpha hover:bg-alpha/90 text-white"
                                            >
                                                {isUpdating ? 'Saving...' : 'Save'}
                                            </Button>
                                            <Button variant="ghost" onClick={() => setIsEditingTitle(false)} className="text-zinc-300 hover:text-white hover:bg-zinc-700">
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <h1
                                        onClick={() => setIsEditingTitle(true)}
                                        className="text-2xl font-bold text-white cursor-pointer hover:bg-zinc-800/50 px-3 py-2 rounded-lg transition-colors"
                                    >
                                        {selectedTask.title}
                                    </h1>
                                )}
                            </div>

                            {/* Description */}
                            <div className="mb-8">
                                {isEditingDescription ? (
                                    <div className="space-y-3">
                                        <Textarea
                                            value={taskData.description}
                                            onChange={(e) => setTaskData('description', e.target.value)}
                                            placeholder="Add a more detailed description..."
                                            rows={5}
                                            className="bg-zinc-900/50 border-zinc-600 text-white placeholder:text-zinc-400 focus-visible:ring-alpha focus-visible:ring-2"
                                        />
                                        <div className="flex items-center gap-2">
                                            <Button
                                                onClick={handleUpdateDescription}
                                                disabled={isUpdating}
                                                className="bg-alpha hover:bg-alpha/90 text-white"
                                            >
                                                {isUpdating ? 'Saving...' : 'Save'}
                                            </Button>
                                            <Button variant="ghost" onClick={() => setIsEditingDescription(false)} className="text-zinc-300 hover:text-white hover:bg-zinc-700">
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => setIsEditingDescription(true)}
                                        className="p-4 bg-zinc-800/30 rounded-lg min-h-[100px] cursor-pointer hover:bg-zinc-800/50 transition-colors border border-zinc-700/50"
                                    >
                                        {selectedTask.description ? (
                                            <p className="text-zinc-200 leading-relaxed">{selectedTask.description}</p>
                                        ) : (
                                            <p className="text-zinc-400 italic">Add a more detailed description...</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Checklist - Enhanced Design */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <CheckSquare className="h-5 w-5 text-zinc-300" />
                                        <h3 className="text-lg font-semibold text-zinc-200">Checklist</h3>
                                        <span className="text-sm text-zinc-400">({getSubtaskProgress()}% complete)</span>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setShowSubtasks(!showSubtasks)} className="text-zinc-400 hover:text-white text-sm">
                                        {showSubtasks ? 'Hide' : 'Show'}
                                    </Button>
                                </div>
                                
                                {showSubtasks && (
                                    <div className="space-y-3">
                                        {/* Add New Subtask - At Top */}
                                        <div className=" flex justify-start  gap-3  ">
                                            {/* <Checkbox disabled className="opacity-40" /> */}
                                            <Input
                                                value={newSubtask}
                                                onChange={(e) => setNewSubtask(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                                                placeholder="Add an item"
                                                className="flex-1  bg-zinc-800/40 w-full border-zinc-600 text-white placeholder:text-zinc-400 focus-visible:ring-alpha focus-visible:ring-2"
                                            />
                                            <Button onClick={handleAddSubtask} className="bg-alpha hover:bg-alpha/90 ">
                                                Add
                                            </Button>
                                        </div>
                                        
                                        {/* Progress Bar */}
                                        <div className="mb-4">
                                            <Progress value={getSubtaskProgress()} className="h-2 bg-zinc-700/30" indicatorClassName="bg-alpha" />
                                        </div>
                                        
                                        {/* Subtasks List */}
                                        <div className="space-y-2">
                                            {selectedTask.subtasks?.map(subtask => (
                                                <div key={subtask.id} className="flex  items-center gap-3 p-3 bg-zinc-800 hover:bg-zinc-800/40 rounded-lg group transition-colors border border-zinc-700/30">
                                                    <Checkbox
                                                        id={`subtask-${subtask.id}`}
                                                        checked={subtask.completed}
                                                        onCheckedChange={() => handleToggleSubtask(subtask.id)}
                                                        className="border-zinc-500 data-[state=checked]:bg-alpha data-[state=checked]:border-alpha"
                                                    />
                                                    <label
                                                        htmlFor={`subtask-${subtask.id}`}
                                                        className={`flex-1 text-sm cursor-pointer transition-colors ${subtask.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}`}
                                                    >
                                                        {subtask.title}
                                                    </label>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteSubtask(subtask.id)}
                                                        className="h-6 w-6 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Attachments - Clean Box Design */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Paperclip className="h-4 w-4 text-zinc-400" />
                                        <h3 className="text-sm font-medium text-zinc-300">Attachments</h3>
                                        <span className="text-xs text-zinc-500">({selectedTask.attachments?.length || 0})</span>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setShowAttachments(!showAttachments)} className="text-zinc-400 hover:text-white text-xs">
                                        {showAttachments ? 'Hide' : 'Show'}
                                    </Button>
                                </div>
                                
                                {showAttachments && (
                                    <div className="space-y-3">
                                        {selectedTask.attachments?.length > 0 ? (
                                            selectedTask.attachments.map(attachment => (
                                                <div key={attachment.id} className="flex items-center justify-between p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:bg-zinc-700/50 group transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-zinc-700 rounded-md">
                                                            <Paperclip className="h-4 w-4 text-zinc-400" />
                                                        </div>
                                                        <div>
                                                            <a
                                                                href={`/storage/${attachment.path}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm text-zinc-200 hover:text-white transition-colors"
                                                            >
                                                                {attachment.name}
                                                            </a>
                                                            <p className="text-xs text-zinc-500 mt-1">
                                                                {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            onClick={() => window.open(`/storage/${attachment.path}`, '_blank')}
                                                            className="h-8 w-8 text-zinc-400 hover:text-white"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleRemoveAttachment(attachment.id)}
                                                            className="h-8 w-8 text-zinc-400 hover:text-red-400"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center p-8 border-2 border-dashed border-zinc-700 rounded-lg bg-zinc-800/30">
                                                <UploadCloud className="h-8 w-8 mx-auto mb-3 text-zinc-500" />
                                                <p className="text-sm text-zinc-400 mb-2">No attachments yet</p>
                                                <p className="text-xs text-zinc-500">Drag and drop files here or click to upload</p>
                                            </div>
                                        )}
                                        
                                        {/* Upload Button */}
                                        <div className="pt-2">
                                            <input
                                                type="file"
                                                multiple
                                                onChange={(e) => handleFileUpload(Array.from(e.target.files))}
                                                className="hidden"
                                                id="file-upload"
                                            />
                                            <label
                                                htmlFor="file-upload"
                                                className="inline-flex items-center px-4 py-2 border border-zinc-700 text-sm font-medium rounded-md text-zinc-300 hover:text-white hover:bg-zinc-700 cursor-pointer transition-colors"
                                            >
                                                <UploadCloud className="h-4 w-4 mr-2" />
                                                Upload Files
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </ScrollArea>
                    </div>

                    {/* Right Column */}
                    <div className="w-1/3 p-3 pt-0 space-y-4 border- border-zinc-700 bg-dark rounded-lg">
                        {/* Action Buttons */}
                        <div className="space-y-2 pt-6 sticky top-0">
                            <div className="relative">

                                {/* Members */}
                                <div className="mb-6">
                                    <h3 className="text-xs font-semibold text-zinc-400 mb-2">Members</h3>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {selectedTask.assignees?.map(assignee => (
                                            <Avatar key={assignee.id} className="h-8 w-8 cursor-pointer">
                                                <AvatarImage src={assignee.image ? `/storage/${assignee.image}` : null} alt={assignee.name} />
                                                <AvatarFallback className="text-xs bg-zinc-600 text-white">{assignee.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                        ))}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setShowMembersPopover(true)}
                                            className="h-8 w-8 bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-full"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>

                                        {showMembersPopover && (
                                            <MemberPopover
                                                teamMembers={teamMembers}
                                                selectedAssignees={taskData.assignees}
                                                onToggleAssignee={handleToggleAssignee}
                                                onClose={() => setShowMembersPopover(false)}
                                            />
                                        )}
                                    </div>
                                </div>

                                {showMembersPopover && (
                                    <MemberPopover
                                        teamMembers={teamMembers}
                                        selectedAssignees={taskData.assignees}
                                        onToggleAssignee={handleToggleAssignee}
                                        onClose={() => setShowMembersPopover(false)}
                                    />
                                )}
                            </div>

                        </div>

                        {/* Comments & Activity */}
                        <div className="">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-zinc-300/80">Comments</h3>
                      
                            </div>

                            {/* New Comment Input */}
                            <div className="mb-4">
                                <Textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment..."
                                    rows={3}
                                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-alpha"
                                />
                                {newComment && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <Button onClick={handleAddComment} className="bg-alpha hover:bg-alpha/90 text-white">
                                            Save
                                        </Button>
                                        <Button variant="ghost" onClick={() => setNewComment('')} className="text-zinc-300 hover:text-white hover:bg-zinc-700">
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Activity Feed */}
                            <ScrollArea className="h-[calc(75vh-300px)]">
                                <div className="space-y-4">
                                    {selectedTask.comments?.map(comment => (
                                        <div key={comment.id} className="flex gap-2">
                                            <Avatar className="h-7 w-7 mt-1">
                                                <AvatarImage src={comment.user?.image ? `/storage/${comment.user.image}` : null} alt={comment.user?.name} />
                                                <AvatarFallback className="text-xs bg-zinc-600 text-white">{comment.user?.name?.slice(0, 2).toUpperCase() || '??'}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-sm font-medium text-white">{comment.user?.name || 'Unknown'}</span>
                                                    <span className="text-xs text-zinc-500">{new Date(comment.created_at).toLocaleTimeString()}</span>
                                                </div>
                                                <div className="p-2 bg-zinc-700 rounded-md shadow-sm">
                                                    <p className="text-sm text-zinc-200">{comment.content}</p>
                                                </div>
                                                <div className="flex gap-1 mt-1">
                                                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white text-xs h-6 px-1">Reply</Button>
                                                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white text-xs h-6 px-1">Edit</Button>
                                                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-red-400 text-xs h-6 px-1">Delete</Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                           
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
};

export default TaskModal;