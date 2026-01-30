import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { isToday, parseISO } from 'date-fns';
import { useMemo, useState } from 'react';

// Import partial components
import Activity from './partials/Activity';
import Calendar from './partials/Calendar';
import Chat from './partials/Chat';
import Files from './partials/Files';
import Notes from './partials/Notes';
import Overview from './partials/Overview';
import ProjectHeader from './partials/ProjectHeader';
import Sidebar from './partials/Sidebar';
import Tasks from './partials/Tasks';
import Team from './partials/Team';

// Helper function to get priority color
const getPriorityColor = (priority) => {
    const colorMap = {
        urgent: '#ef4444', // red
        high: '#f59e0b', // amber
        medium: '#3b82f6', // blue
        low: '#10b981', // green
    };
    return colorMap[priority] || '#6b7280'; // default gray
};

const sampleTasks = [
    {
        id: '1',
        title: 'Implement user authentication',
        description: 'Create a secure authentication system with JWT tokens',
        status: 'completed',
        priority: 'high',
        assignee: {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            avatar: '/placeholder.svg?height=40&width=40',
        },
        dueDate: '2024-02-15',
        completedDate: '2024-02-14',
        project: 'Project Alpha',
        tags: ['backend', 'security'],
        progress: 100,
    },
    {
        id: '2',
        title: 'Design landing page',
        description: 'Create a modern, responsive landing page',
        status: 'in-progress',
        priority: 'medium',
        assignee: {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            avatar: '/placeholder.svg?height=40&width=40',
        },
        dueDate: '2024-02-20',
        project: 'Project Alpha',
        tags: ['design', 'frontend'],
        progress: 65,
    },
    {
        id: '3',
        title: 'Database optimization',
        description: 'Optimize database queries and add proper indexing',
        status: 'todo',
        priority: 'low',
        assignee: {
            id: '3',
            name: 'Mike Johnson',
            email: 'mike@example.com',
            avatar: '/placeholder.svg?height=40&width=40',
        },
        dueDate: '2024-02-25',
        project: 'Project Alpha',
        tags: ['database', 'performance'],
        progress: 0,
    },
];

// Messages are now fetched from backend via the Chat component

const ProjectShow = ({ project, teamMembers, tasks, attachments, notes, canManageTeam = false, isProjectOwner = false }) => {
    const [activeTab, setActiveTab] = useState('overview');
    // //console.log(notes)
    const todaysTasks = useMemo(() => {
        const today = new Date();
        return tasks.filter((task) => task.due_date && isToday(parseISO(task.due_date)));
    }, [tasks]);

    // Transform tasks with started_at into calendar events
    const calendarEvents = useMemo(() => {
        if (!tasks || tasks.length === 0) return [];

        return tasks
            .filter((task) => task.started_at) // Only include tasks with started_at
            .map((task) => {
                const startDate = new Date(task.started_at);

                // Calculate end time: use due_date if available, otherwise add 1 hour to started_at
                let endDate;
                if (task.due_date) {
                    endDate = new Date(task.due_date);
                    const startDay = startDate.toDateString();
                    const dueDay = endDate.toDateString();

                    // If due_date is just a date (no time component)
                    if (endDate.getHours() === 0 && endDate.getMinutes() === 0 && endDate.getSeconds() === 0) {
                        if (startDay === dueDay) {
                            // Same day: add 2 hours to started_at for reasonable duration
                            endDate = new Date(startDate);
                            endDate.setHours(endDate.getHours() + 2);
                        } else {
                            // Different day: use end of due_date day
                            endDate.setHours(23, 59, 59);
                        }
                    }
                } else {
                    // Default to 1 hour duration if no due_date
                    endDate = new Date(startDate);
                    endDate.setHours(endDate.getHours() + 1);
                }

                // Ensure end is after start
                if (endDate <= startDate) {
                    endDate = new Date(startDate);
                    endDate.setHours(endDate.getHours() + 1);
                }

                // Calculate progress from task
                const progress =
                    task.progress ||
                    (task.subtasks && task.subtasks.length > 0
                        ? Math.round((task.subtasks.filter((st) => st.completed).length / task.subtasks.length) * 100)
                        : task.status === 'completed'
                          ? 100
                          : 0);

                return {
                    id: task.id,
                    title: task.title || 'Untitled Task',
                    start: startDate.toISOString(),
                    end: endDate.toISOString(),
                    backgroundColor: '#ffc801', // alpha color
                    borderColor: '#ffc801', // alpha color
                    extendedProps: {
                        progress: progress,
                        taskId: task.id,
                        status: task.status,
                        priority: task.priority,
                        description: task.description,
                    },
                };
            });
    }, [tasks]);

    // Collect all task attachments
    const allTaskAttachments = useMemo(() => {
        const taskAttachments = [];
        tasks.forEach((task) => {
            if (task.attachments && Array.isArray(task.attachments)) {
                task.attachments.forEach((attachment) => {
                    taskAttachments.push({
                        ...attachment,
                        task_id: task.id,
                        task_title: task.title,
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
        tasks.forEach((task) => {
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
            (task.comments || []).forEach((comment) => {
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
        (project.notes || []).forEach((note) => {
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

    // Message handling is now done in the Chat component

    return (
        <AppLayout>
            <Head title={`${project.name} - Project Details`} />
            <div className="flex min-h-screen flex-col">
                {/* Project Header with Banner */}
                <ProjectHeader project={project} teamMembers={teamMembers} tasks={tasks} />

                {/* Main Content with Sidebar */}
                <div className="flex flex-1 flex-col lg:flex-row">
                    {/* Main Content */}
                    <div className="mx-auto w-full max-w-[1200px] flex-1 p-6">
                        {/* Calendar Section */}
                        <Calendar events={calendarEvents} />

                        {/* Navigation Tabs */}
                        <div className="mb-6 py-3">
                            <Tabs defaultValue="overview" onValueChange={setActiveTab} value={activeTab}>
                                <TabsList className="grid w-full grid-cols-6">
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                                    <TabsTrigger value="files">Attachments</TabsTrigger>
                                    {/* <TabsTrigger value="attachments">Attachments</TabsTrigger> */}
                                    <TabsTrigger value="notes">Notes</TabsTrigger>
                                    <TabsTrigger value="team">Team</TabsTrigger>
                                    <TabsTrigger value="activity" className="relative">
                                        Activity
                                        {recentActivities.filter((a) => !a.read).length > 0 && (
                                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-alpha text-[10px] text-primary-foreground">
                                                {recentActivities.filter((a) => !a.read).length}
                                            </span>
                                        )}
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="mt-6">
                                    <Overview project={project} teamMembers={teamMembers} tasks={tasks} />
                                </TabsContent>

                                <TabsContent value="tasks" className="mt-6">
                                    <Tasks tasks={tasks} teamMembers={teamMembers} projectId={project.id} />
                                </TabsContent>

                                <TabsContent value="files" className="mt-6">
                                    <Files projectAttachments={attachments} taskAttachments={allTaskAttachments} projectId={project.id} />
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
                                    <Team
                                        teamMembers={teamMembers}
                                        projectId={project.id}
                                        canManageTeam={canManageTeam}
                                        isProjectOwner={isProjectOwner}
                                    />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <Sidebar todaysTasks={todaysTasks} />
                </div>

                {/* Floating Chat */}
                <Chat projectId={project.id} />
            </div>
        </AppLayout>
    );
};

export default ProjectShow;
