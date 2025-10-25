import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, CheckCircle, Clock, Users, TrendingUp, Target, Calendar, FileText } from 'lucide-react';

const Overview = ({ project, teamMembers, tasks = [] }) => {
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const totalTasks = tasks.length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Main Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className='bg-background/30'>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTasks}</div>
                        <p className="text-xs text-muted-foreground">
                            +2 from last week
                        </p>
                    </CardContent>
                </Card>

                <Card className='bg-background/30'>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedTasks}</div>
                        <p className="text-xs text-muted-foreground">
                            {progressPercentage}% completion rate
                        </p>
                    </CardContent>
                </Card>

                <Card className='bg-background/30'>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inProgressTasks}</div>
                        <p className="text-xs text-muted-foreground">
                            Active tasks
                        </p>
                    </CardContent>
                </Card>

                <Card className='bg-background/30'>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{teamMembers?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Active collaborators
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Progress Overview */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className='bg-background/30'>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Project Progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Overall Progress</span>
                                <span className="text-sm text-muted-foreground">{progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                    className="bg-[var(--color-alpha)] h-2 rounded-full transition-all duration-300" 
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="text-muted-foreground">Completed</div>
                                    <div className="font-semibold">{completedTasks} tasks</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Remaining</div>
                                    <div className="font-semibold">{totalTasks - completedTasks} tasks</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className='bg-background/30'>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Project Timeline
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Start Date</span>
                                <span className="text-sm text-muted-foreground">
                                    {new Date(project.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Due Date</span>
                                <span className="text-sm text-muted-foreground">
                                    {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'Not set'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Days Active</span>
                                <span className="text-sm text-muted-foreground">
                                    {Math.ceil((new Date() - new Date(project.created_at)) / (1000 * 60 * 60 * 24))} days
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card className='bg-background/30'>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Project created</p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(project.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">First task added</p>
                                <p className="text-xs text-muted-foreground">2 days ago</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Team member joined</p>
                                <p className="text-xs text-muted-foreground">1 day ago</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Overview;
