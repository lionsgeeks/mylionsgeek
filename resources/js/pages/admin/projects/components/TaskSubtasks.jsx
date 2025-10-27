import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, Square, Plus, X, List } from 'lucide-react';

const TaskSubtasks = ({ subtasks = [], onUpdateSubtasks }) => {
    const [newSubtask, setNewSubtask] = useState('');

    const handleAddSubtask = () => {
        if (newSubtask.trim()) {
            const newSubtaskObj = {
                id: subtasks.length + 1,
                text: newSubtask,
                completed: false
            };
            onUpdateSubtasks([...subtasks, newSubtaskObj]);
            setNewSubtask('');
        }
    };

    const handleToggleSubtask = (id) => {
        const updatedSubtasks = subtasks.map(subtask => 
            subtask.id === id ? { ...subtask, completed: !subtask.completed } : subtask
        );
        onUpdateSubtasks(updatedSubtasks);
    };

    const handleDeleteSubtask = (id) => {
        const updatedSubtasks = subtasks.filter(subtask => subtask.id !== id);
        onUpdateSubtasks(updatedSubtasks);
    };

    return (
        <Card className="bg-background/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    Subtasks
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Dynamic subtasks */}
                {subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-2 group">
                        <button
                            onClick={() => handleToggleSubtask(subtask.id)}
                            className="flex-shrink-0"
                        >
                            {subtask.completed ? (
                                <CheckSquare className="h-4 w-4 text-green-500" />
                            ) : (
                                <Square className="h-4 w-4 text-muted-foreground" />
                            )}
                        </button>
                        <span className={`text-sm flex-1 ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {subtask.text}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteSubtask(subtask.id)}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                ))}
                
                {/* Add subtask */}
                <div className="flex gap-2 pt-2">
                    <Input
                        placeholder="Add a subtask..."
                        value={newSubtask}
                        onChange={(e) => setNewSubtask(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                        className="flex-1"
                    />
                    <Button size="sm" onClick={handleAddSubtask} disabled={!newSubtask.trim()}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default TaskSubtasks;
