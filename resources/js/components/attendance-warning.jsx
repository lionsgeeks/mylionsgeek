import { useEffect, useMemo, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function AttendanceWarning() {
  const { auth, session, attendanceWarning } = usePage().props;
  const trainings = Array.isArray(attendanceWarning?.trainings) ? attendanceWarning.trainings : [];
  const todayLabel = attendanceWarning?.date || '';

  const isCoach = useMemo(() => {
    const role = auth?.user?.role;
    if (Array.isArray(role)) {
      return role.includes('coach');
    }
    return role === 'coach';
  }, [auth?.user?.role]);

  const shouldWarn = Boolean(isCoach && attendanceWarning?.hasWarning && trainings.length);

  const trainingKey = useMemo(() => {
    if (!trainings.length) {
      return '';
    }
    return trainings
      .map((training) => training?.id ?? '')
      .filter(Boolean)
      .sort()
      .join('-');
  }, [trainings]);

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

  const handleDismiss = (days = 1) => {
    if (!cookieKey) return;
    const expires = new Date();
    expires.setDate(expires.getDate() + days);
    document.cookie = `${cookieKey}=1; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    setOpen(false);
  };

  if (!shouldWarn) {
    return null;
  }

  const primaryTraining = trainings[0];
  const otherTrainings = trainings.slice(1);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Attendance needed</DialogTitle>
          <DialogDescription>
            {todayLabel
              ? `You have not submitted today's attendance (${todayLabel}).`
              : 'You have not submitted attendance for today.'}
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
            Remind me later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


