import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Clock, ListChecks, MessageSquare, NotebookText, Sparkles, UserPlus } from 'lucide-react';

const Sidebar = ({ todaysTasks = [], tasks = [], recentActivities = [] }) => {
    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4" />;
            case 'in_progress':
            case 'in-progress':
                return <Clock className="h-4 w-4" />;
            case 'todo':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-alpha text-black';
            case 'in_progress':
            case 'in-progress':
                return 'bg-alpha/20 text-foreground';
            case 'todo':
                return 'bg-muted text-muted-foreground';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'border-alpha/40 bg-alpha/15 text-xs text-foreground';
            case 'medium':
                return 'border-border bg-muted/60 text-xs text-foreground';
            case 'low':
                return 'border-border bg-background text-xs text-muted-foreground';
            default:
                return 'border-border bg-muted/60 text-xs text-foreground';
        }
    };

    const formatDate = (date) => {
        if (!date) return 'No due date';

        return new Date(date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
        });
    };

    const formatActivityTime = (timestamp) => {
        if (!timestamp) return 'Just now';

        const diffInMinutes = Math.max(0, Math.round((Date.now() - new Date(timestamp).getTime()) / 60000));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

        const diffInHours = Math.round(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.round(diffInHours / 24);
        return `${diffInDays}d ago`;
    };

    const getActivityIcon = (type) => {
        if (type === 'task_comment') return MessageSquare;
        if (type === 'note_creation') return NotebookText;
        if (type === 'team_member') return UserPlus;
        if (type?.includes('task')) return ListChecks;
        return Sparkles;
    };

    const statTasks = tasks.length > 0 ? tasks : todaysTasks;
    const completedCount = statTasks.filter((task) => task.status === 'completed').length;
    const inProgressCount = statTasks.filter((task) => ['in_progress', 'in-progress', 'review'].includes(task.status)).length;
    const pendingCount = statTasks.filter((task) => task.status === 'todo').length;
    const activeCount = todaysTasks.filter((task) => task.status !== 'completed').length;
    const statItems = [
        { label: 'Completed', value: completedCount, color: 'bg-alpha' },
        { label: 'In Progress', value: inProgressCount, color: 'bg-foreground' },
        { label: 'Pending', value: pendingCount, color: 'bg-muted-foreground' },
    ];
    const visibleActivities = recentActivities.slice(0, 4);

    return (
        <aside className="w-full border-t bg-muted/10 lg:w-80 lg:border-t-0 lg:border-l xl:w-96">
            <div className="space-y-6 px-4 py-5 sm:px-6 lg:px-4 xl:px-5">
                {/* Today's Tasks Card */}
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Today's Tasks</h3>
                        <Badge variant="outline" className="shrink-0 text-xs">
                            {activeCount} active
                        </Badge>
                    </div>
                    <div className="space-y-3">
                        {todaysTasks.length === 0 ? (
                            <Card className="border-dashed bg-background/40">
                                <CardContent className="py-6 text-center text-sm text-muted-foreground">No tasks for today</CardContent>
                            </Card>
                        ) : (
                            todaysTasks.map((task) => (
                                <Card key={task.id} className="overflow-hidden bg-background/60 py-0">
                                    <CardContent className="p-3.5">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <div
                                                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${getStatusColor(task.status)}`}
                                            >
                                                {getStatusIcon(task.status)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="break-words text-sm font-medium leading-snug">{task.title}</p>
                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                                        {task.priority}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">{formatDate(task.due_date)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Stats */}
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Quick Stats</h3>
                        <span className="text-sm text-muted-foreground">{statTasks.length} tasks</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {statItems.map((item) => (
                            <div key={item.label} className="rounded-md border bg-background/50 p-3">
                                <div className={`mb-2 h-1.5 w-8 rounded-full ${item.color}`} />
                                <div className="text-lg font-semibold leading-none">{item.value}</div>
                                <div className="mt-1 text-xs text-muted-foreground">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity Summary */}
                <div>
                    <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
                    <div className="space-y-3">
                        {visibleActivities.length === 0 ? (
                            <Card className="border-dashed bg-background/40">
                                <CardContent className="py-6 text-center text-sm text-muted-foreground">No recent activity yet</CardContent>
                            </Card>
                        ) : (
                            visibleActivities.map((activity) => {
                                const ActivityIcon = getActivityIcon(activity.type);

                                return (
                                    <div key={activity.id} className="flex min-w-0 gap-3 rounded-md border bg-background/50 p-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-alpha/15 text-alpha">
                                            <ActivityIcon className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-sm font-medium">{activity.action}</div>
                                            <div className="truncate text-xs text-muted-foreground">{activity.target}</div>
                                            <div className="mt-1 text-xs text-muted-foreground">{formatActivityTime(activity.timestamp)}</div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
