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
import { 
    Search, 
    Plus, 
    MoreHorizontal, 
    Edit, 
    Trash, 
    Mail, 
    CheckCircle,
    Clock,
    AlertCircle
} from 'lucide-react';

const Tasks = ({ tasks = [], teamMembers = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [taskFilter, setTaskFilter] = useState({
        status: "all",
        priority: "all",
        assignee: "all",
    });
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'medium',
        assignee: '',
        dueDate: ''
    });

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
                !task.description.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }
            if (taskFilter.status !== "all" && task.status !== taskFilter.status) return false;
            if (taskFilter.priority !== "all" && task.priority !== taskFilter.priority) return false;
            if (taskFilter.assignee !== "all" && task.assignee?.id !== taskFilter.assignee) return false;
            return true;
        });
    }, [tasks, searchTerm, taskFilter]);

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

    const getStatusBadge = (status) => {
        const statusConfig = {
            completed: { color: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300", icon: CheckCircle },
            "in-progress": { color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300", icon: Clock },
            todo: { color: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300", icon: AlertCircle }
        };
        
        const config = statusConfig[status] || statusConfig.todo;
        const Icon = config.icon;
        
        return (
            <Badge variant="outline" className={`${config.color} border-none flex items-center gap-1`}>
                <Icon className="h-3 w-3" />
                {status === "in-progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const getPriorityBadge = (priority) => {
        const priorityConfig = {
            high: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
            medium: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
            low: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
        };
        
        return (
            <Badge variant="outline" className={`${priorityConfig[priority]} border-none`}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
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
                                <TableRow key={task.id}>
                                    <TableCell>
                                        <div className='py-2'>
                                            <div className="font-medium">{task.title}</div>
                                            <div className="text-sm text-muted-foreground">{task.description}</div>
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
                                                <AvatarImage src={task.assignee?.avatar} alt={task.assignee?.name} />
                                                <AvatarFallback>{task.assignee?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <span>{task.assignee?.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        <span>Edit</span>
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
                                        {teamMembers.map((member) => (
                                            <SelectItem key={member.id} value={member.id}>
                                                {member.name}
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
        </div>
    );
};

export default Tasks;
