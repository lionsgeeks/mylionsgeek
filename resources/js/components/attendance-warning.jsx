import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

// Same logic as index.jsx - training is active if started and within 6 months
const getTrainingStatus = (training) => {
    if (!training.start_time) return null;
    const start = new Date(training.start_time);
    const now = new Date();
    const sixMonthsLater = new Date(start);
    sixMonthsLater.setMonth(start.getMonth() + 6);
    if (now < sixMonthsLater && start < now) return 'active';
    return null;
};

export default function AttendanceWarning() {
    const { auth, session, attendanceWarning } = usePage().props;
    const allTrainings = Array.isArray(attendanceWarning?.trainings) ? attendanceWarning.trainings : [];
    const todayLabel = attendanceWarning?.date || '';

    // Filter to only show currently active trainings (same logic as index.jsx)

    const activeTrainings = useMemo(() => {
        if (!allTrainings.length) return [];
        return allTrainings.filter((t) => getTrainingStatus(t) === 'active');
    }, [allTrainings]);

    // Only show the first active training
    const trainings = activeTrainings.slice(0, 1);

    const isCoach = useMemo(() => {
        const role = auth?.user?.role;
        if (Array.isArray(role)) {
            return role.includes('coach');
        }
        return role === 'coach';
    }, [auth?.user?.role]);

    // Don't show attendance reminders on weekends (Saturday = 6, Sunday = 0)
    const isWeekend = useMemo(() => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
    }, []);

    const shouldWarn = Boolean(isCoach && attendanceWarning?.hasWarning && trainings.length && !isWeekend);

    const trainingKey = useMemo(() => {
        if (!activeTrainings.length) {
            return '';
        }
        return activeTrainings
            .map((training) => training?.id ?? '')
            .filter(Boolean)
            .sort()
            .join('-');
    }, [activeTrainings]);

    const cookieKey = useMemo(() => {
        if (!auth?.user?.id || !session?.id || !todayLabel || !trainingKey) {
            return null;
        }
        return `dismiss_attendance_warning_${auth.user.id}_${todayLabel}_${trainingKey}_${session.id}`;
    }, [auth?.user?.id, session?.id, todayLabel, trainingKey]);

    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!cookieKey || !shouldWarn) {
            setOpen(false);
            return;
        }

        const dismissed = document.cookie.split('; ').find((row) => row.startsWith(`${cookieKey}=`));
        setOpen(!dismissed);
    }, [cookieKey, shouldWarn]);

    const handleDismiss = (hours = 1) => {
        if (!cookieKey) return;
        const expires = new Date();
        expires.setHours(expires.getHours() + hours);
        document.cookie = `${cookieKey}=1; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
        setOpen(false);
    };

    if (!shouldWarn) {
        return null;
    }

    const primaryTraining = trainings[0];
    const otherTrainings = trainings.slice(1);

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (open && !nextOpen) {
                    handleDismiss(1);
                }
                setOpen(nextOpen);
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Attendance needed</DialogTitle>
                    <DialogDescription>
                        {todayLabel ? `You have not submitted today's attendance (${todayLabel}).` : 'You have not submitted attendance for today.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Trainings pending:</p>
                    <p className="text-foreground">{primaryTraining?.name}</p>
                    {otherTrainings.map((training) => (
                        <p key={training.id}>{training.name}</p>
                    ))}
                    {!trainings.length && <p>Attendance still missing for at least one training.</p>}
                </div>
                <DialogFooter>
                    {primaryTraining ? (
                        <Button asChild>
                            <Link href={`/trainings/${primaryTraining.id}`} onClick={() => setOpen(false)}>
                                Update attendance
                            </Link>
                        </Button>
                    ) : null}
                    <Button variant="ghost" onClick={() => handleDismiss(1)}>
                        Remind me later (1 hour)
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
