import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { AlertCircle, Calendar, CheckCircle, Clock, Edit, MessageSquare, MoreVertical, Plus, Send, Trash, User } from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface Task {
    id: number;
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'todo' | 'in_progress' | 'review' | 'completed';
    assigned_to?: number;
    assignee?: { name: string };
    due_date?: string;
    created_at: string;
    comments?: Array<{
        id: number;
        content: string;
        user: { name: string };
        created_at: string;
    }>;
}

interface TaskManagerProps {
    tasks: Task[];
    teamMembers: Array<{ id: number; name: string }>;
    onTaskCreate: (data: { title: string; description?: string; priority: string; assigned_to?: number; due_date?: string }) => void;
    onTaskUpdate: (
        id: number,
        data: { title?: string; description?: string; priority?: string; status?: string; assigned_to?: number; due_date?: string },
    ) => void;
    onTaskDelete: (id: number) => void;
    onCommentAdd: (taskId: number, content: string) => void;
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, teamMembers, onTaskCreate, onTaskUpdate, onTaskDelete, onCommentAdd }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [newComment, setNewComment] = useState<{ [taskId: number]: string }>({});

    const {
        data: taskData,
        setData: setTaskData,
        processing,
    } = useForm({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        assigned_to: '',
        due_date: '',
    });

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const matchesSearch =
                task.title.toLowerCase().includes(searchTerm.toLowerCase()) || task.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
            const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;

            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [tasks, searchTerm, filterStatus, filterPriority]);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'low':
                return 'bg-green-100 text-green-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'high':
                return 'bg-orange-100 text-orange-800';
            case 'urgent':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'todo':
                return 'bg-gray-100 text-gray-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'review':
                return 'bg-purple-100 text-purple-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'todo':
                return <Clock className="h-4 w-4" />;
            case 'in_progress':
                return <AlertCircle className="h-4 w-4" />;
            case 'review':
                return <Clock className="h-4 w-4" />;
            case 'completed':
                return <CheckCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const handleCreateTask = (e: React.FormEvent) => {
        e.preventDefault();
        onTaskCreate(taskData);
        setIsCreateModalOpen(false);
        setTaskData({
            title: '',
            description: '',
            priority: 'medium',
            status: 'todo',
            assigned_to: '',
            due_date: '',
        });
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setTaskData({
            title: task.title,
            description: task.description || '',
            priority: task.priority,
            status: task.status,
            assigned_to: task.assigned_to?.toString() || '',
            due_date: task.due_date || '',
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTask) {
            onTaskUpdate(editingTask.id, taskData);
            setIsEditModalOpen(false);
            setEditingTask(null);
        }
    };

    const handleAddComment = (taskId: number) => {
        const content = newComment[taskId];
        if (content?.trim()) {
            onCommentAdd(taskId, content);
            setNewComment((prev) => ({ ...prev, [taskId]: '' }));
        }
    };

    const taskStats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter((t) => t.status === 'completed').length;
        const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
        const todo = tasks.filter((t) => t.status === 'todo').length;

        return { total, completed, inProgress, todo };
    }, [tasks]);

    return (
        <div className="space-y-6">
            {/* Task Statistics */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Clock className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium">Total Tasks</p>
                                <p className="text-2xl font-bold">{taskStats.total}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                            <div>
                                <p className="text-sm font-medium">In Progress</p>
                                <p className="text-2xl font-bold">{taskStats.inProgress}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="text-sm font-medium">Completed</p>
                                <p className="text-2xl font-bold">{taskStats.completed}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Clock className="h-5 w-5 text-gray-600" />
                            <div>
                                <p className="text-sm font-medium">To Do</p>
                                <p className="text-2xl font-bold">{taskStats.todo}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Task Management */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Tasks</CardTitle>
                        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[var(--color-alpha)] hover:bg-[var(--color-alpha)]/90">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Task
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                        <div className="flex-1">
                            <Input placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="todo">To Do</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="review">Review</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterPriority} onValueChange={setFilterPriority}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priority</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tasks List */}
                    <div className="space-y-4">
                        {filteredTasks.map((task) => (
                            <Card key={task.id} className="transition-shadow hover:shadow-md">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="mb-2 flex items-center space-x-2">
                                                <h3 className="font-medium">{task.title}</h3>
                                                <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                                                <Badge className={getStatusColor(task.status)}>
                                                    {getStatusIcon(task.status)}
                                                    <span className="ml-1">{task.status.replace('_', ' ')}</span>
                                                </Badge>
                                            </div>

                                            {task.description && <p className="mb-3 text-sm text-muted-foreground">{task.description}</p>}

                                            <div className="mb-3 flex items-center space-x-4 text-sm text-muted-foreground">
                                                {task.assignee && (
                                                    <div className="flex items-center space-x-1">
                                                        <User className="h-4 w-4" />
                                                        <span>{task.assignee.name}</span>
                                                    </div>
                                                )}
                                                {task.due_date && (
                                                    <div className="flex items-center space-x-1">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{new Date(task.due_date).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Comments */}
                                            {task.comments && task.comments.length > 0 && (
                                                <div className="mt-3 space-y-2">
                                                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                                        <MessageSquare className="h-4 w-4" />
                                                        <span>{task.comments.length} comments</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        {task.comments.slice(0, 2).map((comment) => (
                                                            <div key={comment.id} className="rounded bg-gray-50 p-2 text-sm">
                                                                <div className="flex items-center space-x-2">
                                                                    <span className="font-medium">{comment.user.name}</span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {new Date(comment.created_at).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                                <p className="mt-1">{comment.content}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Add Comment */}
                                            <div className="mt-3 flex space-x-2">
                                                <Input
                                                    placeholder="Add a comment..."
                                                    value={newComment[task.id] || ''}
                                                    onChange={(e) => setNewComment((prev) => ({ ...prev, [task.id]: e.target.value }))}
                                                    className="flex-1"
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleAddComment(task.id)}
                                                    className="bg-[var(--color-alpha)] hover:bg-[var(--color-alpha)]/90"
                                                >
                                                    <Send className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onTaskDelete(task.id)} className="text-red-600">
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

                    {filteredTasks.length === 0 && (
                        <div className="py-8 text-center">
                            <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="text-lg font-medium">No tasks found</h3>
                            <p className="text-muted-foreground">Create your first task to get started.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Task Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateTask} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Task Title *</Label>
                            <Input
                                id="title"
                                value={taskData.title}
                                onChange={(e) => setTaskData('title', e.target.value)}
                                placeholder="Enter task title"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={taskData.description}
                                onChange={(e) => setTaskData('description', e.target.value)}
                                placeholder="Enter task description"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select value={taskData.priority} onValueChange={(value) => setTaskData('priority', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="assigned_to">Assign To</Label>
                                <Select value={taskData.assigned_to} onValueChange={(value) => setTaskData('assigned_to', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select assignee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teamMembers.map((member) => (
                                            <SelectItem key={member.id} value={member.id.toString()}>
                                                {member.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="due_date">Due Date</Label>
                            <Input id="due_date" type="date" value={taskData.due_date} onChange={(e) => setTaskData('due_date', e.target.value)} />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-[var(--color-alpha)] hover:bg-[var(--color-alpha)]/90">
                                {processing ? 'Creating...' : 'Create Task'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Task Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateTask} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit_title">Task Title *</Label>
                            <Input
                                id="edit_title"
                                value={taskData.title}
                                onChange={(e) => setTaskData('title', e.target.value)}
                                placeholder="Enter task title"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit_description">Description</Label>
                            <Textarea
                                id="edit_description"
                                value={taskData.description}
                                onChange={(e) => setTaskData('description', e.target.value)}
                                placeholder="Enter task description"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="edit_priority">Priority</Label>
                                <Select value={taskData.priority} onValueChange={(value) => setTaskData('priority', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit_status">Status</Label>
                                <Select value={taskData.status} onValueChange={(value) => setTaskData('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todo">To Do</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="review">Review</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="edit_assigned_to">Assign To</Label>
                                <Select value={taskData.assigned_to} onValueChange={(value) => setTaskData('assigned_to', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select assignee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teamMembers.map((member) => (
                                            <SelectItem key={member.id} value={member.id.toString()}>
                                                {member.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit_due_date">Due Date</Label>
                                <Input
                                    id="edit_due_date"
                                    type="date"
                                    value={taskData.due_date}
                                    onChange={(e) => setTaskData('due_date', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-[var(--color-alpha)] hover:bg-[var(--color-alpha)]/90">
                                {processing ? 'Updating...' : 'Update Task'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TaskManager;
