import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Edit, Share2 } from 'lucide-react';
import TaskDetails from './TaskDetails';
import TaskComments from './TaskComments';
import TaskSubtasks from './TaskSubtasks';
import TaskAttachments from './TaskAttachments';
import TaskSidebar from './TaskSidebar';

const TaskModal = ({ 
    isOpen, 
    onClose, 
    selectedTask, 
    teamMembers = [],
    onUpdateTask 
}) => {
    const [activeTab, setActiveTab] = useState('details');

    if (!selectedTask) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[50vw] max-h-[90vh] w-[50vw]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--color-alpha)]/10 rounded-lg">
                            <FileText className="h-5 w-5 text-[var(--color-alpha)]" />
                        </div>
                        <div>
                            <div className="text-lg font-semibold">{selectedTask.title || 'Untitled Task'}</div>
                            <div className="text-sm text-muted-foreground">
                                Created {selectedTask.createdAt ? new Date(selectedTask.createdAt).toLocaleDateString() : 'Recently'}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                            <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => {
                                const taskUrl = `${window.location.origin}/projects/${selectedTask.projectId}/tasks/${selectedTask.id}`;
                                navigator.clipboard.writeText(taskUrl);
                                // You can add a toast notification here
                            }}>
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                            </Button>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                
                <ScrollArea className="max-h-[70vh]">
                    <div className="space-y-6">
                        {/* Task Details */}
                        <TaskDetails task={selectedTask} />

                        {/* Subtasks */}
                        <TaskSubtasks 
                            subtasks={selectedTask.subtasks || []}
                            onUpdateSubtasks={(subtasks) => onUpdateTask({...selectedTask, subtasks})}
                        />

                        {/* Comments */}
                        <TaskComments 
                            comments={selectedTask.comments || []}
                            teamMembers={teamMembers}
                            onUpdateComments={(comments) => onUpdateTask({...selectedTask, comments})}
                        />

                        {/* Attachments */}
                        <TaskAttachments 
                            attachments={selectedTask.attachments || []}
                            onUpdateAttachments={(attachments) => onUpdateTask({...selectedTask, attachments})}
                        />
                    </div>
                </ScrollArea>

                {/* Task Sidebar */}
                <div className="mt-6">
                    <TaskSidebar task={selectedTask} teamMembers={teamMembers} />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TaskModal;
