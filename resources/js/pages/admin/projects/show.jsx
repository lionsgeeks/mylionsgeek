import React, { useState, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import partial components
import ProjectHeader from './partials/ProjectHeader';
import Calendar from './partials/Calendar';
import Overview from './partials/Overview';
import Tasks from './partials/Tasks';
import Files from './partials/Files';
import Notes from './partials/Notes';
import Activity from './partials/Activity';
import Team from './partials/Team';
import Sidebar from './partials/Sidebar';
import Chat from './partials/Chat';

// Sample data
const events = [
    {
        title: "Project Meeting",
        start: "2024-02-15T10:00:00",
        end: "2024-02-15T12:00:00",
        progress: 75,
        backgroundColor: "#3b82f6",
    },
    {
        title: "Code Review",
        start: "2024-02-16T14:00:00",
        end: "2024-02-16T16:00:00",
        backgroundColor: "#10b981",
        progress: 50,
    },
    {
        title: "Sprint Planning",
        start: "2024-02-17T09:00:00",
        end: "2024-02-17T11:00:00",
        backgroundColor: "#f59e0b",
    },
];

const sampleTasks = [
    {
        id: "1",
        title: "Implement user authentication",
        description: "Create a secure authentication system with JWT tokens",
        status: "completed",
        priority: "high",
        assignee: {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        dueDate: "2024-02-15",
        completedDate: "2024-02-14",
        project: "Project Alpha",
        tags: ["backend", "security"],
        progress: 100,
    },
    {
        id: "2",
        title: "Design landing page",
        description: "Create a modern, responsive landing page",
        status: "in-progress",
        priority: "medium",
        assignee: {
            id: "2",
            name: "Jane Smith",
            email: "jane@example.com",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        dueDate: "2024-02-20",
        project: "Project Alpha",
        tags: ["design", "frontend"],
        progress: 65,
    },
    {
        id: "3",
        title: "Database optimization",
        description: "Optimize database queries and add proper indexing",
        status: "todo",
        priority: "low",
        assignee: {
            id: "3",
            name: "Mike Johnson",
            email: "mike@example.com",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        dueDate: "2024-02-25",
        project: "Project Alpha",
        tags: ["database", "performance"],
        progress: 0,
    },
];

const notes = [
    {
        id: "1",
        title: "Project Ideas",
        content: "- Focus on user experience\n- Implement dark mode\n- Add real-time notifications\n- Optimize for mobile",
        color: "bg-amber-50 dark:bg-amber-950/50",
        createdAt: "2024-02-15T12:00:00",
        updatedAt: "2024-02-15T14:30:00",
    },
    {
        id: "2",
        title: "Meeting Notes: Client Call",
        content: "- Client wants to emphasize performance\n- Budget concerns for Q1\n- Need to prepare timeline by Friday\n- Follow up with design team",
        color: "bg-emerald-50 dark:bg-emerald-950/50",
        createdAt: "2024-02-12T09:00:00",
        updatedAt: "2024-02-12T10:15:00",
    },
];

const messages = [
    {
        id: "1",
        user: {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        content: "Hey team, I've completed the authentication system",
        timestamp: "2024-02-15T09:32:00",
    },
    {
        id: "2",
        user: {
            id: "2",
            name: "Jane Smith",
            email: "jane@example.com",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        content: "Great work! I'm working on the landing page design",
        timestamp: "2024-02-15T10:15:00",
    },
    {
        id: "3",
        user: {
            id: "3",
            name: "Mike Johnson",
            email: "mike@example.com",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        content: "Let me know if you need any help with the database optimization",
        timestamp: "2024-02-15T10:45:00",
    },
];

const todaysTasks = [
    {
        id: "1",
        title: "Review authentication code",
        priority: "high",
        status: "todo",
        dueTime: "5:00 PM",
    },
    {
        id: "2",
        title: "Update project documentation",
        priority: "medium",
        status: "in-progress",
        dueTime: "3:00 PM",
    },
    {
        id: "3",
        title: "Client feedback review",
        priority: "high",
        status: "todo",
        dueTime: "4:30 PM",
    },
];

const recentActivities = [
    {
        id: "1",
        type: "task_update",
        user: {
            id: "1",
            name: "John Doe",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        action: "marked task as completed",
        target: "Implement user authentication",
        timestamp: "2024-02-15T14:30:00",
        read: false,
    },
    {
        id: "2",
        type: "github_commit",
        user: {
            id: "2",
            name: "Jane Smith",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        action: "pushed 2 commits to",
        target: "feature/landing-page",
        details: {
            repo: "project-alpha",
            commitHash: "a1b2c3d",
            message: "Update landing page layout and add responsive styles",
        },
        timestamp: "2024-02-15T13:45:00",
        read: true,
    },
    {
        id: "3",
        type: "task_update",
        user: {
            id: "3",
            name: "Mike Johnson",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        action: "started working on",
        target: "Database optimization",
        timestamp: "2024-02-15T11:20:00",
        read: false,
    },
];

const files = [
    {
        id: "1",
        name: "Project Design System.fig",
        type: "fig",
        size: "3.8 MB",
        date: "15 FEB 2024",
        uploadedBy: {
            id: "2",
            name: "Jane Smith",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        modified: "2024-02-15",
    },
    {
        id: "2",
        name: "Project Requirements.pdf",
        type: "pdf",
        size: "1.9 KB",
        date: "12 FEB 2024",
        uploadedBy: {
            id: "1",
            name: "John Doe",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        modified: "2024-02-12",
    },
];

const ProjectShow = ({ project, teamMembers, tasks, attachments }) => {
    const [activeTab, setActiveTab] = useState("overview");
    const [chatMessages, setChatMessages] = useState(messages);

    const handleSendMessage = (message) => {
        const newMessage = {
            id: chatMessages.length + 1,
            user: {
                id: "current-user",
                name: "You",
                email: "you@example.com",
                avatar: "/placeholder.svg?height=40&width=40",
            },
            content: message,
            timestamp: new Date().toISOString(),
        };
        setChatMessages([...chatMessages, newMessage]);
    };

    return (
        <AppLayout>
            <Head title={`${project.name} - Project Details`} />
            <div className="flex flex-col min-h-screen">
                {/* Project Header with Banner */}
                <ProjectHeader
                    project={project}
                    teamMembers={teamMembers}
                />

                {/* Main Content with Sidebar */}
                <div className="flex flex-col lg:flex-row flex-1">
                    {/* Main Content */}
                    <div className="flex-1 max-w-[1200px] mx-auto w-full p-6">
                        {/* Calendar Section */}
                        <Calendar events={events} />

                        {/* Navigation Tabs */}
                        <div className="mb-6 py-3">
                            <Tabs defaultValue="overview" onValueChange={setActiveTab} value={activeTab}>
                                <TabsList className="grid grid-cols-6 w-full">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="tasks">Tasks</TabsTrigger>
                                    <TabsTrigger value="files">Files</TabsTrigger>
                                    <TabsTrigger value="notes">Notes</TabsTrigger>
                                    <TabsTrigger value="activity" className="relative">
                                        Activity
                                        {recentActivities.filter(a => !a.read).length > 0 && (
                                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                                                {recentActivities.filter(a => !a.read).length}
                                            </span>
                                        )}
                                    </TabsTrigger>
                        <TabsTrigger value="team">Team</TabsTrigger>
                    </TabsList>

                                <TabsContent value="overview" className="mt-6">
                                    <Overview
                            project={project}
                            teamMembers={teamMembers}
                                        tasks={sampleTasks}
                        />
                    </TabsContent>

                                <TabsContent value="tasks" className="mt-6">
                                    <Tasks
                                        tasks={sampleTasks}
                            teamMembers={teamMembers}
                        />
                    </TabsContent>

                                <TabsContent value="files" className="mt-6">
                                    <Files files={files} />
                                </TabsContent>

                                <TabsContent value="notes" className="mt-6">
                                    <Notes notes={notes} />
                                </TabsContent>

                                <TabsContent value="activity" className="mt-6">
                                    <Activity activities={recentActivities} />
                    </TabsContent>

                                <TabsContent value="team" className="mt-6">
                                    <Team teamMembers={teamMembers} />
                    </TabsContent>
                </Tabs>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <Sidebar todaysTasks={todaysTasks} />
                </div>

                {/* Floating Chat */}
                <Chat
                    messages={chatMessages}
                    onSendMessage={handleSendMessage}
                />
            </div>
        </AppLayout>
    );
};

export default ProjectShow;