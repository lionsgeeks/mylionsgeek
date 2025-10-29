import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Calendar, CheckCircle, Clock, Paperclip, User } from 'lucide-react';

const TaskSidebar = ({ task, teamMembers = [] }) => {
    const getStatusBadge = (status) => {
        const statusConfig = {
            completed: { color: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300', icon: CheckCircle },
            'in-progress': { color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300', icon: Clock },
            todo: { color: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300', icon: AlertCircle },
        };

        const safeStatus = status || 'todo';
        const config = statusConfig[safeStatus] || statusConfig.todo;
        const Icon = config.icon;

        return (
            <Badge variant="outline" className={`${config.color} flex items-center gap-1 border-none`}>
                <Icon className="h-3 w-3" />
                {safeStatus === 'in-progress' ? 'In Progress' : safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
            </Badge>
        );
    };

    const getPriorityBadge = (priority) => {
        const priorityConfig = {
            high: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
            medium: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
            low: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
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
        <div className="space-y-4">
            {/* Status and Priority */}
            <Card className="bg-background/30">
                <CardHeader>
                    <CardTitle className="text-sm">Status & Priority</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {getStatusBadge(task.status)}
                    {getPriorityBadge(task.priority)}
                </CardContent>
            </Card>

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
                            <AvatarImage src={task.assignee?.avatar} alt={task.assignee?.name || 'Assignee'} />
                            <AvatarFallback>{(task.assignee?.name || 'U').substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="text-sm font-medium">{task.assignee?.name || 'Unassigned'}</div>
                            <div className="text-xs text-muted-foreground">{task.assignee?.email || 'No email'}</div>
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
                    <div className="text-sm">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date set'}</div>
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
                <CardContent>
                    <div className="text-sm text-muted-foreground">{task.attachments?.length || 0} files</div>
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
                        <div>{task.comments?.length || 0} comments</div>
                        <div>{task.attachments?.length || 0} attachments</div>
                        <div className="mt-2 flex items-center gap-2">
                            <span>Subtasks:</span>
                            <div className="flex items-center gap-1">
                                <span className="text-green-500">{task.subtasks?.filter((s) => s.completed).length || 0}</span>
                                <span>/</span>
                                <span>{task.subtasks?.length || 0}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TaskSidebar;
