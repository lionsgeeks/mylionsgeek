export function formatApplicationStatusLabel(value) {
    const map = {
        pending: 'Pending',
        under_review: 'Under review',
        rejected: 'Rejected',
        accepted: 'Accepted',
    };
    return map[value] ?? String(value ?? 'pending').replace(/_/g, ' ');
}

/** Default application deadline for new job forms (30 days ahead, YYYY-MM-DD). */
export function defaultApplicationDeadline() {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().slice(0, 10);
}

export function formatApplicationDeadline(value) {
    if (!value) {
        return '—';
    }
    const parsed = new Date(`${value}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }
    return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatJobTypeLabel(value) {
    const map = {
        full_time: 'Full-time',
        internship: 'Internship',
        part_time: 'Part-time',
        contract: 'Contract',
    };
    return map[value] ?? String(value).replace(/_/g, ' ');
}

export function buildJobsQuery(jobType, skills) {
    const q = {};
    if (jobType) {
        q.job_type = jobType;
    }
    if (skills.length) {
        q.skills = skills;
    }
    return q;
}
