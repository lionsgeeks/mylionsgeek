import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
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
    Pin,
    PinOff,
    Users,
    Tag,
    FileText,
    MessageSquare,
    Paperclip,
    Eye
} from 'lucide-react';
import { useForm, router, usePage } from '@inertiajs/react';
import TaskModal from '../components/TaskModal';
import FlashMessage from '@/components/FlashMessage';
import ConfirmationModal from '@/components/ConfirmationModal';

// Helper to calculate overall task progress
const getTaskOverallProgress = (task) => {
    if (task.subtasks && task.subtasks.length > 0) {
        const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
        return Math.round((completedSubtasks / task.subtasks.length) * 100);
    } else if (task.status === 'completed') {
        return 100;
    } else {
        return 0;
    }
};

const Tasks = ({ tasks = [], teamMembers = [], projectId }) => {
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
    const [focusCommentInput, setFocusCommentInput] = useState(false);
    const [flashMessage, setFlashMessage] = useState(null);
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [sortCriteria, setSortCriteria] = useState('due_date'); // 'due_date', 'priority', 'status'
    const [sortDirection, setSortDirection] = useState('asc'); // 'asc', 'desc'

    // Get flash messages from Inertia
    const { flash } = usePage().props;

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            setFlashMessage({ message: flash.success, type: 'success' });
        } else if (flash?.error) {
            setFlashMessage({ message: flash.error, type: 'error' });
        }
    }, [flash]);

    // Form for creating tasks
    const { data: taskData, setData: setTaskData, post: createTask, processing: isCreating } = useForm({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        assignees: [],
        due_date: '',
        tags: [],
        progress: 0,
        project_id: projectId
    });

    const filteredTasks = useMemo(() => {
        let filtered = safeTasks.filter((task) => {
            if (searchTerm && !(task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) &&
                !(task.description || '').toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }
            if (taskFilter.status !== "all" && task.status !== taskFilter.status) return false;
            if (taskFilter.priority !== "all" && task.priority !== taskFilter.priority) return false;
            if (taskFilter.assignee !== "all") {
                const hasAssignee = task.assignees?.some(assignee => assignee.id === taskFilter.assignee);
                if (!hasAssignee) return false;
            }
            return true;
        });

        // Apply sorting
        filtered.sort((a, b) => {
            // Pinned tasks always come first
            if (a.is_pinned && !b.is_pinned) return -1;
            if (!a.is_pinned && b.is_pinned) return 1;

            let compareValue = 0;

            if (sortCriteria === 'priority') {
                const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
                compareValue = priorityOrder[b.priority] - priorityOrder[a.priority];
            } else if (sortCriteria === 'due_date') {
                const dateA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
                const dateB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
                compareValue = dateA - dateB;
            }
            // Add other sorting criteria here if needed

            return sortDirection === 'asc' ? compareValue : -compareValue;
        });

        return filtered;
    }, [safeTasks, searchTerm, taskFilter, sortCriteria, sortDirection]);

    const handleCreateTask = (e) => {
        e.preventDefault();

        // Ensure project_id is included in the data
        const taskDataWithProject = {
            ...taskData,
            project_id: projectId
        };

        //(taskDataWithProject);
        createTask('/admin/tasks', taskDataWithProject, {
            data: taskDataWithProject,
            onSuccess: () => {
                setTaskData({
                    title: '',
                    description: '',
                    priority: 'medium',
                    status: 'todo',
                    assignees: [],
                    due_date: '',
                    tags: [],
                    progress: 0
                });
                setIsCreateModalOpen(false);
            },
            onError: (errors) => {
                console.error('Task creation errors:', errors);
                setFlashMessage({
                    message: 'Failed to create task: ' + Object.values(errors).flat().join(', '),
                    type: 'error'
                });
            }
        });
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setIsTaskDetailModalOpen(true);
        setFocusCommentInput(false); // Reset focus when opening normally
    };

    const handleOpenTaskDetailAndFocusComment = (task) => {
        setSelectedTask(task);
        setIsTaskDetailModalOpen(true);
        setFocusCommentInput(true);
    };

    const handleUpdateTask = (updatedTask) => {
        router.put(`/admin/tasks/${updatedTask.id}`, updatedTask, {
            onSuccess: () => {
                setFlashMessage({ message: 'Task updated successfully!', type: 'success' });
            },
            onError: (errors) => {
                setFlashMessage({
                    message: 'Failed to update task: ' + Object.values(errors).flat().join(', '),
                    type: 'error'
                });
            }
        });
    };

    const handleMention = (member) => {
        if (member?.name) {
            setNewComment(prev => prev + `@${member.name} `);
        }
    };

    const handleTogglePin = (task) => {
        router.post(`/admin/tasks/${task.id}/pin`, {}, {
            onSuccess: () => {
                setFlashMessage({
                    message: task.is_pinned ? 'Task unpinned successfully!' : 'Task pinned successfully!',
                    type: 'success'
                });
            },
            onError: (errors) => {
                setFlashMessage({
                    message: 'Failed to toggle pin: ' + Object.values(errors).flat().join(', '),
                    type: 'error'
                });
            }
        });
    };

    const handleDeleteTask = (task) => {
        setTaskToDelete(task);
        setIsConfirmDeleteModalOpen(true);
    };

    const confirmDeleteTask = () => {
        if (taskToDelete) {
            router.delete(`/admin/tasks/${taskToDelete.id}`, {
                onSuccess: () => {
                    setFlashMessage({ message: 'Task deleted successfully!', type: 'success' });
                    setIsConfirmDeleteModalOpen(false);
                    setTaskToDelete(null);
                },
                onError: (errors) => {
                    setFlashMessage({
                        message: 'Failed to delete task: ' + Object.values(errors).flat().join(', '),
                        type: 'error'
                    });
                    setIsConfirmDeleteModalOpen(false);
                    setTaskToDelete(null);
                }
            });
        }
    };

    const handleUpdateStatus = (task, newStatus) => {
        router.patch(`/admin/tasks/${task.id}/status`, { status: newStatus }, {
            onSuccess: () => {
                setFlashMessage({ message: 'Task status updated successfully!', type: 'success' });
            },
            onError: (errors) => {
                setFlashMessage({
                    message: 'Failed to update status: ' + Object.values(errors).flat().join(', '),
                    type: 'error'
                });
            }
        });
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
            {/* Flash Messages */}
            {flashMessage && (
                <FlashMessage
                    message={flashMessage.message}
                    type={flashMessage.type}
                    onClose={() => setFlashMessage(null)}
                />
            )}

            {/* Header and Filters */}
            <div className="flex flex-col md:flex-row justify-between  items-center gap-2">
                <div className="flex items-center rounded-lg bg-neutral-200 dark:bg-neutral-800 gap-2">
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

                    <Select
                        value={sortCriteria}
                        onValueChange={setSortCriteria}
                    >
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="due_date">Due Date</SelectItem>
                            <SelectItem value="priority">Priority</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* <Select
                        value={sortDirection}
                        onValueChange={setSortDirection}
                    >
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Order" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="asc">Ascending</SelectItem>
                            <SelectItem value="desc">Descending</SelectItem>
                        </SelectContent>
                    </Select> */}

                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                </Button>
            </div>

            {/* Tasks Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">Task</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Assignees</TableHead>
                            <TableHead>Progress</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTasks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No tasks match your filters
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTasks.map((task) => (
                                <TableRow
                                    key={task.id}
                                    className={`hover:bg-muted/50 ${task.is_pinned ? 'bg-yellow-50 dark:bg-yellow-950/20' : ''}`}
                                >
                                    <TableCell className="w-[300px]">
                                        <div className='py-2'>
                                            <div className="flex items-center gap-2">
                                                {task.is_pinned && <Pin className="h-4 w-4 text-yellow-600" />}
                                                <div className="font-medium">{task.title || 'Untitled Task'}</div>
                                            </div>
                                            <div className="text-sm text-muted-foreground  truncate w-50">{task.description || 'No description'}</div>
                                            {task.tags && task.tags.length > 0 && (
                                                <div className="flex gap-1 mt-1">
                                                    {task.tags.map((tag, index) => (
                                                        <Badge key={index} variant="outline" className="text-xs">
                                                            <Tag className="h-3 w-3 mr-1" />
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(task.status)}
                                    </TableCell>
                                    <TableCell>
                                        {getPriorityBadge(task.priority)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            {task.assignees && task.assignees.length > 0 ? (
                                                <>
                                                    <div className="flex -space-x-1">
                                                        {task.assignees.slice(0, 3).map((assignee) => (
                                                            // <Avatar key={assignee.id} className="h-6 w-6 border border-white dark:border-gray-800">
                                                            //     <AvatarImage src={assignee.image ? `/storage/${assignee.image}` : null} alt={assignee.name} />
                                                            //     <AvatarFallback className="text-xs">
                                                            //         {assignee.name.charAt(0).toUpperCase()}
                                                            //     </AvatarFallback>
                                                            // </Avatar>
                                                            <Avatar
                                                                className="w-12 h-12 overflow-hidden relative z-50"
                                                                image={assignee.image}
                                                                name={assignee.name}
                                                                lastActivity={assignee.last_online || null}
                                                                onlineCircleClass="hidden"
                                                            />
                                                        ))}
                                                    </div>
                                                    {task.assignees.length > 3 && (
                                                        <span className="text-xs text-muted-foreground ml-1">
                                                            +{task.assignees.length - 3}
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">Unassigned</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Progress value={getTaskOverallProgress(task)} className="w-16 h-2" />
                                            <span className="text-xs text-muted-foreground">{getTaskOverallProgress(task)}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleTaskClick(task)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        <span>View Details</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleTaskClick(task)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        <span>Edit Task</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleTogglePin(task)}>
                                                        {task.is_pinned ? <PinOff className="mr-2 h-4 w-4" /> : <Pin className="mr-2 h-4 w-4" />}
                                                        <span>{task.is_pinned ? 'Unpin' : 'Pin'}</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(task, 'completed')}>
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        <span>Mark as Completed</span>
                                                    </DropdownMenuItem>
                                                    {(task.status === 'completed' || task.status === 'review') && (
                                                        <DropdownMenuItem onClick={() => handleUpdateStatus(task, 'in_progress')}>
                                                            <AlertCircle className="mr-2 h-4 w-4" />
                                                            <span>Mark as Incomplete</span>
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onClick={() => handleOpenTaskDetailAndFocusComment(task)}>
                                                        <MessageSquare className="mr-2 h-4 w-4" />
                                                        <span>Add Comment</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => handleDeleteTask(task)}
                                                    >
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
                    <form onSubmit={handleCreateTask} className="space-y-4">
                        <div>
                            <Label htmlFor="title">Task Title *</Label>
                            <Input
                                id="title"
                                value={taskData.title}
                                onChange={(e) => setTaskData('title', e.target.value)}
                                placeholder="Enter task title..."
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={taskData.description}
                                onChange={(e) => setTaskData('description', e.target.value)}
                                placeholder="Enter task description..."
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="priority">Priority</Label>
                                <Select
                                    value={taskData.priority}
                                    onValueChange={(value) => setTaskData('priority', value)}
                                >
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
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={taskData.status}
                                    onValueChange={(value) => setTaskData('status', value)}
                                >
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
                        <div>
                            <Label htmlFor="assignees">Assignees</Label>
                            <Select
                                value=""
                                onValueChange={(value) => {
                                    if (value && !taskData.assignees.includes(value)) {
                                        setTaskData('assignees', [...taskData.assignees, value]);
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select assignees" />
                                </SelectTrigger>
                                <SelectContent>
                                    {safeTeamMembers.map((member) => (
                                        <SelectItem key={member?.id || Math.random()} value={member?.id || ''}>
                                            {member?.name || 'Unknown'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {taskData.assignees.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {taskData.assignees.map((assigneeId) => {
                                        const member = safeTeamMembers.find(m => m.id === assigneeId);
                                        return (
                                            <Badge key={assigneeId} variant="outline" className="flex items-center gap-1">
                                                {member?.name || 'Unknown'}
                                                <button
                                                    type="button"
                                                    onClick={() => setTaskData('assignees', taskData.assignees.filter(id => id !== assigneeId))}
                                                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                                                >
                                                    ×
                                                </button>
                                            </Badge>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="due_date">Due Date</Label>
                            <Input
                                id="due_date"
                                type="date"
                                value={taskData.due_date}
                                onChange={(e) => setTaskData('due_date', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={taskData.notes}
                                onChange={(e) => setTaskData('notes', e.target.value)}
                                placeholder="Add any additional notes..."
                                rows={2}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isCreating}>
                                {isCreating ? 'Creating...' : 'Create Task'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Task Detail Modal */}
            <TaskModal
                isOpen={isTaskDetailModalOpen}
                projectId={projectId}
                setSelectedTask={setSelectedTask}
                onClose={() => setIsTaskDetailModalOpen(false)}
                selectedTask={selectedTask}
                teamMembers={safeTeamMembers}
                onUpdateTask={handleUpdateTask}
                focusCommentInput={focusCommentInput}
            />

            {/* Confirmation Modal for Deletion */}
            <ConfirmationModal
                isOpen={isConfirmDeleteModalOpen}
                onClose={() => setIsConfirmDeleteModalOpen(false)}
                onConfirm={confirmDeleteTask}
                title="Confirm Task Deletion"
                description={`Are you sure you want to delete task "${taskToDelete?.title || 'this task'}" (ID: ${taskToDelete?.id})? This action cannot be undone.`}
                isDestructive={true}
            />
        </div>
    );
};

export default Tasks;
