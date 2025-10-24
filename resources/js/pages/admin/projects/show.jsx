import React, { useState, useMemo, useCallback } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
    Plus, 
    Users, 
    MessageSquare, 
    CheckSquare, 
    Paperclip, 
    Calendar,
    Clock,
    AlertCircle,
    CheckCircle,
    MoreVertical,
    Send,
    Upload,
    Download,
    Trash,
    Edit,
    UserPlus,
    Filter,
    Search
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Banner from "@/components/banner"
import illustration from "../../../../../public/assets/images/banner/Personal settings-cuate.png"
import ProjectOverview from './components/ProjectOverview';
import TaskManager from './components/TaskManager';
import TeamManager from './components/TeamManager';
import FileManager from './components/FileManager';

const ProjectShow = ({ project, teamMembers, tasks, attachments }) => {
    const [activeTab, setActiveTab] = useState('overview');

    const handleTaskCreate = useCallback((data) => {
        router.post('/admin/tasks', {
            ...data,
            project_id: project.id
        });
    }, [project.id]);

    const handleTaskUpdate = useCallback((id, data) => {
        router.put(`/admin/tasks/${id}`, data);
    }, []);

    const handleTaskDelete = useCallback((id) => {
        if (confirm('Are you sure you want to delete this task?')) {
            router.delete(`/admin/tasks/${id}`);
        }
    }, []);

    const handleCommentAdd = useCallback((taskId, content) => {
        router.post('/admin/task-comments', {
            content,
            task_id: taskId
        });
    }, []);

    const handleInviteUser = useCallback((userId, role) => {
        router.post(`/admin/projects/${project.id}/invite`, {
            user_id: userId,
            role
        });
    }, [project.id]);

    const handleRemoveUser = useCallback((userId) => {
        router.delete(`/admin/projects/${project.id}/users/${userId}`);
    }, [project.id]);

    const handleUpdateRole = useCallback((userId, role) => {
        router.put(`/admin/projects/${project.id}/users/${userId}`, {
            role
        });
    }, [project.id]);

    const handleFileUpload = useCallback((file, taskId) => {
        const formData = new FormData();
        formData.append('file', file);
        if (taskId) formData.append('task_id', taskId);
        formData.append('project_id', project.id);
        
        router.post('/admin/attachments', formData);
    }, [project.id]);

    const handleFileDelete = useCallback((id) => {
        router.delete(`/admin/attachments/${id}`);
    }, []);

    return (
        <AppLayout>
            <Head title={`${project.name} - Project Details`} />
            
            <Banner
                illustration={illustration}
                greeting="Project"
                userName={project.name}
                title="Project Workspace"
                description="Manage your project tasks, team, and collaborate efficiently."
            />

            <div className="p-6 space-y-6">
                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="tasks">Tasks</TabsTrigger>
                        <TabsTrigger value="team">Team</TabsTrigger>
                        <TabsTrigger value="files">Files</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-4">
                        <ProjectOverview 
                            project={project}
                            tasks={tasks}
                            teamMembers={teamMembers}
                            attachments={attachments}
                            comments={[]}
                        />
                    </TabsContent>

                    {/* Tasks Tab */}
                    <TabsContent value="tasks" className="space-y-4">
                        <TaskManager
                            tasks={tasks}
                            teamMembers={teamMembers}
                            onTaskCreate={handleTaskCreate}
                            onTaskUpdate={handleTaskUpdate}
                            onTaskDelete={handleTaskDelete}
                            onCommentAdd={handleCommentAdd}
                        />
                    </TabsContent>

                    {/* Team Tab */}
                    <TabsContent value="team" className="space-y-4">
                        <TeamManager
                            teamMembers={teamMembers}
                            availableUsers={[]}
                            onInviteUser={handleInviteUser}
                            onRemoveUser={handleRemoveUser}
                            onUpdateRole={handleUpdateRole}
                        />
                    </TabsContent>

                    {/* Files Tab */}
                    <TabsContent value="files" className="space-y-4">
                        <FileManager
                            attachments={attachments}
                            onFileUpload={handleFileUpload}
                            onFileDelete={handleFileDelete}
                            tasks={tasks}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
};

export default ProjectShow;
