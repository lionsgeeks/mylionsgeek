import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
    Search, 
    Plus, 
    MoreHorizontal, 
    Edit, 
    Trash, 
    Mail, 
    CheckCircle,
    Clock,
    AlertCircle,
    Calendar,
    User,
    Paperclip,
    MessageSquare,
    AtSign,
    FileText,
    List,
    X,
    Send,
    CheckSquare,
    Square,
    Share2,
    Download
} from 'lucide-react';

const Tasks = ({ tasks = [], teamMembers = [] }) => {
    // Ensure we have safe defaults
    const safeTasks = tasks || [];
    const safeTeamMembers = teamMembers || [];
    const [searchTerm, setSearchTerm] = useState('');
    const [taskFilter, setTaskFilter] = useState({
        status: "all",
        priority: "all",
        assignee: "all",
    });
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'medium',
        assignee: '',
        dueDate: ''
    });
    const [newComment, setNewComment] = useState('');
    const [newSubtask, setNewSubtask] = useState('');
    const [newFile, setNewFile] = useState(null);
    const [subtasks, setSubtasks] = useState([
        { id: 1, text: "Set up development environment", completed: true },
        { id: 2, text: "Write unit tests", completed: false },
        { id: 3, text: "Update documentation", completed: false }
    ]);
    const [comments, setComments] = useState([
        {
            id: 1,
            user: { name: "John Doe", avatar: "/placeholder.svg?height=32&width=32" },
            content: "This looks good! I'll start working on the authentication system.",
            timestamp: "2024-02-15T12:30:00"
        },
        {
            id: 2,
            user: { name: "Jane Smith", avatar: "/placeholder.svg?height=32&width=32" },
            content: "Great! Let me know if you need any help with the frontend integration.",
            timestamp: "2024-02-15T13:15:00"
        }
    ]);
    const [attachments, setAttachments] = useState([
        { id: 1, name: "requirements.pdf", type: "pdf", size: "2.3 MB", url: "#" },
        { id: 2, name: "design-mockup.fig", type: "fig", size: "1.8 MB", url: "#" }
    ]);

    const filteredTasks = useMemo(() => {
        return safeTasks.filter((task) => {
            if (searchTerm && !(task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) && 
                !(task.description || '').toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }
            if (taskFilter.status !== "all" && task.status !== taskFilter.status) return false;
            if (taskFilter.priority !== "all" && task.priority !== taskFilter.priority) return false;
            if (taskFilter.assignee !== "all" && task.assignee?.id !== taskFilter.assignee) return false;
            return true;
        });
    }, [safeTasks, searchTerm, taskFilter]);

    const handleCreateTask = () => {
        console.log('Creating task:', newTask);
        setNewTask({
            title: '',
            description: '',
            priority: 'medium',
            assignee: '',
            dueDate: ''
        });
        setIsCreateModalOpen(false);
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setIsTaskDetailModalOpen(true);
    };

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
            setComments([...comments, newCommentObj]);
            setNewComment('');
        }
    };

    const handleAddSubtask = () => {
        if (newSubtask.trim()) {
            const newSubtaskObj = {
                id: subtasks.length + 1,
                text: newSubtask,
                completed: false
            };
            setSubtasks([...subtasks, newSubtaskObj]);
            setNewSubtask('');
        }
    };

    const handleToggleSubtask = (id) => {
        setSubtasks(subtasks.map(subtask => 
            subtask.id === id ? { ...subtask, completed: !subtask.completed } : subtask
        ));
    };

    const handleDeleteSubtask = (id) => {
        setSubtasks(subtasks.filter(subtask => subtask.id !== id));
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const newAttachment = {
                id: attachments.length + 1,
                name: file.name,
                type: file.type.split('/')[1] || 'file',
                size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
                url: URL.createObjectURL(file)
            };
            setAttachments([...attachments, newAttachment]);
            setNewFile(file);
        }
    };

    const handleDownloadFile = (attachment) => {
        if (attachment.url && attachment.url !== '#') {
            const link = document.createElement('a');
            link.href = attachment.url;
            link.download = attachment.name;
            link.click();
        } else {
            console.log('Downloading:', attachment.name);
        }
    };

    const handleDeleteAttachment = (id) => {
        setAttachments(attachments.filter(attachment => attachment.id !== id));
    };

    const handleMention = (member) => {
        if (member?.name) {
            setNewComment(prev => prev + `@${member.name} `);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            completed: { color: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300", icon: CheckCircle },
            "in-progress": { color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300", icon: Clock },
            todo: { color: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300", icon: AlertCircle }
        };
        
        const safeStatus = status || 'todo';
        const config = statusConfig[safeStatus] || statusConfig.todo;
        const Icon = config.icon;
        
        return (
            <Badge variant="outline" className={`${config.color} border-none flex items-center gap-1`}>
                <Icon className="h-3 w-3" />
                {safeStatus === "in-progress" ? "In Progress" : safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
            </Badge>
        );
    };

    const getPriorityBadge = (priority) => {
        const priorityConfig = {
            high: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
            medium: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
            low: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
        };
        
        const safePriority = priority || 'medium';
        const colorClass = priorityConfig[safePriority] || priorityConfig.medium;
        
        return (
            <Badge variant="outline" className={`${colorClass} border-none`}>
                {safePriority.charAt(0).toUpperCase() + safePriority.slice(1)}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header and Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            type="search" 
                            placeholder="Search tasks..." 
                            className="pl-8 w-[200px] md:w-[300px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Select
                        value={taskFilter.status}
                        onValueChange={(value) => setTaskFilter({ ...taskFilter, status: value })}
                    >
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={taskFilter.priority}
                        onValueChange={(value) => setTaskFilter({ ...taskFilter, priority: value })}
                    >
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={taskFilter.assignee}
                        onValueChange={(value) => setTaskFilter({ ...taskFilter, assignee: value })}
                    >
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Assignee" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Assignees</SelectItem>
                            {teamMembers.map((member) => (
                                <SelectItem key={member.id} value={member.id}>
                                    {member.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                    </Button>
                </div>
            </div>

            {/* Tasks Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">Task</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Assignee</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTasks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No tasks match your filters
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTasks.map((task) => (
                                <TableRow 
                                    key={task.id} 
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => handleTaskClick(task)}
                                >
                                    <TableCell>
                                        <div className='py-2'>
                                            <div className="font-medium">{task.title || 'Untitled Task'}</div>
                                            <div className="text-sm text-muted-foreground">{task.description || 'No description'}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(task.status)}
                                    </TableCell>
                                    <TableCell>
                                        {getPriorityBadge(task.priority)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={task.assignee?.avatar} alt={task.assignee?.name || 'Assignee'} />
                                                <AvatarFallback>{(task.assignee?.name || 'U').substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <span>{task.assignee?.name || 'Unassigned'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-8 w-8 p-0"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleTaskClick(task)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        <span>View Details</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        <span>Mark as Completed</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Mail className="h-3.5 w-3.5 mr-1" />
                                                        Notify
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive">
                                                        <Trash className="mr-2 h-4 w-4" />
                                                        <span>Delete</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create Task Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                        <DialogDescription>
                            Add a new task to your project
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="title">Task Title</Label>
                            <Input 
                                id="title" 
                                value={newTask.title}
                                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                                placeholder="Enter task title..."
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea 
                                id="description" 
                                value={newTask.description}
                                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                                placeholder="Enter task description..."
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="priority">Priority</Label>
                                <Select 
                                    value={newTask.priority} 
                                    onValueChange={(value) => setNewTask({...newTask, priority: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="assignee">Assignee</Label>
                                <Select 
                                    value={newTask.assignee} 
                                    onValueChange={(value) => setNewTask({...newTask, assignee: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select assignee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {safeTeamMembers.map((member) => (
                                            <SelectItem key={member?.id || Math.random()} value={member?.id || ''}>
                                                {member?.name || 'Unknown'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input 
                                id="dueDate" 
                                type="date"
                                value={newTask.dueDate}
                                onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateTask}>
                            Create Task
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Task Detail Modal */}
            <Dialog open={isTaskDetailModalOpen} onOpenChange={setIsTaskDetailModalOpen}>
                <DialogContent className="max-w-6xl max-h-[90vh] w-[95vw]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <div className="p-2 bg-[var(--color-alpha)]/10 rounded-lg">
                                <FileText className="h-5 w-5 text-[var(--color-alpha)]" />
                            </div>
                            <div>
                                <div className="text-lg font-semibold">{selectedTask?.title || 'Untitled Task'}</div>
                                <div className="text-sm text-muted-foreground">
                                    Created {selectedTask?.createdAt ? new Date(selectedTask.createdAt).toLocaleDateString() : 'Recently'}
                                </div>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    
                    <ScrollArea className="max-h-[70vh]">
                        <div className="space-y-6">
                            {/* Task Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    {getStatusBadge(selectedTask?.status)}
                                    {getPriorityBadge(selectedTask?.priority)}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Share2 className="h-4 w-4 mr-2" />
                                        Share
                                    </Button>
                                </div>
                            </div>

                            {/* Task Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Main Content */}
                                <div className="md:col-span-2 space-y-6">
                                    {/* Description */}
                                    <Card className="bg-background/30">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                Description
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedTask?.description || 'No description provided'}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    {/* Subtasks */}
                                    <Card className="bg-background/30">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <List className="h-4 w-4" />
                                                Subtasks
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {/* Dynamic subtasks */}
                                            {subtasks.map((subtask) => (
                                                <div key={subtask.id} className="flex items-center gap-2 group">
                                                    <button
                                                        onClick={() => handleToggleSubtask(subtask.id)}
                                                        className="flex-shrink-0"
                                                    >
                                                        {subtask.completed ? (
                                                            <CheckSquare className="h-4 w-4 text-green-500" />
                                                        ) : (
                                                            <Square className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </button>
                                                    <span className={`text-sm flex-1 ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                                                        {subtask.text}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => handleDeleteSubtask(subtask.id)}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                            
                                            {/* Add subtask */}
                                            <div className="flex gap-2 pt-2">
                                                <Input
                                                    placeholder="Add a subtask..."
                                                    value={newSubtask}
                                                    onChange={(e) => setNewSubtask(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                                                    className="flex-1"
                                                />
                                                <Button size="sm" onClick={handleAddSubtask} disabled={!newSubtask.trim()}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Comments */}
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
                                                        placeholder="Add a comment..."
                                                        value={newComment}
                                                        onChange={(e) => setNewComment(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                                                        className="flex-1"
                                                    />
                                                    <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                                                        <Send className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                
                                                {/* Mention dropdown */}
                                                <div className="flex gap-1">
                                                    <span className="text-xs text-muted-foreground">Mention:</span>
                                                    {safeTeamMembers.slice(0, 3).map((member) => (
                                                        <Button
                                                            key={member?.id || Math.random()}
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 p-1"
                                                            onClick={() => handleMention(member)}
                                                        >
                                                            <AtSign className="h-3 w-3 mr-1" />
                                                            {member?.name || 'Unknown'}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Sidebar */}
                                <div className="space-y-4">
                                    {/* Assignee */}
                                    <Card className="bg-background/30">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-sm">
                                                <User className="h-4 w-4" />
                                                Assignee
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={selectedTask?.assignee?.avatar} alt={selectedTask?.assignee?.name || 'Assignee'} />
                                                    <AvatarFallback>{(selectedTask?.assignee?.name || 'U').substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-sm">{selectedTask?.assignee?.name || 'Unassigned'}</div>
                                                    <div className="text-xs text-muted-foreground">{selectedTask?.assignee?.email || 'No email'}</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Due Date */}
                                    <Card className="bg-background/30">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4" />
                                                Due Date
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-sm">
                                                {selectedTask?.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'No due date set'}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Attachments */}
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
                                                <div key={attachment.id} className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-2 text-sm flex-1">
                                                        <FileText className="h-4 w-4 text-blue-500" />
                                                        <span className="truncate">{attachment.name}</span>
                                                        <span className="text-xs text-muted-foreground">({attachment.size})</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 w-6 p-0"
                                                            onClick={() => handleDownloadFile(attachment)}
                                                        >
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
                                                <input
                                                    type="file"
                                                    onChange={handleFileUpload}
                                                    className="hidden"
                                                    id="file-upload"
                                                    multiple
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => document.getElementById('file-upload').click()}
                                                >
                                                    <Paperclip className="h-4 w-4 mr-2" />
                                                    Add File
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Activity */}
                                    <Card className="bg-background/30">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-sm">
                                                <Clock className="h-4 w-4" />
                                                Activity
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="text-xs text-muted-foreground">
                                                <div>Created 2 days ago</div>
                                                <div>Last updated 1 hour ago</div>
                                                <div>{comments.length} comments</div>
                                                <div>{attachments.length} attachments</div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span>Subtasks:</span>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-green-500">
                                                            {subtasks.filter(s => s.completed).length}
                                                        </span>
                                                        <span>/</span>
                                                        <span>{subtasks.length}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Tasks;
