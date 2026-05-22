/** Status values admins can assign (Title Case, matches DB convention). */
export const ADMIN_USER_STATUSES = ['Working', 'Studying', 'Internship', 'Unemployed', 'Freelancing', 'Left', 'Certified'];

/** Statuses a student may choose after training (Studying is excluded). */
export const STUDENT_EDITABLE_STATUSES = ['Working', 'Internship', 'Unemployed', 'Freelancing', 'Certified', 'Left'];

// Match a stored status string to one of the select option values (case-insensitive).
export function normalizeStatusForSelect(rawStatus, options) {
    if (!rawStatus || !options?.length) {
        return '';
    }
    const raw = String(rawStatus).trim();
    const exact = options.find((option) => option === raw);
    if (exact) {
        return exact;
    }
    const lower = raw.toLowerCase();
    const match = options.find((option) => String(option).toLowerCase() === lower);

    return match ?? raw;
}

// Build select options; keep the user's current status visible even if it is legacy.
export function resolveStatusOptions({ isStaff, passedOptions, currentStatus }) {
    const base = isStaff
        ? passedOptions?.length
            ? passedOptions
            : ADMIN_USER_STATUSES
        : STUDENT_EDITABLE_STATUSES;

    if (!currentStatus) {
        return base;
    }

    const normalized = normalizeStatusForSelect(currentStatus, base);
    if (normalized && !base.includes(normalized)) {
        return [normalized, ...base];
    }

    return base;
}
