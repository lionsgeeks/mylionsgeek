import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    TrendingUp, 
    FolderOpen, 
    CheckCircle, 
    Clock, 
    AlertCircle,
    Users,
    File,
    MessageSquare,
    Activity,
    Search,
    Filter,
    SortAsc,
    SortDesc
} from 'lucide-react';
import {
    BarChart, Bar, PieChart, Pie, LineChart, Line, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

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
    tasks_count: number;
    users_count: number;
}

interface ProjectDashboardProps {
    projects: Project[];
    stats: {
        total: number;
        active: number;
        completed: number;
        on_hold: number;
        cancelled: number;
    };
    onSearch: (term: string) => void;
    onFilter: (status: string) => void;
    onSort: (field: string, order: string) => void;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
    projects,
    stats,
    onSearch,
    onFilter,
    onSort
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    const handleSearch = () => {
        onSearch(searchTerm);
    };

    const handleFilter = (status: string) => {
        setStatusFilter(status);
        onFilter(status);
    };

    const handleSort = (field: string) => {
        const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(field);
        setSortOrder(newOrder);
        onSort(field, newOrder);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            case 'on_hold': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="h-4 w-4" />;
            case 'completed': return <CheckCircle className="h-4 w-4" />;
            case 'on_hold': return <Clock className="h-4 w-4" />;
            case 'cancelled': return <AlertCircle className="h-4 w-4" />;
            default: return <FolderOpen className="h-4 w-4" />;
        }
    };

    const chartData = [
        { name: 'Active', value: stats.active, color: '#10b981' },
        { name: 'Completed', value: stats.completed, color: '#3b82f6' },
        { name: 'On Hold', value: stats.on_hold, color: '#f59e0b' },
        { name: 'Cancelled', value: stats.cancelled, color: '#ef4444' }
    ];

    const recentProjects = projects
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

    const activeProjects = projects.filter(p => p.status === 'active');

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">
                            All projects in system
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently in progress
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
                        <p className="text-xs text-muted-foreground">
                            Successfully finished
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">On Hold</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.on_hold}</div>
                        <p className="text-xs text-muted-foreground">
                            Temporarily paused
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Project Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Project Progress Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Projects */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Projects</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentProjects.map((project) => (
                            <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-lg bg-[var(--color-alpha)]/20 flex items-center justify-center">
                                        <FolderOpen className="h-6 w-6 text-[var(--color-alpha)]" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">{project.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            by {project.creator.name}
                                        </p>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <Badge className={getStatusColor(project.status)}>
                                                {getStatusIcon(project.status)}
                                                <span className="ml-1 capitalize">{project.status.replace('_', ' ')}</span>
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {project.tasks_count} tasks
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-4">
                                    {project.is_updated && (
                                        <div className="flex items-center space-x-1 text-[var(--color-alpha)]">
                                            <Activity className="h-4 w-4 animate-pulse" />
                                            <span className="text-sm font-medium">Updated</span>
                                        </div>
                                    )}
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{project.progress_percentage || 0}%</p>
                                        <Progress value={project.progress_percentage || 0} className="w-20 h-2" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Active Projects Progress */}
            <Card>
                <CardHeader>
                    <CardTitle>Active Projects Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {activeProjects.map((project) => (
                            <div key={project.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium">{project.name}</h3>
                                    <span className="text-sm text-muted-foreground">
                                        {project.progress_percentage || 0}%
                                    </span>
                                </div>
                                <Progress value={project.progress_percentage || 0} className="h-2" />
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{project.tasks_count} tasks</span>
                                    <span>{project.users_count} members</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProjectDashboard;
