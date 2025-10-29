import ConfirmationModal from '@/components/ConfirmationModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { router, useForm, usePage } from '@inertiajs/react';
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';
import {
    AlertCircle,
    Archive,
    CheckCircle,
    CheckSquare,
    Clock,
    Download,
    Edit,
    File,
    FileArchive,
    FileAudio,
    FileCode,
    FileSpreadsheet,
    FileText,
    FileVideo,
    Flag,
    Image,
    MoreHorizontal,
    Paperclip,
    Pin,
    PinOff,
    Plus,
    Share2,
    Star,
    Trash2,
    UploadCloud,
    X,
    Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Helper to get file icon based on type
const getFileIcon = (mimeType, fileName) => {
    if (mimeType.startsWith('image/')) return <Image className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
    if (mimeType.startsWith('video/')) return <FileVideo className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
    if (mimeType.startsWith('audio/')) return <FileAudio className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
    if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel'))
        return <FileSpreadsheet className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
    if (mimeType.includes('text')) return <FileCode className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
    if (mimeType.includes('zip') || mimeType.includes('archive')) return <FileArchive className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;

    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'bmp':
            return <Image className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
        case 'mp4':
        case 'avi':
        case 'mov':
            return <FileVideo className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
        case 'mp3':
        case 'wav':
            return <FileAudio className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
        case 'pdf':
            return <FileText className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
        case 'xls':
        case 'xlsx':
        case 'csv':
            return <FileSpreadsheet className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
        case 'js':
        case 'ts':
        case 'jsx':
        case 'tsx':
        case 'html':
        case 'css':
        case 'json':
        case 'php':
            return <FileCode className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
        case 'zip':
        case 'rar':
        case '7z':
            return <FileArchive className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
        default:
            return <File className="h-5 w-5 text-dark/60 dark:text-zinc-400" />;
    }
};

// Helper to format relative time
const formatRelativeTime = (dateString) => {
    const date = parseISO(dateString);
    if (isToday(date)) {
        return formatDistanceToNow(date, { addSuffix: true });
    } else if (isYesterday(date)) {
        return 'Yesterday at ' + format(date, 'HH:mm');
    } else if (Date.now() - date.getTime() < 2 * 24 * 60 * 60 * 1000) {
        // Less than 2 days ago
        return formatDistanceToNow(date, { addSuffix: true });
    } else {
        return format(date, 'd/M/y HH:mm');
    }
};

// Helper component for sidebar buttons
const SidebarButton = ({ icon: Icon, label, onClick, isActive = false }) => (
    <Button
        onClick={onClick}
        variant="ghost"
        className={`w-full justify-start text-sm ${isActive ? 'bg-alpha/20 text-alpha hover:bg-alpha/30' : 'bg-zinc-700/50 text-zinc-300 hover:bg-zinc-700 hover:text-white'}`}
    >
        <Icon className="mr-2 h-4 w-4" />
        {label}
    </Button>
);

// Helper component for member popover
const MemberPopover = ({ teamMembers = [], selectedAssignees = [], onToggleAssignee, onClose }) => {
    const [search, setSearch] = useState('');
    const filteredMembers = teamMembers.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="absolute top-0 left-full z-20 ml-2 w-72 rounded-md border border-zinc-700 bg-zinc-800 p-3 shadow-lg">
            <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-400">Members</span>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 text-zinc-400 hover:bg-zinc-700 hover:text-white">
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <Input
                placeholder="Search members"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-2 border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-500"
            />
            <ScrollArea className="h-48">
                <div className="space-y-1">
                    <span className="block px-1 py-1 text-xs font-semibold text-zinc-400">Board members</span>
                    {filteredMembers.map((member) => {
                        const isSelected = selectedAssignees.includes(member.id);
                        return (
                            <div
                                key={member.id}
                                onClick={() => onToggleAssignee(member.id)}
                                className="flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-zinc-700"
                            >
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-7 w-7">
                                        <AvatarImage src={member.image ? `/storage/${member.image}` : null} alt={member.name} />
                                        <AvatarFallback className="bg-zinc-600 text-xs text-white">
                                            {member.name.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
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
        <div className="absolute top-0 left-full z-20 ml-2 w-72 rounded-md border border-zinc-700 bg-zinc-800 p-3 shadow-lg">
            <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-400">Attach</span>
                <Button onClick={onClose} variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:bg-zinc-700 hover:text-white">
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <div className="space-y-2">
                <Button
                    variant="ghost"
                    onClick={() => fileInput?.click()}
                    className="w-full justify-start bg-zinc-700/50 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white"
                >
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Attach a file from your computer
                </Button>
                <input ref={setFileInput} type="file" multiple onChange={handleFileChange} className="hidden" />
                <Input placeholder="Search or paste a link" className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-500" />
            </div>
        </div>
    );
};

const TaskModal = ({ projectId, setSelectedTask, isOpen, onClose, selectedTask, teamMembers = [], onUpdateTask, focusCommentInput = false }) => {
    const commentInputRef = useRef(null);
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
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingComment, setEditingComment] = useState(null);
    const [editingSubtask, setEditingSubtask] = useState(null);
    const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');
    const [isConfirmCommentDeleteModalOpen, setIsConfirmCommentDeleteModalOpen] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);
    const [isConfirmTaskArchiveModalOpen, setIsConfirmTaskArchiveModalOpen] = useState(false);
    const [isConfirmTaskDeleteModalOpen, setIsConfirmTaskDeleteModalOpen] = useState(false);
    const [taskToActOn, setTaskToActOn] = useState(null);

    const {
        data: taskData,
        setData: setTaskData,
        put: updateTask,
        processing: isUpdating,
        reset,
    } = useForm({
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
        due_date: '',
    });

    const { auth } = usePage().props;

    // Update form data when selectedTask changes
    useEffect(() => {
        if (selectedTask) {
            setTaskData({
                title: selectedTask.title || '',
                description: selectedTask.description || '',
                priority: selectedTask.priority || 'medium',
                status: selectedTask.status || 'todo',
                assignees: selectedTask.assignees?.map((a) => a.id) || [],
                subtasks: selectedTask.subtasks || [],
                tags: selectedTask.tags || [],
                attachments: selectedTask.attachments || [],
                comments: selectedTask.comments || [],
                is_pinned: selectedTask.is_pinned || false,
                progress: selectedTask.progress || 0,
                due_date: selectedTask.due_date || '',
            });
            // Ensure subtasks are shown if they exist
            if (selectedTask.subtasks?.length > 0) {
                setShowSubtasks(true);
            }
        }
    }, [selectedTask]);

    useEffect(() => {
        if (isOpen && focusCommentInput && commentInputRef.current) {
            commentInputRef.current.focus();
        }
    }, [isOpen, focusCommentInput]);

    const updateTaskData = (data) => {
        setTaskData(data);
    };

    const updateSelectedTask = (data) => {
        setSelectedTask(data);
    };

    if (!selectedTask) return null;

    // Priority and Status helpers
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'high':
                return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'medium':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'low':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            default:
                return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'urgent':
                return <Zap className="h-3 w-3" />;
            case 'high':
                return <Flag className="h-3 w-3" />;
            case 'medium':
                return <Star className="h-3 w-3" />;
            case 'low':
                return <CheckCircle className="h-3 w-3" />;
            default:
                return <Star className="h-3 w-3" />;
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300';
            case 'in_progress':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
            case 'review':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
            case 'todo':
                return 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300';
            default:
                return 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300';
        }
    };

    const getPriorityBadgeClass = (priority) => {
        switch (priority) {
            case 'urgent':
                return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
            case 'high':
                return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
            case 'medium':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
            case 'low':
                return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300';
            default:
                return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-3 w-3" />;
            case 'in_progress':
                return <Clock className="h-3 w-3" />;
            case 'review':
                return <AlertCircle className="h-3 w-3" />;
            case 'todo':
                return <CheckSquare className="h-3 w-3" />;
            default:
                return <CheckSquare className="h-3 w-3" />;
        }
    };

    // Update handlers
    const handleUpdateTitle = () => {
        if (taskData.title === selectedTask.title) {
            setIsEditingTitle(false);
            return;
        }
        router.patch(
            `/admin/tasks/${selectedTask.id}/title`,
            {
                title: taskData.title,
            },
            {
                onSuccess: () => {
                    updateTask();
                    setIsEditingTitle(false);
                    onUpdateTask?.();
                },
            },
        );
    };

    const handleUpdateDescription = () => {
        router.patch(
            `/admin/tasks/${selectedTask.id}/description`,
            {
                description: taskData.description,
            },
            {
                onSuccess: () => {
                    updateTask();
                    setIsEditingDescription(false);
                    onUpdateTask?.();
                },
            },
        );
    };

    const handleUpdatePriority = (priority) => {
        setTaskData('priority', priority);
        router.patch(
            `/admin/tasks/${selectedTask.id}/priority`,
            {
                priority: priority,
            },
            {
                onSuccess: () => {
                    updateTask();
                    setIsEditingPriority(false);
                    onUpdateTask?.();
                },
            },
        );
    };

    const handleUpdateStatus = (status) => {
        if (status === 'completed') {
            const hasIncompleteSubtasks = (taskData.subtasks || []).some((subtask) => !subtask.completed);
            if (hasIncompleteSubtasks) {
                alert('Cannot mark task as complete. Please complete all subtasks first.'); // Will be replaced by modal
                return;
            }
        }

        setTaskData('status', status);
        router.patch(
            `/admin/tasks/${selectedTask.id}/status`,
            {
                status: status,
            },
            {
                onSuccess: () => {
                    updateTask();
                    setIsEditingStatus(false);
                    onUpdateTask?.();
                },
            },
        );
    };

    const handleToggleAssignee = (memberId) => {
        const currentAssignees = taskData.assignees;
        const newAssignees = currentAssignees.includes(memberId) ? currentAssignees.filter((id) => id !== memberId) : [...currentAssignees, memberId];

        setTaskData('assignees', newAssignees);

        router.patch(
            `/admin/tasks/${selectedTask.id}/assignees`,
            {
                assignees: newAssignees,
            },
            {
                onSuccess: () => {
                    updateTask();
                    onUpdateTask?.();
                },
            },
        );
    };

    const handleTogglePin = () => {
        const newPinnedState = !taskData.is_pinned;
        setTaskData('is_pinned', newPinnedState);

        router.post(
            `/admin/tasks/${selectedTask.id}/pin`,
            {},
            {
                onSuccess: () => {
                    updateTask();
                    onUpdateTask?.();
                },
            },
        );
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

        if (editingComment) {
            // Update existing comment
            const updatedComments = (taskData.comments || []).map((comment) =>
                comment.id === editingComment.id ? { ...comment, content: newComment, updated_at: new Date().toISOString() } : comment,
            );
            setTaskData('comments', updatedComments);
            setNewComment('');
            setEditingComment(null);

            // Send to backend
            router.put(
                `/admin/tasks/${selectedTask.id}/comments/${editingComment.id}`,
                {
                    content: newComment,
                },
                {
                    onSuccess: () => {
                        updateTask();
                    },
                },
            );
        } else {
            // Add new comment
            const newCommentItem = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                content: newComment,
                user_id: auth.user.id,
                user: { id: auth.user.id, name: auth.user.name, email: auth.user.email, image: auth.user.image },
                created_at: new Date().toISOString(),
            };

            // Update UI instantly
            setTaskData('comments', [...(taskData.comments || []), newCommentItem]);
            setNewComment('');

            // Send to backend
            router.post(
                `/admin/tasks/${selectedTask.id}/comments`,
                {
                    content: newComment,
                },
                {
                    onSuccess: () => {
                        updateTask();
                    },
                },
            );
        }
    };

    // Subtask handlers
    const handleAddSubtask = () => {
        if (!newSubtask.trim()) return;

        const newSubtaskItem = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            title: newSubtask,
            completed: false,
        };

        // Update UI instantly
        setTaskData('subtasks', [...(taskData.subtasks || []), newSubtaskItem]);
        setNewSubtask('');

        // Send to backend
        router.post(
            `/admin/tasks/${selectedTask.id}/subtasks`,
            {
                title: newSubtask,
            },
            {
                onSuccess: () => {
                    updateTask();
                },
            },
        );
    };

    const handleToggleSubtask = (subtaskId) => {
        // Update UI instantly
        const updatedSubtasks = (taskData.subtasks || []).map((subtask) =>
            subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask,
        );
        setTaskData('subtasks', updatedSubtasks);

        // Send to backend
        router.put(
            `/admin/tasks/${selectedTask.id}/subtasks`,
            {
                subtask_id: subtaskId,
                completed: updatedSubtasks.find((s) => s.id === subtaskId)?.completed,
            },
            {
                onSuccess: () => {
                    updateTask();
                },
            },
        );
    };

    const handleDeleteSubtask = (subtaskId) => {
        // Update UI instantly
        const updatedSubtasks = (taskData.subtasks || []).filter((subtask) => subtask.id !== subtaskId);
        setTaskData('subtasks', updatedSubtasks);

        // Send to backend
        router.delete(
            `/admin/tasks/${selectedTask.id}/subtasks`,
            {
                data: { subtask_id: subtaskId },
            },
            {
                onSuccess: () => {
                    updateTask();
                },
            },
        );
    };

    const handleEditSubtask = (subtask) => {
        setEditingSubtask(subtask);
        setEditingSubtaskTitle(subtask.title);
    };

    const handleUpdateSubtask = () => {
        if (!editingSubtaskTitle.trim()) return;

        // Update UI instantly
        const updatedSubtasks = (taskData.subtasks || []).map((subtask) =>
            subtask.id === editingSubtask.id ? { ...subtask, title: editingSubtaskTitle } : subtask,
        );
        setTaskData('subtasks', updatedSubtasks);
        setEditingSubtask(null);
        setEditingSubtaskTitle('');

        // Send to backend
        router.put(
            `/admin/tasks/${selectedTask.id}/subtasks`,
            {
                subtask_id: editingSubtask.id,
                title: editingSubtaskTitle,
            },
            {
                onSuccess: () => {
                    updateTask();
                },
            },
        );
    };

    const getSubtaskProgress = () => {
        if (!taskData.subtasks || taskData.subtasks.length === 0) return 0;
        const completed = taskData.subtasks.filter((s) => s.completed).length;
        return Math.round((completed / taskData.subtasks.length) * 100);
    };

    // Tag handlers
    const handleAddTag = () => {
        if (!newTag.trim() || taskData.tags.includes(newTag.trim())) return;

        const newTags = [...taskData.tags, newTag.trim()];
        setTaskData('tags', newTags);

        router.put(
            `/admin/tasks/${selectedTask.id}`,
            {
                tags: newTags,
            },
            {
                onSuccess: () => {
                    updateTask();
                    setNewTag('');
                    onUpdateTask?.();
                },
            },
        );
    };

    const handleRemoveTag = (tagToRemove) => {
        const newTags = taskData.tags.filter((tag) => tag !== tagToRemove);
        setTaskData('tags', newTags);

        router.put(
            `/admin/tasks/${selectedTask.id}`,
            {
                tags: newTags,
            },
            {
                onSuccess: () => {
                    updateTask();
                    onUpdateTask?.();
                },
            },
        );
    };

    // File upload handlers
    const handleFileUpload = (files) => {
        const newAttachments = Array.from(files).map((file) => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            type: file.type,
            path: URL.createObjectURL(file), // Temporary URL for preview
            uploaded_by: 1, // Current user ID
            uploaded_at: new Date().toISOString(),
        }));

        // Update UI instantly
        setTaskData('attachments', [...(taskData.attachments || []), ...newAttachments]);

        // Send to backend
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('file', file);
        });

        router.post(`/admin/tasks/${selectedTask.id}/attachments`, formData, {
            forceFormData: true,
            onSuccess: () => {
                updateTask();
            },
        });
    };

    const handleRemoveAttachment = (attachmentId) => {
        // Update UI instantly
        const updatedAttachments = (taskData.attachments || []).filter((attachment) => attachment.id !== attachmentId);
        setTaskData('attachments', updatedAttachments);

        // Send to backend
        router.delete(
            `/admin/tasks/${selectedTask.id}/attachments`,
            {
                data: { attachment_id: attachmentId },
            },
            {
                onSuccess: () => {
                    updateTask();
                },
            },
        );
    };

    const handleUserClick = (user) => {
        if (user) {
            setSelectedUser(user);
            setShowUserModal(true);
        }
    };

    const handleEditComment = (comment) => {
        setEditingComment(comment);
        setNewComment(comment.content);
    };

    const handleDeleteComment = (comment) => {
        setCommentToDelete(comment);
        setIsConfirmCommentDeleteModalOpen(true);
    };

    const confirmDeleteComment = () => {
        if (commentToDelete) {
            // Update UI instantly
            const updatedComments = (taskData.comments || []).filter((comment) => comment.id !== commentToDelete.id);
            setTaskData('comments', updatedComments);

            // Send to backend
            router.delete(
                `/admin/tasks/${selectedTask.id}/comments/${commentToDelete.id}`,
                {},
                {
                    onSuccess: () => {
                        updateTask();
                        setIsConfirmCommentDeleteModalOpen(false);
                        setCommentToDelete(null);
                    },
                    onError: () => {
                        setIsConfirmCommentDeleteModalOpen(false);
                        setCommentToDelete(null);
                        alert('Failed to delete comment.');
                    },
                },
            );
        }
    };

    const handleArchiveTask = () => {
        setTaskToActOn(selectedTask);
        setIsConfirmTaskArchiveModalOpen(true);
    };

    const confirmArchiveTask = () => {
        if (taskToActOn) {
            router.patch(
                `/admin/tasks/${taskToActOn.id}/status`,
                { status: 'archived' },
                {
                    onSuccess: () => {
                        updateTask();
                        onUpdateTask?.();
                        setIsConfirmTaskArchiveModalOpen(false);
                        setTaskToActOn(null);
                        onClose();
                    },
                    onError: () => {
                        setIsConfirmTaskArchiveModalOpen(false);
                        setTaskToActOn(null);
                        alert('Failed to archive task.');
                    },
                },
            );
        }
    };

    const handleDeleteTask = () => {
        setTaskToActOn(selectedTask);
        setIsConfirmTaskDeleteModalOpen(true);
    };

    const confirmDeleteTask = () => {
        if (taskToActOn) {
            router.delete(`/admin/tasks/${taskToActOn.id}`, {
                onSuccess: () => {
                    updateTask();
                    onUpdateTask?.();
                    setIsConfirmTaskDeleteModalOpen(false);
                    setTaskToActOn(null);
                    onClose();
                },
                onError: () => {
                    setIsConfirmTaskDeleteModalOpen(false);
                    setTaskToActOn(null);
                    alert('Failed to delete task.');
                },
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] !w-[90vw] !max-w-4xl rounded-lg border-border bg-background p-0 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border bg-light px-6 py-1 dark:bg-dark">
                    <div className="flex items-center gap-4">
                        {/* Status Badge */}
                        <div className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(taskData.status)}`}>
                            {getStatusIcon(taskData.status)}
                            {taskData.status.replace('_', ' ').toUpperCase()}
                        </div>

                        {/* Priority Badge */}
                        <div
                            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getPriorityBadgeClass(taskData.priority)}`}
                        >
                            {getPriorityIcon(taskData.priority)}
                            {taskData.priority.toUpperCase()}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={handleTogglePin} className="text-dark hover:bg-alpha/20 dark:text-light">
                            {taskData.is_pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleShare} className="text-dark hover:bg-alpha/20 dark:text-light">
                            <Share2 className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-dark hover:bg-alpha/20 dark:text-light">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleArchiveTask()}>
                                    <Archive className="mr-2 h-4 w-4" />
                                    Archive Task
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteTask()} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Task
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="ghost" size="icon" onClick={onClose} className="text-dark hover:bg-alpha/20 dark:text-light">
                            {/* <X className="h-5 w-5" /> */}
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex h-[75vh] bg-background">
                    {/* Left Column - Professional Elegant Design */}
                    <div className="flex-1 space-y-8 bg-gradient-to-br from-light via-light to-gray-50 py-8 pr-6 pl-8 dark:from-dark dark:via-dark dark:to-dark_gray">
                        <ScrollArea className="h-full pr-4">
                            {/* Task Title - Elegant Design */}
                            <div className="mb-10">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="h-6 w-1 rounded-full bg-gradient-to-b from-alpha to-alpha/60"></div>
                                    <label className="text-xs font-semibold tracking-wider text-dark/80 capitalize dark:text-light/80">
                                        Task Title
                                    </label>
                                </div>
                                {isEditingTitle ? (
                                    <div className="space-y-4 py-3">
                                        <Input
                                            value={taskData.title}
                                            onChange={(e) => setTaskData('title', e.target.value)}
                                            onBlur={handleUpdateTitle}
                                            onKeyPress={(e) => e.key === 'Enter' && handleUpdateTitle()}
                                            autoFocus
                                            className="rounded-xl border-alpha/40 bg-neutral-200 px-6 py-4 text-2xl font-bold text-dark focus-visible:ring-2 focus-visible:ring-alpha/50 dark:bg-neutral-800 dark:text-light"
                                        />
                                        <div className="flex items-center gap-3">
                                            <Button
                                                onClick={handleUpdateTitle}
                                                disabled={isUpdating}
                                                className="rounded-lg bg-gradient-to-r from-alpha to-alpha/80 px-6 py-2 font-semibold text-dark shadow-lg hover:from-alpha/90 hover:to-alpha/70"
                                            >
                                                {isUpdating ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => setIsEditingTitle(false)}
                                                className="rounded-lg px-6 py-2 text-dark/60 hover:bg-alpha/10 hover:text-dark dark:text-light/60 dark:hover:text-light"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => setIsEditingTitle(true)}
                                        className="group cursor-pointer rounded-xl border border-alpha/20 bg-neutral-200 px-6 py-2 backdrop-blur-sm transition-all duration-300 hover:border-alpha/40 hover:from-alpha/10 hover:to-alpha/5 dark:bg-neutral-800 dark:to-dark/40"
                                    >
                                        <h1 className="text-xl font-bold text-dark transition-colors group-hover:text-alpha dark:text-light">
                                            {selectedTask.title || 'Untitled Task'}
                                        </h1>
                                    </div>
                                )}
                            </div>

                            {/* Description - Elegant Design */}
                            <div className="mb-10">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="h-6 w-1 rounded-full bg-gradient-to-b from-alpha to-alpha/60"></div>
                                    <label className="text-xs font-semibold tracking-wider text-dark/80 capitalize dark:text-light/80">
                                        Description
                                    </label>
                                </div>
                                {isEditingDescription ? (
                                    <div className="space-y-4">
                                        <Textarea
                                            value={taskData.description}
                                            onChange={(e) => setTaskData('description', e.target.value)}
                                            placeholder="Add a more detailed description..."
                                            rows={5}
                                            className="resize-none rounded-xl border-alpha/40 bg-neutral-200 px-6 py-4 text-dark placeholder:text-dark/60 focus-visible:ring-2 focus-visible:ring-alpha dark:bg-neutral-800 dark:text-light dark:placeholder:text-light/60"
                                        />
                                        <div className="flex items-center gap-3">
                                            <Button
                                                onClick={handleUpdateDescription}
                                                disabled={isUpdating}
                                                className="rounded-lg bg-gradient-to-r from-alpha to-alpha/80 px-6 py-2 font-semibold text-dark shadow-lg hover:from-alpha/90 hover:to-alpha/70"
                                            >
                                                {isUpdating ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => setIsEditingDescription(false)}
                                                className="rounded-lg px-6 py-2 text-dark/60 hover:bg-alpha/10 hover:text-dark dark:text-light/60 dark:hover:text-light"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => setIsEditingDescription(true)}
                                        className="group min-h-[120px] cursor-pointer rounded-xl border border-alpha/20 bg-neutral-200 px-6 py-3 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-alpha/40 hover:from-alpha/10 hover:to-alpha/5 dark:bg-neutral-800 dark:from-dark/60 dark:to-dark/40"
                                    >
                                        {selectedTask.description ? (
                                            <p className="text-sm leading-relaxed text-dark transition-colors group-hover:text-alpha/90 dark:text-light/80">
                                                {selectedTask.description}
                                            </p>
                                        ) : (
                                            <p className="text-dark/60 italic transition-colors group-hover:text-dark/80 dark:text-light/60 dark:group-hover:text-light/80">
                                                Add a more detailed description...
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Checklist - Elegant Design */}
                            <div className="mb-10">
                                <div className="mb-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-6 w-1 rounded-full bg-gradient-to-b from-alpha to-alpha/60"></div>
                                            <CheckSquare className="h-5 w-5 text-alpha" />
                                            <h3 className="text-lg font-bold text-dark dark:text-light">Checklist</h3>
                                        </div>
                                        <div className="rounded-lg bg-dark/80 px-3 py-1 dark:bg-alpha/20">
                                            <span className="text-sm font-semibold text-alpha">{getSubtaskProgress()}% complete</span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowSubtasks(!showSubtasks)}
                                        className="rounded-lg px-4 py-2 text-sm text-dark/60 hover:bg-alpha/20 hover:text-dark dark:text-light/60 dark:hover:text-light"
                                    >
                                        {showSubtasks ? 'Hide' : 'Show'}
                                    </Button>
                                </div>

                                {showSubtasks && (
                                    <div className="space-y-4">
                                        {/* Add New Subtask - Elegant */}
                                        <div className="flex gap-4 rounded-xl border border-alpha/30 bg-gradient-to-r from-light/60 to-light/40 p-2 transition-all duration-300 hover:border-alpha/50 dark:from-dark/60 dark:to-dark/40">
                                            <Input
                                                value={newSubtask}
                                                onChange={(e) => setNewSubtask(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                                                placeholder="Add a new checklist item..."
                                                className="flex-1 rounded-lg border-0 bg-neutral-200 px-4 py-3 text-dark placeholder:text-dark/60 focus-visible:ring-2 focus-visible:ring-alpha dark:bg-neutral-800 dark:text-light dark:placeholder:text-light/60"
                                            />
                                            <Button
                                                onClick={handleAddSubtask}
                                                className="rounded-lg bg-gradient-to-r from-alpha to-alpha/80 px-6 py-3 font-semibold text-dark shadow-lg hover:from-alpha/90 hover:to-alpha/70"
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Item
                                            </Button>
                                        </div>

                                        {/* Progress Bar - Elegant */}
                                        <div className="mb-6">
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-sm font-medium text-dark/80 dark:text-light/80">Progress</span>
                                                <span className="text-sm font-bold text-alpha">{getSubtaskProgress()}%</span>
                                            </div>
                                            <Progress
                                                value={getSubtaskProgress()}
                                                className="h-2 overflow-hidden rounded-full bg-light/40 dark:bg-dark/40"
                                                indicatorClassName="bg-gradient-to-r from-alpha to-alpha/80 transition-all duration-500 ease-in-out"
                                            />
                                        </div>

                                        {/* Subtasks List - Elegant */}
                                        <div className="space-y-3">
                                            {(taskData.subtasks || []).map((subtask) => (
                                                <div
                                                    key={subtask.id}
                                                    className="group flex items-center gap-4 rounded-xl border border-alpha/20 bg-neutral-200/80 p-4 backdrop-blur-sm transition-all duration-300 hover:border-alpha/40 hover:from-alpha/10 hover:to-alpha/5 dark:bg-neutral-800/80 dark:from-dark/60 dark:to-dark/40"
                                                >
                                                    <Checkbox
                                                        id={`subtask-${subtask.id}`}
                                                        checked={subtask.completed}
                                                        onCheckedChange={() => handleToggleSubtask(subtask.id)}
                                                        className="h-5 w-5 rounded-md border-alpha/40 data-[state=checked]:border-alpha data-[state=checked]:bg-alpha"
                                                    />
                                                    {editingSubtask?.id === subtask.id ? (
                                                        <div className="flex flex-1 items-center gap-3">
                                                            <Input
                                                                value={editingSubtaskTitle}
                                                                onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                                                                onKeyPress={(e) => e.key === 'Enter' && handleUpdateSubtask()}
                                                                onBlur={handleUpdateSubtask}
                                                                autoFocus
                                                                className="flex-1 rounded-lg border-alpha/40 bg-neutral-200 px-4 py-2 text-dark focus-visible:ring-2 focus-visible:ring-alpha dark:bg-neutral-800 dark:text-light"
                                                            />
                                                            <Button
                                                                size="sm"
                                                                onClick={handleUpdateSubtask}
                                                                className="rounded-lg bg-gradient-to-r from-alpha to-alpha/80 px-4 py-2 font-semibold text-dark hover:from-alpha/90 hover:to-alpha/70"
                                                            >
                                                                Save
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setEditingSubtask(null);
                                                                    setEditingSubtaskTitle('');
                                                                }}
                                                                className="rounded-lg px-4 py-2 text-dark/60 hover:bg-alpha/10 hover:text-dark dark:text-light/60 dark:hover:text-light"
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <label
                                                                htmlFor={`subtask-${subtask.id}`}
                                                                className={`flex-1 cursor-pointer text-sm font-medium transition-colors ${subtask.completed ? 'text-dark/50 line-through dark:text-light/50' : 'text-dark group-hover:text-alpha/90 dark:text-light'}`}
                                                            >
                                                                {subtask.title}
                                                            </label>
                                                            <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleEditSubtask(subtask)}
                                                                    className="h-8 w-8 rounded-lg text-dark/60 hover:bg-alpha/20 hover:text-alpha dark:text-light/60"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleDeleteSubtask(subtask.id)}
                                                                    className="h-8 w-8 rounded-lg text-dark/60 hover:bg-error/20 hover:text-error dark:text-light/60"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Attachments - Elegant Design */}
                            <div className="mb-10">
                                <div className="mb-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-6 w-1 rounded-full bg-gradient-to-b from-alpha to-alpha/60"></div>
                                            <Paperclip className="h-5 w-5 text-alpha" />
                                            <h3 className="text-lg font-bold text-dark dark:text-light">Attachments</h3>
                                        </div>
                                        <div className="rounded-lg bg-dark/80 px-3 py-1 dark:bg-alpha/20">
                                            <span className="text-sm font-semibold text-alpha">{(taskData.attachments || []).length} files</span>
                                        </div>
                                    </div>
                                    {/* Upload Button */}
                                    <div className="rounded-lg border border-alpha/20">
                                        <input
                                            type="file"
                                            multiple
                                            onChange={(e) => handleFileUpload(Array.from(e.target.files))}
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className="inline-flex cursor-pointer items-center rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-neutral-800 transition-colors hover:bg-zinc-700 hover:text-white dark:text-light"
                                        >
                                            <UploadCloud className="mr-2 h-4 w-4" />
                                            Upload Files
                                        </label>
                                    </div>
                                    {/* <Button variant="ghost" size="sm" onClick={() => setShowAttachments(!showAttachments)} className="text-dark/60 dark:text-light/60 hover:text-dark dark:hover:text-light hover:bg-alpha/20 text-sm px-4 py-2 rounded-lg">
                                        {showAttachments ? 'Hide' : 'Show'}
                                    </Button> */}
                                </div>

                                {showAttachments && (
                                    <div className="space-y-3">
                                        {(taskData.attachments || []).length > 0 ? (
                                            (taskData.attachments || []).map((attachment) => (
                                                <div
                                                    key={attachment.id}
                                                    className="group flex items-center justify-between rounded-xl border border-alpha/20 bg-neutral-200/80 p-4 backdrop-blur-sm transition-all duration-300 hover:border-alpha/40 dark:bg-neutral-800/80 dark:from-dark/60 dark:to-dark/40"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="rounded-lg bg-light/30 p-3 dark:bg-zinc-700">
                                                            {getFileIcon(attachment.type, attachment.name)}
                                                        </div>
                                                        <div>
                                                            {attachment.type && attachment.type.startsWith('image/') ? (
                                                                <Popover>
                                                                    <PopoverTrigger asChild>
                                                                        <p className="cursor-pointer font-medium text-dark transition-colors hover:text-alpha dark:text-light">
                                                                            {attachment.name}
                                                                        </p>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-auto border-none bg-white p-0 shadow-none">
                                                                        <img
                                                                            src={`/storage/${attachment.path}`}
                                                                            alt={attachment.name}
                                                                            className="max-h-xs max-w-xs rounded-lg shadow-xl"
                                                                        />
                                                                    </PopoverContent>
                                                                </Popover>
                                                            ) : (
                                                                <p className="font-medium text-dark dark:text-light">{attachment.name}</p>
                                                            )}
                                                            <p className="text-xs text-dark/50 dark:text-zinc-400">
                                                                {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                                        <a
                                                            className="rounded-md p-2 text-dark/60 hover:bg-alpha/20 hover:text-alpha dark:text-alpha dark:hover:text-alpha"
                                                            download={true}
                                                            href={`/storage/${attachment.path}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <Download className="h-5 w-5" />
                                                        </a>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleRemoveAttachment(attachment.id)}
                                                            className="h-9 w-9 rounded-md text-dark/60 hover:bg-error/20 hover:text-error dark:text-red-400"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="group rounded-xl border-2 border-dashed border-alpha/30 bg-gradient-to-br from-light/40 to-light/20 py-16 text-center transition-all duration-300 hover:from-alpha/10 hover:to-alpha/5 dark:from-dark/40 dark:to-dark/20">
                                                <UploadCloud className="mx-auto mb-6 h-20 w-20 text-alpha/60 transition-colors group-hover:text-alpha" />
                                                <p className="mb-2 text-lg font-semibold text-dark/80 transition-colors group-hover:text-dark dark:text-light/80 dark:group-hover:text-light">
                                                    No attachments yet
                                                </p>
                                                <p className="mb-8 text-sm text-dark/50 transition-colors group-hover:text-dark/70 dark:text-light/50 dark:group-hover:text-light/70">
                                                    Drag and drop files here or click to upload
                                                </p>
                                                <Button
                                                    onClick={() => document.getElementById('file-upload').click()}
                                                    className="rounded-lg bg-gradient-to-r from-alpha to-alpha/80 px-8 py-3 font-semibold text-dark shadow-lg hover:from-alpha/90 hover:to-alpha/70"
                                                >
                                                    <UploadCloud className="mr-3 h-5 w-5" />
                                                    Upload Files
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Right Column */}
                    <div className="w-1/3 space-y-6 border-l border-alpha/20 bg-light p-6 dark:bg-dark">
                        {/* Action Buttons */}
                        <div className="sticky top-0 space-y-2 pt-6">
                            <div className="relative">
                                {/* Members */}
                                <div className="mb-6">
                                    <h3 className="mb-3 text-sm font-semibold text-dark dark:text-light">Members</h3>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {selectedTask.assignees?.map((assignee) => (
                                            <Avatar key={assignee.id} className="h-8 w-8 cursor-pointer" onClick={() => handleUserClick(assignee)}>
                                                <AvatarImage src={assignee.image ? `/storage/${assignee.image}` : null} alt={assignee.name} />
                                                <AvatarFallback className="bg-alpha/20 text-xs text-dark dark:text-light">
                                                    {assignee.name.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        ))}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setShowMembersPopover(true)}
                                            className="h-8 w-8 rounded-full bg-alpha/20 text-dark hover:bg-alpha/30 dark:text-light"
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
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-dark dark:text-light">Comments</h3>
                            </div>

                            {/* New Comment Input */}
                            <div className="mb-4">
                                <Textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment..."
                                    rows={3}
                                    className="border-alpha/20 bg-neutral-200 text-dark placeholder:text-dark/60 focus-visible:ring-alpha dark:bg-neutral-800 dark:text-light dark:placeholder:text-light/60"
                                />
                                {newComment && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <Button onClick={handleAddComment} className="bg-alpha text-dark hover:bg-alpha/90">
                                            {editingComment ? 'Update' : 'Save'}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => {
                                                setNewComment('');
                                                setEditingComment(null);
                                            }}
                                            className="text-dark hover:bg-alpha/20 dark:text-light"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Comments List */}
                            <ScrollArea className="h-[calc(75vh-300px)] pr-4">
                                <div className="space-y-4">
                                    {(taskData.comments || []).map((comment) => (
                                        <div
                                            key={comment.id}
                                            className="flex gap-4 rounded-xl border border-alpha/20 bg-light/80 p-4 shadow-sm dark:bg-neutral-800"
                                        >
                                            <Avatar className="h-8 w-8 cursor-pointer" onClick={() => handleUserClick(comment.user)}>
                                                <AvatarImage
                                                    src={comment.user?.image ? `/storage/${comment.user.image}` : null}
                                                    alt={comment.user?.name}
                                                />
                                                <AvatarFallback className="bg-alpha/20 text-xs text-dark dark:text-light">
                                                    {comment.user?.name?.slice(0, 2).toUpperCase() || '??'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="mb-1 flex items-center justify-between">
                                                    <div className="flex items-baseline gap-2">
                                                        <span
                                                            className="cursor-pointer text-sm font-semibold text-dark transition-colors hover:text-alpha dark:text-light"
                                                            onClick={() => handleUserClick(comment.user)}
                                                        >
                                                            {comment.user?.name === auth.user.name ? 'You' : comment.user?.name || 'Unknown User'}
                                                        </span>
                                                        <span className="text-xs text-dark/50 dark:text-light/50">
                                                            {formatRelativeTime(comment.created_at)}
                                                        </span>
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-dark/60 hover:bg-alpha/10 hover:text-dark dark:text-light/60 dark:hover:text-light"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleEditComment(comment)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                <span>Edit</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteComment(comment)}
                                                                className="text-red-600 dark:text-red-400"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                <span>Delete</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                                <p className="text-sm leading-relaxed text-dark/80 dark:text-light/80">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </DialogContent>

            {/* User Profile Dialog */}
            {showUserModal && selectedUser && (
                <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
                    <DialogContent className="max-w-md rounded-lg border-border bg-background shadow-lg dark:border-alpha/20 dark:bg-dark">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-dark dark:text-light">User Profile</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowUserModal(false)}
                                className="text-dark hover:bg-alpha/20 dark:text-light"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={selectedUser.image ? `/storage/${selectedUser.image}` : null} alt={selectedUser.name} />
                                    <AvatarFallback className="bg-alpha/20 text-lg text-dark dark:text-light">
                                        {selectedUser.name?.slice(0, 2).toUpperCase() || '??'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-lg font-semibold text-dark dark:text-light">{selectedUser.name}</h3>
                                    <p className="text-sm text-dark/60 dark:text-light/60">{selectedUser.email}</p>
                                    {selectedUser.role && (
                                        <Badge className="mt-1 border-alpha/30 bg-alpha/20 text-dark dark:text-light">{selectedUser.role}</Badge>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-dark dark:text-light">Email</label>
                                    <p className="text-sm text-dark/80 dark:text-light/80">{selectedUser.email}</p>
                                </div>

                                {selectedUser.phone && (
                                    <div>
                                        <label className="text-sm font-medium text-dark dark:text-light">Phone</label>
                                        <p className="text-sm text-dark/80 dark:text-light/80">{selectedUser.phone}</p>
                                    </div>
                                )}

                                {selectedUser.cin && (
                                    <div>
                                        <label className="text-sm font-medium text-dark dark:text-light">CIN</label>
                                        <p className="text-sm text-dark/80 dark:text-light/80">{selectedUser.cin}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Confirmation Modal for Comment Deletion */}
            <ConfirmationModal
                isOpen={isConfirmCommentDeleteModalOpen}
                onClose={() => setIsConfirmCommentDeleteModalOpen(false)}
                onConfirm={confirmDeleteComment}
                title="Confirm Comment Deletion"
                description="Are you sure you want to delete this comment? This action cannot be undone."
                isDestructive={true}
            />

            {/* Confirmation Modal for Task Archive */}
            <ConfirmationModal
                isOpen={isConfirmTaskArchiveModalOpen}
                onClose={() => setIsConfirmTaskArchiveModalOpen(false)}
                onConfirm={confirmArchiveTask}
                title="Confirm Task Archive"
                description="Are you sure you want to archive this task? This action cannot be undone."
                isDestructive={true}
            />

            {/* Confirmation Modal for Task Deletion */}
            <ConfirmationModal
                isOpen={isConfirmTaskDeleteModalOpen}
                onClose={() => setIsConfirmTaskDeleteModalOpen(false)}
                onConfirm={confirmDeleteTask}
                title="Confirm Task Deletion"
                description="Are you sure you want to delete this task? This action cannot be undone."
                isDestructive={true}
            />
        </Dialog>
    );
};

export default TaskModal;
