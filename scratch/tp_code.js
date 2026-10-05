import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    User as UserIcon,
    Plus,
    Edit2,
    Trash2,
    BookOpen,
    Layers,
    Table,
    Grid,
    ChevronDown,
    AlertCircle,
    CheckCircle2,
    UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

export default function TrainingProgramme({
    training = {},
    trainingWeeks = [],
    coaches = [],
    allTrainings = [],
    canManage = true,
}) {
    // Sort weeks by week_number ascending
    const sortedWeeks = [...(trainingWeeks || [])].sort((a, b) => a.week_number - b.week_number);

    // View state: 'spreadsheet' or 'list'
    const [viewMode, setViewMode] = useState('spreadsheet');

    // Week Modal state
    const [isWeekModalOpen, setIsWeekModalOpen] = useState(false);
    const [editingWeek, setEditingWeek] = useState(null);
    const [weekFormData, setWeekFormData] = useState({
        week_number: 1,
        title: '',
        start_date: '',
        end_date: '',
    });

    // Session Modal state
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState(null);
    const [sessionFormData, setSessionFormData] = useState({
        training_week_id: '',
        date: '',
        start_time: '09:00',
        end_time: '12:30',
        title: '',
        description: '',
        coach_ids: [],
    });

    // Error & loading states
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helper: calculate default next week start date (+7 days from last week's start date)
    const getNextWeekDefaults = () => {
        if (sortedWeeks.length === 0) {
            const today = new Date().toISOString().slice(0, 10);
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 4);
            return {
                week_number: 1,
                start_date: today,
                end_date: nextWeek.toISOString().slice(0, 10),
            };
        }

        const lastWeek = sortedWeeks[sortedWeeks.length - 1];
        const nextWeekNum = (lastWeek.week_number || sortedWeeks.length) + 1;

        let nextStartDateStr = '';
        let nextEndDateStr = '';

        if (lastWeek.start_date) {
            const startDateObj = new Date(lastWeek.start_date);
            startDateObj.setDate(startDateObj.getDate() + 7);
            nextStartDateStr = startDateObj.toISOString().slice(0, 10);

            const endDateObj = new Date(startDateObj);
            endDateObj.setDate(endDateObj.getDate() + 4);
            nextEndDateStr = endDateObj.toISOString().slice(0, 10);
        }

        return {
            week_number: nextWeekNum,
            start_date: nextStartDateStr,
            end_date: nextEndDateStr,
        };
    };

    // Open Week Modal for creation
    const handleOpenCreateWeek = () => {
        const defaults = getNextWeekDefaults();
        setEditingWeek(null);
        setWeekFormData({
            week_number: defaults.week_number,
            title: '',
            start_date: defaults.start_date,
            end_date: defaults.end_date,
        });
        setErrors({});
        setIsWeekModalOpen(true);
    };

    // Open Week Modal for edit
    const handleOpenEditWeek = (week, e) => {
        if (e) e.stopPropagation();
        setEditingWeek(week);
        setWeekFormData({
            week_number: week.week_number,
            title: week.title || '',
            start_date: week.start_date ? String(week.start_date).slice(0, 10) : '',
            end_date: week.end_date ? String(week.end_date).slice(0, 10) : '',
        });
        setErrors({});
        setIsWeekModalOpen(true);
    };

    // Save Week (Create or Update)
    const handleSaveWeek = (e) => {
        e.preventDefault();
        setErrors({});
        setIsSubmitting(true);

        const payload = {
            week_number: parseInt(weekFormData.week_number, 10),
            title: weekFormData.title || null,
            start_date: weekFormData.start_date,
            end_date: weekFormData.end_date,
        };

        if (editingWeek) {
            router.put(\/training-weeks/\, payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsWeekModalOpen(false);
                    setIsSubmitting(false);
                },
                onError: (errs) => {
                    setErrors(errs);
                    setIsSubmitting(false);
                },
            });
        } else {
            router.post(\/trainings/\/weeks\, payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsWeekModalOpen(false);
                    setIsSubmitting(false);
                },
                onError: (errs) => {
                    setErrors(errs);
                    setIsSubmitting(false);
                },
            });
        }
    };

    // Delete Week
    const handleDeleteWeek = (weekId, weekNumber, e) => {
        if (e) e.stopPropagation();
        if (!confirm(\Are you sure you want to delete Week \? All sessions in this week will be deleted.\)) {
            return;
        }
        router.delete(\/training-weeks/\, {
            preserveScroll: true,
        });
    };

    // Open Session Modal for creation
    const handleOpenCreateSession = (targetWeek = null, prefilledDate = '') => {
        const defaultWeek = targetWeek || (sortedWeeks.length > 0 ? sortedWeeks[0] : null);
        const defaultWeekId = defaultWeek ? String(defaultWeek.id) : '';
        const defaultDate = prefilledDate || (defaultWeek && defaultWeek.start_date ? String(defaultWeek.start_date).slice(0, 10) : '');

        setEditingSession(null);
        setSessionFormData({
            training_week_id: defaultWeekId,
            date: defaultDate,
            start_time: '09:00',
            end_time: '12:30',
            title: '',
            description: '',
            coach_ids: [],
        });
        setErrors({});
        setIsSessionModalOpen(true);
    };

    // Open Session Modal for edit
    const handleOpenEditSession = (session, e) => {
        if (e) e.stopPropagation();
        setEditingSession(session);

        const assignedCoachIds = session.coaches ? session.coaches.map((c) => String(c.id)) : [];

        setSessionFormData({
            training_week_id: String(session.training_week_id),
            date: session.date ? String(session.date).slice(0, 10) : '',
            start_time: session.start_time ? String(session.start_time).slice(0, 5) : '09:00',
            end_time: session.end_time ? String(session.end_time).slice(0, 5) : '12:30',
            title: session.title || '',
            description: session.description || '',
            coach_ids: assignedCoachIds,
        });
        setErrors({});
        setIsSessionModalOpen(true);
    };

    // Save Session (Create or Update)
    const handleSaveSession = (e) => {
        e.preventDefault();
        setErrors({});
        setIsSubmitting(true);

        const payload = {
            training_week_id: parseInt(sessionFormData.training_week_id, 10),
            date: sessionFormData.date,
            start_time: sessionFormData.start_time,
            end_time: sessionFormData.end_time,
            title: sessionFormData.title,
            description: sessionFormData.description || '',
            coach_ids: sessionFormData.coach_ids.map((id) => parseInt(id, 10)),
        };

        if (editingSession) {
            router.put(/training-sessions/, payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSessionModalOpen(false);
                    setIsSubmitting(false);
                },
                onError: (errs) => {
                    setErrors(errs);
                    setIsSubmitting(false);
                },
            });
        } else {
            router.post(/trainings//sessions, payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSessionModalOpen(false);
                    setIsSubmitting(false);
                },
                onError: (errs) => {
                    setErrors(errs);
                    setIsSubmitting(false);
                },
            });
        }
    };

    // Delete Session
    const handleDeleteSession = (sessionId, e) => {
        if (e) e.stopPropagation();
        if (!confirm('Are you sure you want to delete this training session?')) {
            return;
        }
        router.delete(/training-sessions/, {
            preserveScroll: true,
        });
    };

    // Coach checkbox toggle handler
    const handleCoachToggle = (coachIdStr) => {
        setSessionFormData((prev) => {
            const exists = prev.coach_ids.includes(coachIdStr);
            if (exists) {
                return { ...prev, coach_ids: prev.coach_ids.filter((id) => id !== coachIdStr) };
            } else {
                return { ...prev, coach_ids: [...prev.coach_ids, coachIdStr] };
            }
        });
    };

    // Switch formation / class selection
    const handleFormationChange = (formationId) => {
        if (!formationId || parseInt(formationId, 10) === training.id) return;
        router.get(/trainings/);
    };

    // Calculate maximum number of sessions across any week to build grid rows
    const maxSessionsInWeek = Math.max(
        1,
        ...sortedWeeks.map((w) => (w.sessions ? w.sessions.length : 0))
    );

    // Total session count calculation
    const totalSessionsCount = sortedWeeks.reduce(
        (sum, w) => sum + (w.sessions ? w.sessions.length : 0),
        0
    );
