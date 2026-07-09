import { Button } from '@/components/ui/button';
import { shouldShowReminderBanner, slotLabel } from '@/lib/attendance-slots';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { CheckCircle2, Clock, Coffee, Loader2, WifiOff } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

function buildButtonLabel(slotStatus) {
    const { current_slot, phase, already_marked_slots } = slotStatus;

    if (current_slot && already_marked_slots.includes(current_slot)) {
        return `${slotLabel(current_slot)} ✓`;
    }

    if (phase === 'closed') {
        return 'Attendance closed';
    }

    if (phase === 'gap') {
        return 'Post-coffee break';
    }

    if (current_slot) {
        return `Check in — ${slotLabel(current_slot)}`;
    }

    return 'Check in';
}

function buildHelperText(slotStatus) {
    const { current_slot, phase, already_marked_slots, minutes_into_slot, next_slot, present_minutes } = slotStatus;
    const presentWindow = present_minutes ?? 15;

    if (current_slot && already_marked_slots.includes(current_slot)) {
        return `You have already marked ${slotLabel(current_slot).toLowerCase()} attendance today.`;
    }

    if (phase === 'closed') {
        if (next_slot) {
            return `Attendance opens at ${next_slot.opens_at} (${slotLabel(next_slot.slot)}).`;
        }
        return 'Attendance is only available between 09:30 and 17:00.';
    }

    if (phase === 'gap') {
        if (next_slot) {
            return `Next slot: ${slotLabel(next_slot.slot)} at ${next_slot.opens_at}.`;
        }
        return 'No attendance slot is active right now.';
    }

    if (current_slot && minutes_into_slot !== null && minutes_into_slot < presentWindow) {
        const remaining = presentWindow - minutes_into_slot;
        return `Mark within ${remaining} min to count as present (not late).`;
    }

    if (current_slot) {
        return 'You are in the late window for this slot.';
    }

    return '';
}

function isCheckInDisabled(slotStatus, submitting) {
    if (submitting) {
        return true;
    }

    const { current_slot, phase, already_marked_slots } = slotStatus;

    if (phase !== 'active' || !current_slot) {
        return true;
    }

    return already_marked_slots.includes(current_slot);
}

export default function StudentAttendanceIndex({ formation, attendance_day, slot_status: initialSlotStatus }) {
    const [slotStatus, setSlotStatus] = useState(initialSlotStatus);
    const [row, setRow] = useState(initialSlotStatus?.row ?? null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const refreshSlotStatus = useCallback(async () => {
        if (!formation?.id) {
            return;
        }

        try {
            const params = new URLSearchParams({
                formation_id: String(formation.id),
                attendance_day,
            });
            const response = await fetch(`/students/attendance/slot-status?${params.toString()}`, {
                headers: { Accept: 'application/json' },
            });

            if (!response.ok) {
                return;
            }

            const data = await response.json();
            setSlotStatus(data);
            if (data.row) {
                setRow(data.row);
            }
        } catch {
            // ignore polling errors
        }
    }, [formation?.id, attendance_day]);

    useEffect(() => {
        if (!formation?.id) {
            return undefined;
        }

        const interval = setInterval(refreshSlotStatus, 60_000);
        return () => clearInterval(interval);
    }, [formation?.id, refreshSlotStatus]);

    const buttonLabel = useMemo(() => (slotStatus ? buildButtonLabel(slotStatus) : 'Check in'), [slotStatus]);
    const helperText = useMemo(() => (slotStatus ? buildHelperText(slotStatus) : ''), [slotStatus]);
    const disabled = !formation || !slotStatus || isCheckInDisabled(slotStatus, submitting);
    const reminderVisible = slotStatus ? shouldShowReminderBanner(slotStatus) : false;
    const presentWindow = slotStatus?.present_minutes ?? 15;

    const handleCheckIn = async () => {
        if (!formation?.id || disabled) {
            return;
        }

        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('/students/attendance/check-in', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                },
                body: JSON.stringify({
                    formation_id: formation.id,
                    attendance_day,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setError(data.message || 'Unable to check in right now.');
                return;
            }

            setSuccess(`Checked in for ${slotLabel(data.slot)} (${data.status}).`);
            setRow(data.row);
            await refreshSlotStatus();
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AppLayout>
            <Head title="Attendance" />

            <div className="mx-auto max-w-lg px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-dark dark:text-light">Attendance</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {formation?.name ? formation.name : 'No formation assigned'}
                        {attendance_day ? ` · ${attendance_day}` : ''}
                    </p>
                </div>

                {!formation && (
                    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
                        <WifiOff className="mt-0.5 h-5 w-5 shrink-0" />
                        <p className="text-sm">You are not enrolled in a formation. Contact your coach if this is unexpected.</p>
                    </div>
                )}

                {formation && slotStatus && (
                    <div className="space-y-4">
                        {reminderVisible && (
                            <div className="flex items-start gap-3 rounded-lg border border-alpha/30 bg-alpha/10 p-4 text-dark dark:text-light">
                                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-alpha" />
                                <p className="text-sm">
                                    Present window: first {presentWindow} minutes of the slot. Check in now to avoid a late mark.
                                </p>
                            </div>
                        )}

                        {slotStatus.phase === 'gap' && (
                            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-4">
                                <Coffee className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">{helperText}</p>
                            </div>
                        )}

                        {success && (
                            <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-900 dark:border-green-800 dark:bg-green-950/40 dark:text-green-100">
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                                <p className="text-sm">{success}</p>
                            </div>
                        )}

                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100">
                                {error}
                            </div>
                        )}

                        <Button
                            type="button"
                            className="h-12 w-full text-base"
                            disabled={disabled}
                            onClick={handleCheckIn}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Checking in…
                                </>
                            ) : (
                                buttonLabel
                            )}
                        </Button>

                        {helperText && slotStatus.phase !== 'gap' && (
                            <p className="text-center text-sm text-muted-foreground">{helperText}</p>
                        )}

                        {row && (
                            <div className="rounded-lg border border-border p-4">
                                <h2 className="mb-3 text-sm font-semibold text-dark dark:text-light">Today&apos;s slots</h2>
                                <ul className="space-y-2 text-sm">
                                    {['morning', 'lunch', 'evening'].map((slot) => (
                                        <li key={slot} className="flex items-center justify-between">
                                            <span className="text-muted-foreground">{slotLabel(slot)}</span>
                                            <span className="font-medium capitalize text-dark dark:text-light">{row[slot] ?? '—'}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
