import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    MoreHorizontal, 
    Edit, 
    ArrowRight, 
    Trash, 
    Plus,
    Search,
    StickyNote
} from 'lucide-react';

const Notes = ({ notes = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const [newNote, setNewNote] = useState({
        title: '',
        content: '',
        color: 'bg-amber-50 dark:bg-amber-950/50'
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
        console.log('Creating note:', newNote);
        setNewNote({
            title: '',
            content: '',
            color: 'bg-amber-50 dark:bg-amber-950/50'
        });
        setIsCreateModalOpen(false);
    };

    const handleEditNote = (note) => {
        setSelectedNote(note);
        setIsEditModalOpen(true);
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
                            className={`${note.color} border shadow-sm hover:shadow-md transition-shadow duration-200`}
                        >
                            <CardHeader className="p-4 pb-2">
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-lg">{note.title}</CardTitle>
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
                                            <DropdownMenuItem>
                                                <ArrowRight className="mr-2 h-4 w-4" />
                                                <span>Share</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive">
                                                <Trash className="mr-2 h-4 w-4" />
                                                <span>Delete</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Last updated: {new Date(note.updatedAt).toLocaleDateString()}
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
                                onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                                placeholder="Enter note title..."
                            />
                        </div>
                        <div>
                            <Label htmlFor="content">Content</Label>
                            <Textarea 
                                id="content" 
                                value={newNote.content}
                                onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                                placeholder="Enter note content..."
                                rows={6}
                            />
                        </div>
                        <div>
                            <Label htmlFor="color">Color Theme</Label>
                            <Select 
                                value={newNote.color} 
                                onValueChange={(value) => setNewNote({...newNote, color: value})}
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
                                    defaultValue={selectedNote.title}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-content">Content</Label>
                                <Textarea 
                                    id="edit-content" 
                                    defaultValue={selectedNote.content}
                                    rows={6}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-color">Color Theme</Label>
                                <Select defaultValue={selectedNote.color}>
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
                        <Button onClick={() => setIsEditModalOpen(false)}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Notes;
