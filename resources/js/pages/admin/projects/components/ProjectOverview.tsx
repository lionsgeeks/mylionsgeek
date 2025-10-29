import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Activity, AlertCircle, Calendar, CheckCircle, Clock, File, MessageSquare, TrendingUp, Users } from 'lucide-react';
import React, { useMemo } from 'react';

interface Project {
    id: number;
    name: string;
    description?: string;
    status: 'active' | 'completed' | 'on_hold' | 'cancelled';
    start_date?: string;
    end_date?: string;
    created_at: string;
    last_activity?: string;
    is_updated: boolean;
    creator: { name: string };
    progress_percentage?: number;
}

interface Task {
    id: number;
    title: string;
    status: 'todo' | 'in_progress' | 'review' | 'completed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_date?: string;
    created_at: string;
}

interface ProjectOverviewProps {
    project: Project;
    tasks: Task[];
    teamMembers: Array<{ id: number; name: string }>;
    attachments: Array<{ id: number; mime_type: string; created_at: string }>;
    comments: Array<{ id: number; created_at: string }>;
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ project, tasks, teamMembers, attachments, comments }) => {
    const projectStats = useMemo(() => {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((t) => t.status === 'completed').length;
        const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
        const todoTasks = tasks.filter((t) => t.status === 'todo').length;
        const overdueTasks = tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length;

        const totalFiles = attachments.length;
        const imageFiles = attachments.filter((a) => a.mime_type.startsWith('image/')).length;
        const documentFiles = attachments.filter((a) => a.mime_type.startsWith('application/') || a.mime_type === 'application/pdf').length;

        const totalComments = comments.length;
        const recentComments = comments.filter((c) => new Date(c.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;

        const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
            totalTasks,
            completedTasks,
            inProgressTasks,
            todoTasks,
            overdueTasks,
            totalFiles,
            imageFiles,
            documentFiles,
            totalComments,
            recentComments,
            progressPercentage,
        };
    }, [tasks, attachments, comments]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            case 'on_hold':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <Activity className="h-4 w-4" />;
            case 'completed':
                return <CheckCircle className="h-4 w-4" />;
            case 'on_hold':
                return <Clock className="h-4 w-4" />;
            case 'cancelled':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <Activity className="h-4 w-4" />;
        }
    };

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

    const recentTasks = tasks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

    const upcomingDeadlines = tasks
        .filter((t) => t.due_date && new Date(t.due_date) > new Date())
        .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
        .slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Project Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">{project.name}</h1>
                            <p className="text-muted-foreground">{project.description}</p>
                            <div className="mt-2 flex items-center space-x-4">
                                <Badge className={getStatusColor(project.status)}>
                                    {getStatusIcon(project.status)}
                                    <span className="ml-1 capitalize">{project.status.replace('_', ' ')}</span>
                                </Badge>
                                <span className="text-sm text-muted-foreground">Created by {project.creator.name}</span>
                                <span className="text-sm text-muted-foreground">{teamMembers.length} members</span>
                            </div>
                        </div>
                        {project.is_updated && (
                            <div className="flex items-center space-x-2 text-[var(--color-alpha)]">
                                <Activity className="h-4 w-4 animate-pulse" />
                                <span className="text-sm font-medium">Recently Updated</span>
                            </div>
                        )}
                    </div>
                </CardHeader>
            </Card>

            {/* Project Statistics */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium">Total Tasks</p>
                                <p className="text-2xl font-bold">{projectStats.totalTasks}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="text-sm font-medium">Progress</p>
                                <p className="text-2xl font-bold">{projectStats.progressPercentage}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Users className="h-5 w-5 text-purple-600" />
                            <div>
                                <p className="text-sm font-medium">Team Members</p>
                                <p className="text-2xl font-bold">{teamMembers.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <File className="h-5 w-5 text-orange-600" />
                            <div>
                                <p className="text-sm font-medium">Files</p>
                                <p className="text-2xl font-bold">{projectStats.totalFiles}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Progress Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Project Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span>Overall Progress</span>
                            <span>{projectStats.progressPercentage}%</span>
                        </div>
                        <Progress value={projectStats.progressPercentage} className="h-2" />

                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{projectStats.completedTasks}</p>
                                <p className="text-sm text-muted-foreground">Completed</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">{projectStats.inProgressTasks}</p>
                                <p className="text-sm text-muted-foreground">In Progress</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-600">{projectStats.todoTasks}</p>
                                <p className="text-sm text-muted-foreground">To Do</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-600">{projectStats.overdueTasks}</p>
                                <p className="text-sm text-muted-foreground">Overdue</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Recent Tasks */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentTasks.map((task) => (
                                <div key={task.id} className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
                                    <div className="flex-1">
                                        <p className="font-medium">{task.title}</p>
                                        <div className="mt-1 flex items-center space-x-2">
                                            <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                                            <Badge variant="outline">{task.status.replace('_', ' ')}</Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming Deadlines */}
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Deadlines</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {upcomingDeadlines.map((task) => (
                                <div key={task.id} className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
                                    <Calendar className="h-4 w-4 text-blue-600" />
                                    <div className="flex-1">
                                        <p className="font-medium">{task.title}</p>
                                        <p className="text-sm text-muted-foreground">Due {new Date(task.due_date!).toLocaleDateString()}</p>
                                    </div>
                                    <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Activity Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-lg bg-blue-50 p-4 text-center">
                            <MessageSquare className="mx-auto mb-2 h-8 w-8 text-blue-600" />
                            <p className="text-2xl font-bold text-blue-600">{projectStats.totalComments}</p>
                            <p className="text-sm text-muted-foreground">Total Comments</p>
                        </div>

                        <div className="rounded-lg bg-green-50 p-4 text-center">
                            <File className="mx-auto mb-2 h-8 w-8 text-green-600" />
                            <p className="text-2xl font-bold text-green-600">{projectStats.imageFiles}</p>
                            <p className="text-sm text-muted-foreground">Images</p>
                        </div>

                        <div className="rounded-lg bg-purple-50 p-4 text-center">
                            <File className="mx-auto mb-2 h-8 w-8 text-purple-600" />
                            <p className="text-2xl font-bold text-purple-600">{projectStats.documentFiles}</p>
                            <p className="text-sm text-muted-foreground">Documents</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProjectOverview;
