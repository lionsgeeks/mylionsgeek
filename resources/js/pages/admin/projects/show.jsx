import React, { useState, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { isToday, parseISO } from 'date-fns';

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
import ProjectAttachments from './partials/ProjectAttachments';

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


const ProjectShow = ({ project, teamMembers, tasks, attachments , notes }) => {
    const [activeTab, setActiveTab] = useState("overview");
    const [chatMessages, setChatMessages] = useState(messages);
    console.log(notes)
    const todaysTasks = useMemo(() => {
        const today = new Date();
        return tasks.filter(task => task.due_date && isToday(parseISO(task.due_date)));
    }, [tasks]);

    // Collect all task attachments
    const allTaskAttachments = useMemo(() => {
        const taskAttachments = [];
        tasks.forEach(task => {
            if (task.attachments && Array.isArray(task.attachments)) {
                task.attachments.forEach(attachment => {
                    taskAttachments.push({
                        ...attachment,
                        task_id: task.id,
                        task_title: task.title
                    });
                });
            }
        });
        return taskAttachments;
    }, [tasks]);

    const recentActivities = useMemo(() => {
        const activities = [];

        // Project creation
        activities.push({
            id: `project-created-${project.id}`,
            type: 'project_creation',
            user: project.creator,
            action: 'created the project',
            target: project.name,
            timestamp: project.created_at,
            read: false,
        });

        // Task-related activities
        tasks.forEach(task => {
            // Task creation
            activities.push({
                id: `task-created-${task.id}`,
                type: 'task_creation',
                user: task.creator,
                action: 'created task',
                target: task.title,
                timestamp: task.created_at,
                read: false,
            });

            // Task status updates
            if (task.status !== 'todo') {
                activities.push({
                    id: `task-status-${task.id}`,
                    type: 'task_status_update',
                    user: task.creator, // Assuming the creator is the one updating for simplicity for now
                    action: `updated task status to ${task.status}`,
                    target: task.title,
                    timestamp: task.updated_at,
                    read: false,
                });
            }

            // Task comments
            (task.comments || []).forEach(comment => {
                activities.push({
                    id: `task-comment-${comment.id}`,
                    type: 'task_comment',
                    user: comment.user,
                    action: 'commented on task',
                    target: task.title,
                    timestamp: comment.created_at,
                    read: false,
                });
            });
        });

        // Project notes
        (project.notes || []).forEach(note => {
            activities.push({
                id: `note-created-${note.id}`,
                type: 'note_creation',
                user: note.user,
                action: 'added a note',
                target: note.title,
                timestamp: note.created_at,
                read: false,
            });
        });

        // Sort by timestamp descending
        return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }, [project, tasks]);

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
                    tasks={tasks}
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
                                    <TabsTrigger value="files">Attachments</TabsTrigger>
                                    {/* <TabsTrigger value="attachments">Attachments</TabsTrigger> */}
                                    <TabsTrigger value="notes">Notes</TabsTrigger>
                                    <TabsTrigger value="team">Team</TabsTrigger>
                                    <TabsTrigger value="activity" className="relative">
                                        Activity
                                        {recentActivities.filter(a => !a.read).length > 0 && (
                                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-alpha text-[10px] text-primary-foreground">
                                                {recentActivities.filter(a => !a.read).length}
                                            </span>
                                        )}
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="mt-6">
                                    <Overview
                                        project={project}
                                        teamMembers={teamMembers}
                                        tasks={tasks}
                                    />
                                </TabsContent>

                                <TabsContent value="tasks" className="mt-6">
                                    <Tasks
                                        tasks={tasks}
                                        teamMembers={teamMembers}
                                        projectId={project.id}
                                    />
                                </TabsContent>

                                <TabsContent value="files" className="mt-6">
                                    <Files
                                        projectAttachments={attachments}
                                        taskAttachments={allTaskAttachments}
                                        projectId={project.id}
                                    />
                                </TabsContent>

                                {/* <TabsContent value="attachments" className="mt-6">
                                    <ProjectAttachments attachments={attachments} />
                                </TabsContent> */}

                                <TabsContent value="notes" className="mt-6">
                                    <Notes notes={notes} projectId={project.id} />
                                </TabsContent>

                                <TabsContent value="activity" className="mt-6">
                                    <Activity activities={recentActivities} />
                                </TabsContent>

                                <TabsContent value="team" className="mt-6">
                                    <Team teamMembers={teamMembers} projectId={project.id} />
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
