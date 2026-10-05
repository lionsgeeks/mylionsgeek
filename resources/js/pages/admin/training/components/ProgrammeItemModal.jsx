import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Palette, Calendar, User, UserPlus } from 'lucide-react';

export const COLOR_OPTIONS = [
    { id: 'blue', name: 'Blue', bg: 'bg-blue-500/15', border: 'border-blue-500', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
    { id: 'emerald', name: 'Emerald', bg: 'bg-emerald-500/15', border: 'border-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
    { id: 'purple', name: 'Purple', bg: 'bg-purple-500/15', border: 'border-purple-500', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500' },
    { id: 'amber', name: 'Amber', bg: 'bg-amber-500/15', border: 'border-amber-500', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
    { id: 'rose', name: 'Rose', bg: 'bg-rose-500/15', border: 'border-rose-500', text: 'text-rose-700 dark:text-rose-300', dot: 'bg-rose-500' },
    { id: 'indigo', name: 'Indigo', bg: 'bg-indigo-500/15', border: 'border-indigo-500', text: 'text-indigo-700 dark:text-indigo-300', dot: 'bg-indigo-500' },
    { id: 'cyan', name: 'Cyan', bg: 'bg-cyan-500/15', border: 'border-cyan-500', text: 'text-cyan-700 dark:text-cyan-300', dot: 'bg-cyan-500' },
    { id: 'orange', name: 'Orange', bg: 'bg-orange-500/15', border: 'border-orange-500', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500' },
];

const DAYS_MAP = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const DEFAULT_COACHES = [
    { id: 'c1', name: 'Ahmed El Amrani', type: 'Internal' },
    { id: 'c2', name: 'Sara Mansouri', type: 'Internal' },
    { id: 'c3', name: 'Youssef Benali', type: 'External' },
];

export default function ProgrammeItemModal({
    isOpen,
    onClose,
    onSave,
    onDelete,
    initialData = null,
    selectionRange = null,
    coaches = DEFAULT_COACHES,
    assignedCoach = null,
}) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('blue');
    const [selectedCoachId, setSelectedCoachId] = useState('none');
    const [newCoachName, setNewCoachName] = useState('');
    const [newCoachType, setNewCoachType] = useState('Internal');

    // Combine prop coaches, main assigned coach, and default coaches into a unified list
    const availableCoaches = useMemo(() => {
        const map = new Map();
        const add = (c) => {
            if (!c || !c.name) return;
            const key = String(c.id || c.name);
            if (!map.has(key)) {
                map.set(key, {
                    id: key,
                    name: c.name,
                    type: c.type || (c.is_external ? 'External' : 'Internal'),
                });
            }
        };

        if (assignedCoach) add(assignedCoach);
        if (Array.isArray(coaches) && coaches.length > 0) {
            coaches.forEach(add);
        } else {
            DEFAULT_COACHES.forEach(add);
        }
        return Array.from(map.values());
    }, [coaches, assignedCoach]);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || '');
            setDescription(initialData.description || '');
            setColor(initialData.color || 'blue');

            if (initialData.coach) {
                const c = initialData.coach;
                const coachName = typeof c === 'object' ? c.name : c;
                const coachType = typeof c === 'object' ? (c.type || 'Internal') : 'Internal';

                const matched = availableCoaches.find(
                    (ac) => String(ac.id) === String(c.id) || ac.name.toLowerCase() === String(coachName).toLowerCase()
                );

                if (matched) {
                    setSelectedCoachId(matched.id);
                    setNewCoachName('');
                } else {
                    setSelectedCoachId('__new__');
                    setNewCoachName(coachName || '');
                    setNewCoachType(coachType);
                }
            } else {
                setSelectedCoachId('none');
                setNewCoachName('');
                setNewCoachType('Internal');
            }
        } else {
            setTitle('');
            setDescription('');
            setColor('blue');
            setSelectedCoachId(assignedCoach ? String(assignedCoach.id || assignedCoach.name) : 'none');
            setNewCoachName('');
            setNewCoachType('Internal');
        }
    }, [initialData, isOpen, availableCoaches, assignedCoach]);

    const handleSave = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        let coachData = null;
        if (selectedCoachId === '__new__') {
            if (newCoachName.trim()) {
                coachData = {
                    id: `new_${Date.now()}`,
                    name: newCoachName.trim(),
                    type: newCoachType,
                    isCustom: true,
                };
            }
        } else if (selectedCoachId && selectedCoachId !== 'none') {
            const found = availableCoaches.find((ac) => String(ac.id) === String(selectedCoachId));
            if (found) {
                coachData = { ...found };
            }
        }

        onSave({
            id: initialData ? initialData.id : `item_${Date.now()}`,
            title: title.trim(),
            description: description.trim(),
            color,
            coach: coachData,
            startWeek: initialData ? initialData.startWeek : selectionRange.startWeek,
            endWeek: initialData ? initialData.endWeek : selectionRange.endWeek,
            startDay: initialData ? initialData.startDay : selectionRange.startDay,
            endDay: initialData ? initialData.endDay : selectionRange.endDay,
        });
        onClose();
    };

    const handleDelete = () => {
        if (initialData && onDelete) {
            onDelete(initialData);
            onClose();
        }
    };

    const getSelectionLabel = () => {
        const s = initialData || selectionRange;
        if (!s) return '';
        const weekText = s.startWeek === s.endWeek ? `Week ${s.startWeek}` : `Week ${s.startWeek} to Week ${s.endWeek}`;
        
        const startLinear = (s.startWeek - 1) * 5 + s.startDay;
        const endLinear = (s.endWeek - 1) * 5 + s.endDay;
        const totalDays = endLinear - startLinear + 1;

        const dayText = s.startWeek === s.endWeek
            ? (s.startDay === s.endDay ? DAYS_MAP[s.startDay] : `${DAYS_MAP[s.startDay]} → ${DAYS_MAP[s.endDay]}`)
            : `${DAYS_MAP[s.startDay]} → ${DAYS_MAP[s.endDay]}`;

        return `${weekText} • ${dayText} (${totalDays} ${totalDays === 1 ? 'day' : 'days'})`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md border border-alpha/20 bg-light text-dark dark:bg-dark dark:text-light p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center justify-between">
                        <span>{initialData ? 'Edit Programme Item' : 'New Programme Item'}</span>
                    </DialogTitle>
                </DialogHeader>

                {/* Selection Range Info Badge */}
                <div className="flex items-center gap-2 rounded-lg border border-alpha/20 bg-alpha/5 px-3 py-2 text-xs font-semibold text-dark/80 dark:text-light/80">
                    <Calendar className="h-4 w-4 text-alpha" />
                    <span>{getSelectionLabel()}</span>
                </div>

                <form onSubmit={handleSave} className="mt-4 space-y-4">
                    {/* Title */}
                    <div className="space-y-1.5">
                        <Label htmlFor="item-title" className="text-xs font-bold uppercase tracking-wider text-dark/70 dark:text-light/70">
                            Title *
                        </Label>
                        <Input
                            id="item-title"
                            type="text"
                            placeholder="e.g., HTML Semantics & Form Controls"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            autoFocus
                            className="bg-light/50 border-alpha/30 dark:bg-dark/50"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label htmlFor="item-desc" className="text-xs font-bold uppercase tracking-wider text-dark/70 dark:text-light/70">
                            Description
                        </Label>
                        <Textarea
                            id="item-desc"
                            placeholder="Detail key learning objectives, topics covered, or tasks..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="bg-light/50 border-alpha/30 resize-none dark:bg-dark/50 text-xs"
                        />
                    </div>

                    {/* Coach Selector */}
                    <div className="space-y-1.5">
                        <Label htmlFor="item-coach" className="text-xs font-bold uppercase tracking-wider text-dark/70 dark:text-light/70 flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-alpha" />
                            <span>Coach</span>
                        </Label>
                        <Select value={selectedCoachId} onValueChange={(val) => setSelectedCoachId(val)}>
                            <SelectTrigger className="w-full bg-light/50 border-alpha/30 dark:bg-dark/50 text-xs font-medium">
                                <SelectValue placeholder="Select a coach" />
                            </SelectTrigger>
                            <SelectContent className="bg-light dark:bg-dark border-alpha/20">
                                <SelectItem value="none">
                                    <span className="text-dark/50 dark:text-light/50 font-normal">No coach assigned</span>
                                </SelectItem>
                                {availableCoaches.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        <div className="flex items-center justify-between gap-3 w-full">
                                            <span className="font-semibold">{c.name}</span>
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-alpha/15 text-alpha border border-alpha/20">
                                                {c.type || 'Internal'}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                                <SelectItem value="__new__" className="text-alpha font-bold border-t border-alpha/20 mt-1 pt-1 cursor-pointer">
                                    <div className="flex items-center gap-1.5">
                                        <UserPlus className="h-3.5 w-3.5" />
                                        <span>+ Add new coach</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Conditional inputs for adding a new coach */}
                        {selectedCoachId === '__new__' && (
                            <div className="mt-2 space-y-2.5 p-3 rounded-xl border border-alpha/30 bg-alpha/10">
                                <div className="space-y-1">
                                    <Label className="text-[11px] font-bold text-dark/80 dark:text-light/80">Coach Name *</Label>
                                    <Input
                                        type="text"
                                        placeholder="Enter coach full name..."
                                        value={newCoachName}
                                        onChange={(e) => setNewCoachName(e.target.value)}
                                        required={selectedCoachId === '__new__'}
                                        className="h-8 bg-light border-alpha/30 text-xs dark:bg-dark"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[11px] font-bold text-dark/80 dark:text-light/80">Coach Type</Label>
                                    <div className="flex items-center gap-4 pt-1">
                                        <label className="flex items-center gap-1.5 text-xs cursor-pointer font-semibold text-dark dark:text-light">
                                            <input
                                                type="radio"
                                                name="modalCoachType"
                                                value="Internal"
                                                checked={newCoachType === 'Internal'}
                                                onChange={() => setNewCoachType('Internal')}
                                                className="accent-alpha"
                                            />
                                            <span>Internal</span>
                                        </label>
                                        <label className="flex items-center gap-1.5 text-xs cursor-pointer font-semibold text-dark dark:text-light">
                                            <input
                                                type="radio"
                                                name="modalCoachType"
                                                value="External"
                                                checked={newCoachType === 'External'}
                                                onChange={() => setNewCoachType('External')}
                                                className="accent-alpha"
                                            />
                                            <span>External</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Color Picker */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-dark/70 dark:text-light/70 flex items-center gap-1.5">
                            <Palette className="h-3.5 w-3.5 text-alpha" />
                            <span>Color Tag</span>
                        </Label>
                        <div className="grid grid-cols-4 gap-2 pt-1">
                            {COLOR_OPTIONS.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => setColor(c.id)}
                                    className={`flex items-center gap-2 rounded-lg border p-2 text-xs font-semibold transition-all ${
                                        color === c.id
                                            ? `${c.bg} ${c.border} ring-2 ring-alpha ring-offset-1 dark:ring-offset-dark`
                                            : 'border-alpha/20 hover:bg-alpha/10'
                                    }`}
                                >
                                    <span className={`h-3 w-3 rounded-full ${c.dot}`} />
                                    <span className="truncate">{c.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <DialogFooter className="pt-4 flex items-center justify-between sm:justify-between border-t border-alpha/15">
                        {initialData ? (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleDelete}
                                className="border-red-500/40 text-red-600 hover:bg-red-500/10 dark:text-red-400 gap-1.5 text-xs"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete</span>
                            </Button>
                        ) : (
                            <div />
                        )}

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="border-alpha/30 text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-[var(--color-alpha)] text-black hover:opacity-90 font-bold text-xs"
                            >
                                {initialData ? 'Update Item' : 'Create Item'}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
