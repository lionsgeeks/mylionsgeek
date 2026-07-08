import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Send } from 'lucide-react';
import { useMemo, useState } from 'react';

const fieldClass =
    'border border-alpha/30 bg-light text-dark placeholder:text-dark/50 focus:border-alpha focus:ring-2 focus:ring-alpha dark:bg-dark dark:text-light dark:placeholder:text-light/50';

export default function NewsletterForm({ users = [], trainings = [], roles = [] }) {
    const [selectedTrainingIds, setSelectedTrainingIds] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [selectAllTrainings, setSelectAllTrainings] = useState(false);
    const [selectAllRoles, setSelectAllRoles] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [userSearchQuery, setUserSearchQuery] = useState('');

    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [emailBodyFr, setEmailBodyFr] = useState('');
    const [emailBodyAr, setEmailBodyAr] = useState('');
    const [emailBodyEn, setEmailBodyEn] = useState('');

    const [emailProcessing, setEmailProcessing] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);
    const [statusError, setStatusError] = useState(null);

    const searchedUsers = useMemo(() => {
        if (!userSearchQuery.trim()) return users;
        const q = userSearchQuery.toLowerCase();
        return users.filter(
            (user) => (user.name || '').toLowerCase().includes(q) || (user.email || '').toLowerCase().includes(q),
        );
    }, [userSearchQuery, users]);

    const handleTrainingToggle = (trainingId) => {
        if (trainingId === 'all') {
            setSelectAllTrainings(!selectAllTrainings);
            setSelectedTrainingIds([]);
            return;
        }

        const id = Number(trainingId);
        setSelectedTrainingIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
        setSelectAllTrainings(false);
    };

    const handleRoleToggle = (role) => {
        if (role === 'all') {
            setSelectAllRoles(!selectAllRoles);
            setSelectedRoles([]);
            return;
        }

        setSelectedRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
        setSelectAllRoles(false);
    };

    const formatRoleLabel = (role) =>
        role === 'studio_responsable' ? 'Responsable Studio' : role.charAt(0).toUpperCase() + role.slice(1);

    const selectedRecipients = useMemo(() => {
        let result = [];

        if (selectAllTrainings) {
            result = users;
        } else if (selectedTrainingIds.length > 0) {
            result = users.filter((u) => selectedTrainingIds.includes(u.formation_id));
        }

        if (selectAllRoles) {
            if (result.length === 0 && selectedTrainingIds.length === 0) {
                result = users;
            }
        } else if (selectedRoles.length > 0) {
            const roleUsers = users.filter((u) => {
                const userRoles = Array.isArray(u.role) ? u.role : [u.role];
                return userRoles.some((r) => selectedRoles.includes(r?.toLowerCase()));
            });

            if (result.length > 0) {
                const ids = new Set(roleUsers.map((u) => u.id));
                result = result.filter((u) => ids.has(u.id));
            } else {
                result = roleUsers;
            }
        }

        if (selectedUserIds.length > 0) {
            result = [...result, ...users.filter((u) => selectedUserIds.includes(u.id))];
        }

        return result.filter((u, i, arr) => arr.findIndex((x) => x.id === u.id) === i);
    }, [selectAllTrainings, selectAllRoles, selectedTrainingIds, selectedRoles, selectedUserIds, users]);

    const resetForm = () => {
        setSelectedTrainingIds([]);
        setSelectAllTrainings(false);
        setSelectedRoles([]);
        setSelectAllRoles(false);
        setSelectedUserIds([]);
        setUserSearchQuery('');
        setEmailSubject('');
        setEmailBody('');
        setEmailBodyFr('');
        setEmailBodyAr('');
        setEmailBodyEn('');
    };

    const handleSendEmail = async (e) => {
        e.preventDefault();
        setStatusMessage(null);
        setStatusError(null);

        if (!emailSubject.trim() || (!emailBody.trim() && !emailBodyFr.trim() && !emailBodyAr.trim() && !emailBodyEn.trim())) {
            setStatusError('Please provide a subject and at least one language content.');
            return;
        }

        setEmailProcessing(true);

        try {
            const response = await fetch('/admin/users/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    training_ids: selectAllTrainings ? null : selectedTrainingIds,
                    role_ids: selectAllRoles ? null : selectedRoles,
                    user_ids: selectedUserIds.length > 0 ? selectedUserIds : null,
                    subject: emailSubject,
                    body: emailBody.trim() || null,
                    body_fr: emailBodyFr.trim() || null,
                    body_ar: emailBodyAr.trim() || null,
                    body_en: emailBodyEn.trim() || null,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setStatusMessage(result.message || `Email sent to ${result.total_users || result.sent_count} users.`);
                resetForm();
            } else {
                setStatusError(result.error || 'Error sending email.');
            }
        } catch {
            setStatusError('Failed to send email. Try again.');
        }

        setEmailProcessing(false);
    };

    const hasAudience =
        selectAllTrainings ||
        selectAllRoles ||
        selectedTrainingIds.length > 0 ||
        selectedRoles.length > 0 ||
        selectedUserIds.length > 0;

    return (
        <Card className="border-alpha/20 bg-light text-dark dark:bg-dark dark:text-light">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-alpha" />
                    Compose newsletter
                </CardTitle>
                <CardDescription className="text-dark/60 dark:text-light/60">
                    Select recipients by training, role, or individual users, then compose a multilingual email.
                </CardDescription>
            </CardHeader>

            <CardContent>
                {statusMessage && (
                    <div className="mb-4 rounded-lg border border-good/30 bg-good/10 px-4 py-3 text-sm text-good">
                        {statusMessage}
                    </div>
                )}
                {statusError && (
                    <div className="mb-4 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                        {statusError}
                    </div>
                )}

                <form onSubmit={handleSendEmail} className="space-y-6">
                    <div>
                        <Label className="text-dark dark:text-light">Search users</Label>
                        <Input
                            value={userSearchQuery}
                            onChange={(e) => setUserSearchQuery(e.target.value)}
                            placeholder="Search for individual users..."
                            className={`mt-1 ${fieldClass}`}
                        />
                    </div>

                    {!userSearchQuery.trim() && (
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <div className="space-y-3 rounded-xl border border-alpha/20 p-4">
                                <Label className="text-base font-semibold">Select Training(s)</Label>

                                <div className="flex items-center gap-3 rounded-lg border border-alpha/15 p-3 transition-colors hover:bg-alpha/10">
                                    <Checkbox
                                        checked={selectAllTrainings}
                                        onClick={(e) => e.stopPropagation()}
                                        onCheckedChange={() => handleTrainingToggle('all')}
                                    />
                                    <label
                                        onClick={() => handleTrainingToggle('all')}
                                        className="flex-1 cursor-pointer text-sm font-medium"
                                    >
                                        All Trainings ({users.length} users)
                                    </label>
                                </div>

                                <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-alpha/15 p-3">
                                    {trainings.map((t) => {
                                        const count = users.filter((u) => u.formation_id === t.id).length;
                                        const isSelected = selectedTrainingIds.includes(t.id);

                                        return (
                                            <div
                                                key={t.id}
                                                className="flex items-center gap-3 rounded-md p-2.5 transition-colors hover:bg-alpha/10"
                                            >
                                                <Checkbox
                                                    checked={isSelected}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onCheckedChange={() => handleTrainingToggle(t.id)}
                                                />
                                                <label
                                                    className="flex cursor-pointer flex-col"
                                                    onClick={() => handleTrainingToggle(t.id)}
                                                >
                                                    <span className="text-sm font-medium">
                                                        {t.name}{' '}
                                                        <span className="text-dark/50 dark:text-light/50">({count})</span>
                                                    </span>
                                                    <span className="text-xs text-dark/50 dark:text-light/50">
                                                        Coach: {t.coach?.name || '—'}
                                                    </span>
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-3 rounded-xl border border-alpha/20 p-4">
                                <Label className="text-base font-semibold">Select Role(s)</Label>

                                <div className="flex items-center gap-3 rounded-lg border border-alpha/15 p-3 transition-colors hover:bg-alpha/10">
                                    <Checkbox
                                        checked={selectAllRoles}
                                        onClick={(e) => e.stopPropagation()}
                                        onCheckedChange={() => handleRoleToggle('all')}
                                    />
                                    <label className="flex-1 cursor-pointer text-sm" onClick={() => handleRoleToggle('all')}>
                                        All Roles ({users.length} users)
                                    </label>
                                </div>

                                <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-alpha/15 p-3">
                                    {roles.map((role) => {
                                        const count = users.filter((u) => {
                                            const userRoles = Array.isArray(u.role) ? u.role : [u.role];
                                            return userRoles.some((r) => r?.toLowerCase() === role.toLowerCase());
                                        }).length;

                                        const isSelected = selectedRoles.includes(role.toLowerCase());

                                        return (
                                            <div
                                                key={role}
                                                className="flex items-center gap-3 rounded-md p-2.5 transition-colors hover:bg-alpha/10"
                                            >
                                                <Checkbox
                                                    checked={isSelected}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onCheckedChange={() => handleRoleToggle(role.toLowerCase())}
                                                />
                                                <label
                                                    className="flex flex-1 cursor-pointer items-center"
                                                    onClick={() => handleRoleToggle(role.toLowerCase())}
                                                >
                                                    <span className="text-sm font-medium">
                                                        {formatRoleLabel(role)}{' '}
                                                        <span className="text-dark/50 dark:text-light/50">({count})</span>
                                                    </span>
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {userSearchQuery.trim() && (
                        <div className="space-y-3 rounded-xl border border-alpha/20 p-4">
                            <Label className="text-base font-semibold">Select Individual Users</Label>
                            <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-alpha/15 p-3">
                                {searchedUsers.length > 0 ? (
                                    searchedUsers.map((user) => {
                                        const isSelected = selectedUserIds.includes(user.id);
                                        const toggle = () =>
                                            setSelectedUserIds((prev) =>
                                                prev.includes(user.id)
                                                    ? prev.filter((id) => id !== user.id)
                                                    : [...prev, user.id],
                                            );

                                        return (
                                            <div
                                                key={user.id}
                                                className="flex items-center gap-3 rounded-md p-2.5 transition-colors hover:bg-alpha/10"
                                            >
                                                <Checkbox
                                                    checked={isSelected}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onCheckedChange={toggle}
                                                />
                                                <label className="flex flex-1 cursor-pointer flex-col" onClick={toggle}>
                                                    <span className="text-sm font-medium">{user.name || 'No name'}</span>
                                                    <span className="text-xs text-dark/50 dark:text-light/50">
                                                        {user.email}
                                                    </span>
                                                </label>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <span className="text-xs text-dark/50 dark:text-light/50">No user found</span>
                                )}
                            </div>

                            {selectedUserIds.length > 0 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedUserIds([])}
                                    className="w-full py-2 text-sm"
                                >
                                    Clear User Selection ({selectedUserIds.length})
                                </Button>
                            )}
                        </div>
                    )}

                    {hasAudience && (
                        <div className="rounded-lg border border-alpha/20 bg-alpha/10 p-4">
                            <p className="text-sm font-medium">
                                <span className="text-dark/60 dark:text-light/60">Sending to:</span>{' '}
                                <strong className="text-base">
                                    {selectedRecipients.length}
                                </strong>{' '}
                                user{selectedRecipients.length !== 1 && 's'}
                            </p>
                        </div>
                    )}

                    <div>
                        <Label htmlFor="newsletter-subject" className="text-dark dark:text-light">
                            Email Subject
                        </Label>
                        <Input
                            id="newsletter-subject"
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            placeholder="Enter email subject..."
                            className={`mt-1 ${fieldClass}`}
                            required
                        />
                    </div>

                    <div className="space-y-4">
                        <Label className="text-dark dark:text-light">
                            Message Content{' '}
                            <span className="text-xs font-normal text-dark/50 dark:text-light/50">
                                (at least 1 language required)
                            </span>
                        </Label>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">French 🇫🇷</Label>
                                <Textarea
                                    rows={6}
                                    value={emailBodyFr}
                                    onChange={(e) => setEmailBodyFr(e.target.value)}
                                    placeholder="French content..."
                                    className={`resize-y ${fieldClass}`}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Arabic 🇸🇦</Label>
                                <Textarea
                                    rows={6}
                                    dir="rtl"
                                    value={emailBodyAr}
                                    onChange={(e) => setEmailBodyAr(e.target.value)}
                                    placeholder="المحتوى العربي..."
                                    className={`resize-y ${fieldClass}`}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">English 🇬🇧</Label>
                                <Textarea
                                    rows={6}
                                    value={emailBodyEn}
                                    onChange={(e) => setEmailBodyEn(e.target.value)}
                                    placeholder="English content..."
                                    className={`resize-y ${fieldClass}`}
                                />
                            </div>
                        </div>

                        <details>
                            <summary className="cursor-pointer py-2 text-xs text-dark/50 hover:text-dark dark:text-light/50 dark:hover:text-light">
                                Legacy Single Body Field (Optional)
                            </summary>
                            <Textarea
                                rows={4}
                                className={`mt-2 resize-y ${fieldClass}`}
                                value={emailBody}
                                onChange={(e) => setEmailBody(e.target.value)}
                                placeholder="Legacy body content..."
                            />
                        </details>
                    </div>

                    <Button
                        type="submit"
                        disabled={
                            emailProcessing ||
                            !hasAudience ||
                            !emailSubject.trim() ||
                            (!emailBody.trim() && !emailBodyFr.trim() && !emailBodyAr.trim() && !emailBodyEn.trim())
                        }
                        className="w-full cursor-pointer gap-2 border border-alpha bg-alpha text-beta hover:bg-dark_gray hover:text-alpha dark:text-dark dark:hover:bg-alpha/80 dark:hover:text-dark"
                    >
                        {emailProcessing ? (
                            'Sending…'
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                Send to {selectedRecipients.length} user{selectedRecipients.length !== 1 ? 's' : ''}
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
