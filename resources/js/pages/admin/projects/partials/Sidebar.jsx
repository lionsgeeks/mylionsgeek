import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

const Sidebar = ({ todaysTasks = [] }) => {
    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-3 w-3" />;
            case 'in-progress':
                return <Clock className="h-3 w-3" />;
            case 'todo':
                return <AlertCircle className="h-3 w-3" />;
            default:
                return <AlertCircle className="h-3 w-3" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-600';
            case 'in-progress':
                return 'bg-amber-100 text-amber-600';
            case 'todo':
                return 'bg-rose-100 text-rose-600';
            default:
                return 'bg-rose-100 text-rose-600';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'text-xs bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-none';
            case 'medium':
                return 'text-xs bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-none';
            case 'low':
                return 'text-xs bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 border-none';
            default:
                return 'text-xs bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-none';
        }
    };

    return (
        <div className="w-full border-t bg-muted/10 lg:w-80 lg:border-t-0 lg:border-l">
            <div className="space-y-6 py-4 pl-4">
                {/* Today's Tasks Card */}
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Today's Tasks</h3>
                        <Badge variant="outline" className="text-xs">
                            {todaysTasks.length} tasks
                        </Badge>
                    </div>
                    <div className="space-y-1">
                        {todaysTasks.length === 0 ? (
                            <div className="py-4 text-center text-sm text-muted-foreground">No tasks for today</div>
                        ) : (
                            todaysTasks.map((task) => (
                                <Card key={task.id} className="overflow-hidden py-2">
                                    <CardContent className="p-3">
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${getStatusColor(task.status)}`}
                                            >
                                                {getStatusIcon(task.status)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{task.title}</p>
                                                <div className="mt-1 flex items-center justify-between">
                                                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                                        {task.priority}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                                                    </span>
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
                    <h3 className="mb-4 text-lg font-semibold">Quick Stats</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Completed</span>
                            <span className="font-semibold">{todaysTasks.filter((t) => t.status === 'completed').length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">In Progress</span>
                            <span className="font-semibold">{todaysTasks.filter((t) => t.status === 'in-progress').length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Pending</span>
                            <span className="font-semibold">{todaysTasks.filter((t) => t.status === 'todo').length}</span>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Summary */}
                <div>
                    <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
                    <div className="space-y-2">
                        <div className="text-sm">
                            <div className="font-medium">Project updated</div>
                            <div className="text-muted-foreground">2 hours ago</div>
                        </div>
                        <div className="text-sm">
                            <div className="font-medium">New task added</div>
                            <div className="text-muted-foreground">4 hours ago</div>
                        </div>
                        <div className="text-sm">
                            <div className="font-medium">Team member joined</div>
                            <div className="text-muted-foreground">1 day ago</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
