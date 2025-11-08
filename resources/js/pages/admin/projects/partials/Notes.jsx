import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, } from '@/components/ui/avatar';
import { useForm, router } from '@inertiajs/react';
import {
    MoreHorizontal,
    Edit,
    ArrowRight,
    Trash,
    Plus,
    Search,
    StickyNote,
    Pin,
    PinOff
} from 'lucide-react';

const Notes = ({ notes = [], projectId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);

    const { data: newNote, setData: setNewNote, post: createNote, put: updateNote, delete: deleteNote } = useForm({
        title: '',
        content: '',
        color: 'bg-amber-50 dark:bg-amber-950/50',
        project_id: projectId
    });

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const colorOptions = [
        { value: 'bg-amber-50 dark:bg-amber-950/50', label: 'Yellow' },
        { value: 'bg-emerald-50 dark:bg-emerald-950/50', label: 'Green' },
        { value: 'bg-sky-50 dark:bg-sky-950/50', label: 'Blue' },
        { value: 'bg-rose-50 dark:bg-rose-950/50', label: 'Pink' },
        { value: 'bg-purple-50 dark:bg-purple-950/50', label: 'Purple' },
        { value: 'bg-orange-50 dark:bg-orange-950/50', label: 'Orange' }
    ];

    const handleCreateNote = () => {
        createNote('/admin/project-notes', {
            onSuccess: () => {
                setNewNote({
                    title: '',
                    content: '',
                    color: 'bg-amber-50 dark:bg-amber-950/50',
                    project_id: projectId
                });
                setIsCreateModalOpen(false);
            },
            onError: (errors) => {
                console.error('Failed to create note:', errors);
                //alert('Failed to create note: ' + (errors.message || 'Unknown error'));
            }
        });
    };

    const handleEditNote = (note) => {
        setSelectedNote(note);
        setIsEditModalOpen(true);
    };

    const handleUpdateNote = () => {
        if (!selectedNote) return;

        updateNote(`/admin/project-notes/${selectedNote.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setSelectedNote(null);
            },
            onError: (errors) => {
                console.error('Failed to update note:', errors);
                //alert('Failed to update note: ' + (errors.message || 'Unknown error'));
            }
        });
    };

    const handleDeleteNote = (noteId) => {
        if (confirm('Are you sure you want to delete this note?')) {
            deleteNote(`/admin/project-notes/${noteId}`, {
                onError: (errors) => {
                    console.error('Failed to delete note:', errors);
                    //alert('Failed to delete note: ' + (errors.message || 'Unknown error'));
                }
            });
        }
    };

    const handleTogglePin = (noteId) => {
        router.post(`/admin/project-notes/${noteId}/pin`, {}, {
            onError: (errors) => {
                console.error('Failed to toggle pin:', errors);
                //alert('Failed to toggle pin: ' + (errors.message || 'Unknown error'));
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Header and Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search notes..."
                            className="pl-8 w-[200px] md:w-[300px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                </Button>
            </div>

            {/* Notes Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredNotes.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        {searchTerm ? 'No notes match your search' : 'No notes created yet'}
                    </div>
                ) : (
                    filteredNotes.map((note) => (
                        <Card
                            key={note.id}
                            className={`${note.color || 'bg-amber-50 dark:bg-amber-950/50'} border shadow-sm hover:shadow-md transition-shadow duration-200`}
                        >
                            <CardHeader className="p-4 pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        {note.is_pinned && <Pin className="h-4 w-4 text-amber-600" />}
                                        <CardTitle className="text-lg">{note.title}</CardTitle>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEditNote(note)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                <span>Edit</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleTogglePin(note.id)}>
                                                {note.is_pinned ? (
                                                    <>
                                                        <PinOff className="mr-2 h-4 w-4" />
                                                        <span>Unpin</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Pin className="mr-2 h-4 w-4" />
                                                        <span>Pin</span>
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <ArrowRight className="mr-2 h-4 w-4" />
                                                <span>Share</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                onClick={() => handleDeleteNote(note.id)}
                                            >
                                                <Trash className="mr-2 h-4 w-4" />
                                                <span>Delete</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-2">
                                        {/* <Avatar className="h-6 w-6">
                                            <AvatarImage 
                                                src={note.user?.image ? `/storage/${note.user.image}` : null} 
                                                alt={note.user?.name} 
                                            />
                                            <AvatarFallback>
                                                {note.user?.name?.substring(0, 2).toUpperCase() || '??'}
                                            </AvatarFallback>
                                        </Avatar> */}
                                        <Avatar
                                            className="w-16 h-16 mx-auto mb-4"
                                            image={note?.user?.image}
                                            name={note?.user?.name}
                                            onlineCircleClass="hidden"
                                        />
                                        <span className="text-xs text-muted-foreground">
                                            {note.user?.name || 'Unknown User'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {new Date(note.updated_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="whitespace-pre-line text-sm">{note.content}</div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Create Note Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New Note</DialogTitle>
                        <DialogDescription>
                            Add a new note to your project
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="title">Note Title</Label>
                            <Input
                                id="title"
                                value={newNote.title}
                                onChange={(e) => setNewNote('title', e.target.value)}
                                placeholder="Enter note title..."
                            />
                        </div>
                        <div>
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                                id="content"
                                value={newNote.content}
                                onChange={(e) => setNewNote('content', e.target.value)}
                                placeholder="Enter note content..."
                                rows={6}
                            />
                        </div>
                        <div>
                            <Label htmlFor="color">Color Theme</Label>
                            <Select
                                value={newNote.color}
                                onValueChange={(value) => setNewNote('color', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {colorOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateNote}>
                            Create Note
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Note Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Note</DialogTitle>
                        <DialogDescription>
                            Update your note content and settings
                        </DialogDescription>
                    </DialogHeader>
                    {selectedNote && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="edit-title">Note Title</Label>
                                <Input
                                    id="edit-title"
                                    value={selectedNote.title}
                                    onChange={(e) => setSelectedNote({ ...selectedNote, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-content">Content</Label>
                                <Textarea
                                    id="edit-content"
                                    value={selectedNote.content}
                                    onChange={(e) => setSelectedNote({ ...selectedNote, content: e.target.value })}
                                    rows={6}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-color">Color Theme</Label>
                                <Select
                                    value={selectedNote.color || 'bg-amber-50 dark:bg-amber-950/50'}
                                    onValueChange={(value) => setSelectedNote({ ...selectedNote, color: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {colorOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateNote}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Notes;
