import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';
import { Briefcase, CheckCircle, FileText as FileTextIcon, GitBranch, GitCommit, GitPullRequest, MessageSquare, PlusCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

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

const Activity = ({ activities = [] }) => {
    const [notificationTab, setNotificationTab] = useState('all');
    const [unreadCount, setUnreadCount] = useState(activities.filter((activity) => !activity.read).length);

    const filteredActivities = useMemo(() => {
        if (notificationTab === 'all') return activities;
        if (notificationTab === 'unread') return activities.filter((activity) => !activity.read);
        return activities.filter((activity) => activity.type.includes(notificationTab));
    }, [activities, notificationTab]);

    const markAllAsRead = () => {
        setUnreadCount(0);
    };

    const markAsRead = (activityId) => {
        setUnreadCount((prev) => Math.max(0, prev - 1));
        // In a real app, you would update the activity as read
        console.log('Marking activity as read:', activityId);
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'project_creation':
                return <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />;
            case 'task_creation':
                return <PlusCircle className="h-3.5 w-3.5 text-muted-foreground" />;
            case 'task_status_update':
                return <CheckCircle className="h-3.5 w-3.5 text-muted-foreground" />;
            case 'task_comment':
                return <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />;
            case 'note_creation':
                return <FileTextIcon className="h-3.5 w-3.5 text-muted-foreground" />;
            case 'github_commit':
                return <GitCommit className="h-3.5 w-3.5 text-muted-foreground" />;
            case 'github_pr':
                return <GitPullRequest className="h-3.5 w-3.5 text-muted-foreground" />;
            default:
                return <CheckCircle className="h-3.5 w-3.5 text-muted-foreground" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Filter Tabs */}
            <div className="flex items-center justify-between">
                <Tabs defaultValue="all" onValueChange={setNotificationTab} value={notificationTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="unread" className="relative">
                            Unread
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                                    {unreadCount}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="task_creation">Task Creation</TabsTrigger>
                        <TabsTrigger value="task_status_update">Task Status</TabsTrigger>
                        <TabsTrigger value="task_comment">Comments</TabsTrigger>
                        <TabsTrigger value="note_creation">Notes</TabsTrigger>
                        <TabsTrigger value="project_creation">Project</TabsTrigger>
                        <TabsTrigger value="github">GitHub</TabsTrigger>
                    </TabsList>
                </Tabs>

                <Button variant="outline" size="sm" className="ml-4 whitespace-nowrap" onClick={markAllAsRead}>
                    Mark All Read
                </Button>
            </div>

            {/* Activities List */}
            <div className="space-y-4">
                {filteredActivities.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">No activities to display</div>
                ) : (
                    filteredActivities.map((activity) => (
                        <div
                            key={activity.id}
                            className={`flex gap-3 rounded-lg border p-4 ${!activity.read ? 'border-primary/20 bg-primary/5' : 'bg-card'}`}
                        >
                            <Avatar className="h-10 w-10 flex-shrink-0">
                                <AvatarImage src={activity.user?.image ? `/storage/${activity.user.image}` : null} alt={activity.user?.name} />
                                <AvatarFallback>{activity.user?.name?.substring(0, 2).toUpperCase() || '??'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex flex-wrap items-baseline gap-1">
                                    <span className="font-medium">{activity.user?.name || 'Unknown User'}</span>
                                    <span className="text-muted-foreground">{activity.action}</span>
                                    {activity.target && !activity.type.startsWith('github') && (
                                        <span className="font-medium text-primary-foreground/80 dark:text-primary-foreground/90">
                                            {activity.target}
                                        </span>
                                    )}
                                    {activity.type.startsWith('github') && (
                                        <span className="flex items-center gap-1 font-medium">
                                            {activity.target}
                                            {getActivityIcon(activity.type)}
                                        </span>
                                    )}
                                </div>

                                {/* GitHub Commit Details */}
                                {activity.type === 'github_commit' && activity.details && (
                                    <div className="mt-2 rounded-md bg-muted/50 p-3 text-sm">
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <GitBranch className="h-3.5 w-3.5" />
                                            <span>{activity.details.repo}</span>
                                            <span>•</span>
                                            <span>{activity.details.commitHash}</span>
                                        </div>
                                        <div className="mt-1 font-medium">{activity.details.message}</div>
                                    </div>
                                )}

                                {/* GitHub PR Details */}
                                {activity.type === 'github_pr' && activity.details && (
                                    <div className="mt-2 rounded-md bg-muted/50 p-3 text-sm">
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <span>{activity.details.repo}</span>
                                            <span>•</span>
                                            <span>{activity.details.prNumber}</span>
                                            <Badge
                                                variant="outline"
                                                className="h-4 border-none bg-green-100 text-[10px] text-green-800 dark:bg-green-950 dark:text-green-300"
                                            >
                                                {activity.details.status}
                                            </Badge>
                                        </div>
                                    </div>
                                )}

                                {/* Comment Details */}
                                {activity.type === 'comment' && activity.details && (
                                    <div className="mt-2 rounded-md bg-muted/50 p-3 text-sm">
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <MessageSquare className="h-3.5 w-3.5" />
                                            <span>Comment</span>
                                        </div>
                                        <div className="mt-1">{activity.details.comment}</div>
                                    </div>
                                )}

                                <div className="mt-2 text-xs text-muted-foreground">{formatRelativeTime(activity.timestamp)}</div>
                            </div>

                            {!activity.read && (
                                <Button variant="ghost" size="sm" className="h-8 w-8 self-start p-0" onClick={() => markAsRead(activity.id)}>
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="sr-only">Mark as read</span>
                                </Button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Activity;
