/** Student-facing labels — identifiers (morning/lunch/evening) are internal only. */
export const SLOT_LABELS = {
    morning: 'Morning',
    lunch: 'Coffee break',
    evening: 'Lunch',
};

export function slotLabel(slot) {
    return SLOT_LABELS[slot] ?? slot;
}

/**
 * Present vs late sub-phase within an active slot (derived from server minutes_into_slot).
 */
export function attendanceSubPhase(slotStatus) {
    if (!slotStatus || slotStatus.phase !== 'active' || !slotStatus.current_slot) {
        return null;
    }

    if (slotStatus.minutes_into_slot === null) {
        return null;
    }

    const presentWindow = slotStatus.present_minutes ?? 15;

    return slotStatus.minutes_into_slot < presentWindow ? 'present' : 'late';
}

/**
 * Per-slot-per-phase dismiss key: `{slot}-{phase}-{date}`.
 */
export function reminderDismissKey(slotStatus) {
    const subPhase = attendanceSubPhase(slotStatus);

    if (!slotStatus?.attendance_day || !slotStatus?.current_slot || !subPhase) {
        return null;
    }

    return `${slotStatus.current_slot}-${subPhase}-${slotStatus.attendance_day}`;
}

/**
 * Home feed banner: show for the entire active slot (present and late).
 */
export function shouldShowHomeReminderBanner(slotStatus) {
    if (!slotStatus) {
        return false;
    }

    const { current_slot, phase, already_marked_slots } = slotStatus;

    if (phase !== 'active' || !current_slot) {
        return false;
    }

    return !already_marked_slots.includes(current_slot);
}

/**
 * Attendance page inline reminder: first present window only.
 */
export function shouldShowReminderBanner(slotStatus) {
    if (!shouldShowHomeReminderBanner(slotStatus)) {
        return false;
    }

    const { minutes_into_slot, present_minutes } = slotStatus;
    const presentWindow = present_minutes ?? 15;

    return minutes_into_slot !== null && minutes_into_slot < presentWindow;
}

export function homeReminderBannerText(slotStatus) {
    const label = slotLabel(slotStatus?.current_slot);
    const subPhase = attendanceSubPhase(slotStatus);

    if (subPhase === 'late') {
        return `You're late for ${label} — click to mark before the window closes.`;
    }

    return `${label} attendance is open — click to mark your presence.`;
}
