import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    CheckCircle,
    GitBranch,
    GitCommit,
    GitPullRequest,
    MessageSquare
} from 'lucide-react';

const Activity = ({ activities = [] }) => {
    const [notificationTab, setNotificationTab] = useState("all");
    const [unreadCount, setUnreadCount] = useState(activities.filter((activity) => !activity.read).length);

    const filteredActivities = useMemo(() => {
        if (notificationTab === "all") return activities;
        if (notificationTab === "unread") return activities.filter((activity) => !activity.read);
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
            case 'github_commit':
                return <GitCommit className="h-3.5 w-3.5 text-muted-foreground" />;
            case 'github_pr':
                return <GitPullRequest className="h-3.5 w-3.5 text-muted-foreground" />;
            case 'comment':
                return <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />;
            default:
                return <CheckCircle className="h-3.5 w-3.5 text-muted-foreground" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Filter Tabs */}
            <div className="flex items-center justify-between">
                <Tabs
                    defaultValue="all"
                    onValueChange={setNotificationTab}
                    value={notificationTab}
                    className="w-full"
                >
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
                        <TabsTrigger value="task">Tasks</TabsTrigger>
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
                    <div className="text-center py-8 text-muted-foreground">
                        No activities to display
                    </div>
                ) : (
                    filteredActivities.map((activity) => (
                        <div
                            key={activity.id}
                            className={`flex gap-3 p-4 rounded-lg border ${
                                !activity.read 
                                    ? "bg-primary/5 border-primary/20" 
                                    : "bg-card"
                            }`}
                        >
                            <Avatar className="h-10 w-10 flex-shrink-0">
                                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                                <AvatarFallback>{activity.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-baseline gap-1 flex-wrap">
                                    <span className="font-medium">{activity.user.name}</span>
                                    <span className="text-muted-foreground">{activity.action}</span>
                                    <span className="font-medium">
                                        {activity.type === "github_commit" || activity.type === "github_pr" ? (
                                            <span className="flex items-center gap-1">
                                                {activity.target}
                                                {getActivityIcon(activity.type)}
                                            </span>
                                        ) : (
                                            activity.target
                                        )}
                                    </span>
                                </div>

                                {/* GitHub Commit Details */}
                                {activity.type === "github_commit" && activity.details && (
                                    <div className="mt-2 text-sm bg-muted/50 p-3 rounded-md">
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
                                {activity.type === "github_pr" && activity.details && (
                                    <div className="mt-2 text-sm bg-muted/50 p-3 rounded-md">
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <span>{activity.details.repo}</span>
                                            <span>•</span>
                                            <span>{activity.details.prNumber}</span>
                                            <Badge
                                                variant="outline"
                                                className="text-[10px] h-4 bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 border-none"
                                            >
                                                {activity.details.status}
                                            </Badge>
                                        </div>
                                    </div>
                                )}

                                {/* Comment Details */}
                                {activity.type === "comment" && activity.details && (
                                    <div className="mt-2 text-sm bg-muted/50 p-3 rounded-md">
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <MessageSquare className="h-3.5 w-3.5" />
                                            <span>Comment</span>
                                        </div>
                                        <div className="mt-1">{activity.details.comment}</div>
                                    </div>
                                )}

                                <div className="text-xs text-muted-foreground mt-2">
                                    {new Date(activity.timestamp).toLocaleString(undefined, {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        day: "numeric",
                                        month: "short",
                                    })}
                                </div>
                            </div>

                            {!activity.read && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 self-start"
                                    onClick={() => markAsRead(activity.id)}
                                >
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
