import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';
import {
    Briefcase,
    CheckCircle,
    FileText as FileTextIcon,
    GitBranch,
    GitCommit,
    GitFork,
    GitMerge,
    GitPullRequest,
    MessageSquare,
    PlusCircle,
} from 'lucide-react';
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

const Activity = ({ activities = [], onMarkAsRead, onMarkAllAsRead }) => {
    const [notificationTab, setNotificationTab] = useState('all');
    const unreadCount = activities.filter((activity) => !activity.read).length;

    const filteredActivities = useMemo(() => {
        if (notificationTab === 'all') return activities;
        if (notificationTab === 'unread') return activities.filter((activity) => !activity.read);
        return activities.filter((activity) => activity.type.includes(notificationTab));
    }, [activities, notificationTab]);

    const filters = [
        { value: 'all', label: 'All' },
        { value: 'unread', label: 'Unread' },
        { value: 'task_creation', label: 'Tasks' },
        { value: 'task_status_update', label: 'Status' },
        { value: 'task_comment', label: 'Comments' },
        { value: 'note_creation', label: 'Notes' },
        { value: 'project_creation', label: 'Project' },
        { value: 'github', label: 'GitHub' },
    ];

    const markAllAsRead = () => {
        onMarkAllAsRead?.();
    };

    const markAsRead = (activityId) => {
        onMarkAsRead?.(activityId);
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
            case 'github_push':
                return <GitCommit className="h-3.5 w-3.5 text-muted-foreground" />;
            case 'github_pr':
            case 'github_pull_request':
                return <GitPullRequest className="h-3.5 w-3.5 text-muted-foreground" />;
            case 'github_merge':
                return <GitMerge className="h-3.5 w-3.5 text-muted-foreground" />;
            case 'github_fork':
                return <GitFork className="h-3.5 w-3.5 text-muted-foreground" />;
            default:
                return <CheckCircle className="h-3.5 w-3.5 text-muted-foreground" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Filter Tabs */}
            <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
                <Tabs defaultValue="all" onValueChange={setNotificationTab} value={notificationTab} className="min-w-0 flex-1">
                    <TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-muted/60 p-1.5">
                        {filters.map((filter) => (
                            <TabsTrigger key={filter.value} value={filter.value} className="relative h-10 px-4 text-sm">
                                {filter.label}
                                {filter.value === 'unread' && unreadCount > 0 && (
                                    <span className="ml-1.5 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                                        {unreadCount}
                                    </span>
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                <Button variant="outline" className="h-10 self-start whitespace-nowrap px-4 md:self-center" onClick={markAllAsRead}>
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
                            {/* <Avatar className="h-10 w-10 flex-shrink-0">
                                <AvatarImage src={activity.user?.image ? `/storage/${activity.user.image}` : null} alt={activity.user?.name} />
                                <AvatarFallback>{activity.user?.name?.substring(0, 2).toUpperCase() || '??'}</AvatarFallback>
                            </Avatar> */}
                            <Avatar className="h-10 w-10" image={activity.user?.image} name={activity.user?.name} onlineCircleClass="hidden" />
                            <div className="flex-1">
                                <div className="flex flex-wrap items-baseline gap-1">
                                    <span className="font-medium">{activity.user?.name || 'Unknown User'}</span>
                                    <span className="text-muted-foreground">{activity.action}</span>
                                    {activity.target && !activity.type.startsWith('github') && (
                                        <span className="font-medium text-primary-foreground/80 dark:text-primary-foreground/90">
                                            {activity.target}
                                        </span>
                                    )}
                                    {activity.type.startsWith('github') && activity.target && (
                                        <span className="flex items-center gap-1 font-medium text-primary-foreground/80 dark:text-primary-foreground/90">
                                            {activity.target}
                                            {getActivityIcon(activity.type)}
                                        </span>
                                    )}
                                </div>

                                {/* GitHub Commit Details */}
                                {activity.type.startsWith('github') && activity.details && (
                                    <div className="mt-2 rounded-md bg-muted/50 p-3 text-sm">
                                        <div className="flex flex-wrap items-center gap-1 text-muted-foreground">
                                            <GitBranch className="h-3.5 w-3.5" />
                                            {activity.details.repo && <span>{activity.details.repo}</span>}
                                            {activity.details.branch && (
                                                <>
                                                    <span>•</span>
                                                    <span>{activity.details.branch}</span>
                                                </>
                                            )}
                                            {activity.details.commitHash && (
                                                <>
                                                    <span>•</span>
                                                    <span>{activity.details.commitHash}</span>
                                                </>
                                            )}
                                            {activity.details.status && (
                                                <Badge variant="outline" className="h-5 border-none bg-muted text-[10px]">
                                                    {activity.details.status}
                                                </Badge>
                                            )}
                                        </div>
                                        {activity.details.url && (
                                            <a
                                                href={activity.details.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-1 inline-flex text-xs font-medium text-primary hover:underline"
                                            >
                                                View on GitHub
                                            </a>
                                        )}
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
