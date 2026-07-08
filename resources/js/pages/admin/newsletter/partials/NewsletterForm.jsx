import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { router } from '@inertiajs/react';
import { CheckCircle2, Mail, Send, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import NewsletterBodyEditor from './NewsletterBodyEditor';
import RecipientsModal from './RecipientsModal';

const LANGS = [
    { id: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr', placeholder: 'Rédigez le contenu en français…' },
    { id: 'ar', label: 'العربية', flag: '🇲🇦', dir: 'rtl', placeholder: 'اكتب محتوى النشرة بالعربية…' },
    { id: 'en', label: 'English', flag: '🇬🇧', dir: 'ltr', placeholder: 'Write the English content…' },
];

const isEmptyHtml = (html) => {
    if (!html) return true;
    const text = html
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();
    return text.length === 0;
};

export default function NewsletterForm({ users = [], trainings = [], roles = [], canSelectRoles = true }) {
    const [isRecipientsOpen, setIsRecipientsOpen] = useState(false);
    const [activeLang, setActiveLang] = useState('fr');
    const [recipientMode, setRecipientMode] = useState('training');

    const [selectedTrainingIds, setSelectedTrainingIds] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [selectAllTrainings, setSelectAllTrainings] = useState(false);
    const [selectAllRoles, setSelectAllRoles] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState([]);

    const [emailSubject, setEmailSubject] = useState('');
    const [emailBodyFr, setEmailBodyFr] = useState('');
    const [emailBodyAr, setEmailBodyAr] = useState('');
    const [emailBodyEn, setEmailBodyEn] = useState('');
    const [editorKey, setEditorKey] = useState(0);

    const [emailProcessing, setEmailProcessing] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);
    const [statusError, setStatusError] = useState(null);

    const bodies = {
        fr: emailBodyFr,
        ar: emailBodyAr,
        en: emailBodyEn,
    };

    const setBody = {
        fr: setEmailBodyFr,
        ar: setEmailBodyAr,
        en: setEmailBodyEn,
    };

    const selectedRecipients = useMemo(() => {
        if (recipientMode === 'training') {
            if (selectAllTrainings) return users;
            if (selectedTrainingIds.length === 0) return [];
            return users.filter((u) => selectedTrainingIds.includes(u.formation_id));
        }

        if (recipientMode === 'role') {
            if (selectAllRoles) return users;
            if (selectedRoles.length === 0) return [];
            return users.filter((u) => {
                const userRoles = Array.isArray(u.role) ? u.role : [u.role];
                return userRoles.some((r) => selectedRoles.includes(r?.toLowerCase()));
            });
        }

        if (selectedUserIds.length === 0) return [];
        return users.filter((u) => selectedUserIds.includes(u.id));
    }, [
        recipientMode,
        selectAllTrainings,
        selectAllRoles,
        selectedTrainingIds,
        selectedRoles,
        selectedUserIds,
        users,
    ]);

    const hasAudience =
        recipientMode === 'training'
            ? selectAllTrainings || selectedTrainingIds.length > 0
            : recipientMode === 'role'
              ? selectAllRoles || selectedRoles.length > 0
              : selectedUserIds.length > 0;

    const hasContent =
        !isEmptyHtml(emailBodyFr) || !isEmptyHtml(emailBodyAr) || !isEmptyHtml(emailBodyEn);

    const canSend = hasAudience && selectedRecipients.length > 0 && emailSubject.trim() && hasContent;

    const filledLangs = LANGS.filter((lang) => !isEmptyHtml(bodies[lang.id]));

    const resetForm = () => {
        setRecipientMode('training');
        setSelectedTrainingIds([]);
        setSelectAllTrainings(false);
        setSelectedRoles([]);
        setSelectAllRoles(false);
        setSelectedUserIds([]);
        setEmailSubject('');
        setEmailBodyFr('');
        setEmailBodyAr('');
        setEmailBodyEn('');
        setEditorKey((k) => k + 1);
        setActiveLang('fr');
    };

    const buildAudiencePayload = () => {
        if (!canSelectRoles && recipientMode === 'role') {
            return {
                mode: 'training',
                training_ids: selectAllTrainings ? null : selectedTrainingIds,
                role_ids: null,
                user_ids: null,
            };
        }

        if (recipientMode === 'training') {
            return {
                mode: 'training',
                training_ids: selectAllTrainings ? null : selectedTrainingIds,
                role_ids: null,
                user_ids: null,
            };
        }

        if (recipientMode === 'role') {
            return {
                mode: 'role',
                training_ids: null,
                role_ids: selectAllRoles ? null : selectedRoles,
                user_ids: null,
            };
        }

        return {
            mode: 'users',
            training_ids: null,
            role_ids: null,
            user_ids: selectedUserIds,
        };
    };

    const handleSendEmail = async (e) => {
        e.preventDefault();
        setStatusMessage(null);
        setStatusError(null);

        if (!canSend) {
            setStatusError('Select recipients and provide a subject with at least one language content.');
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
                    ...buildAudiencePayload(),
                    subject: emailSubject,
                    body: null,
                    body_fr: isEmptyHtml(emailBodyFr) ? null : emailBodyFr,
                    body_ar: isEmptyHtml(emailBodyAr) ? null : emailBodyAr,
                    body_en: isEmptyHtml(emailBodyEn) ? null : emailBodyEn,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setStatusMessage(result.message || `Email sent to ${result.total_users || result.sent_count} users.`);
                resetForm();
                router.reload({ only: ['history'] });
            } else {
                setStatusError(result.error || 'Error sending email.');
            }
        } catch {
            setStatusError('Failed to send email. Try again.');
        }

        setEmailProcessing(false);
    };

    return (
        <>
            {statusMessage && (
                <div className="rounded-lg border border-good/30 bg-good/10 px-4 py-3 text-sm text-good">
                    {statusMessage}
                </div>
            )}
            {statusError && (
                <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                    {statusError}
                </div>
            )}

            <form onSubmit={handleSendEmail} className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-5">
                    <Card className="border-alpha/20 bg-light text-dark lg:col-span-2 dark:bg-dark dark:text-light">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Users className="h-5 w-5 text-alpha" />
                                Recipients
                            </CardTitle>
                            <CardDescription className="text-dark/60 dark:text-light/60">
                                Choose who receives this newsletter before sending.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button
                                type="button"
                                onClick={() => setIsRecipientsOpen(true)}
                                className="w-full gap-2 border border-alpha bg-alpha text-black hover:bg-transparent hover:text-alpha"
                            >
                                <Users className="h-4 w-4" />
                                Select recipients
                            </Button>

                            <div
                                className={`rounded-lg border px-4 py-3 ${
                                    hasAudience
                                        ? 'border-alpha/30 bg-alpha/10'
                                        : 'border-alpha/15 bg-muted/30'
                                }`}
                            >
                                <p className="text-sm font-medium">
                                    {hasAudience ? (
                                        <>
                                            <span className="text-2xl font-bold text-beta dark:text-alpha">
                                                {selectedRecipients.length}
                                            </span>{' '}
                                            <span className="text-dark/70 dark:text-light/70">
                                                user{selectedRecipients.length !== 1 ? 's' : ''} selected
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-dark/60 dark:text-light/60">No recipients selected yet</span>
                                    )}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newsletter-subject">Email subject</Label>
                                <Input
                                    id="newsletter-subject"
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    placeholder="Enter email subject..."
                                    className="border-alpha/30 bg-white dark:bg-dark_gray"
                                />
                            </div>

                            <div className="rounded-lg border border-alpha/15 bg-muted/20 p-3">
                                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-dark/50 dark:text-light/50">
                                    Languages ready
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {LANGS.map((lang) => {
                                        const filled = !isEmptyHtml(bodies[lang.id]);
                                        return (
                                            <span
                                                key={lang.id}
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    filled
                                                        ? 'bg-good/15 text-good'
                                                        : 'bg-muted text-dark/50 dark:text-light/50'
                                                }`}
                                            >
                                                {filled && <CheckCircle2 className="h-3 w-3" />}
                                                {lang.flag} {lang.label}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={emailProcessing || !canSend}
                                className="w-full gap-2 border border-alpha bg-alpha text-black hover:bg-transparent hover:text-alpha disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {emailProcessing ? (
                                    'Sending…'
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        {hasAudience
                                            ? `Send to ${selectedRecipients.length} user${selectedRecipients.length !== 1 ? 's' : ''}`
                                            : 'Send newsletter'}
                                    </>
                                )}
                            </Button>
                            {!canSend && (
                                <p className="text-center text-xs text-dark/50 dark:text-light/50">
                                    Select recipients, add a subject, and fill at least one language.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-alpha/20 bg-light text-dark lg:col-span-3 dark:bg-dark dark:text-light">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Mail className="h-5 w-5 text-alpha" />
                                Message content
                            </CardTitle>
                            <CardDescription className="text-dark/60 dark:text-light/60">
                                Write rich content per language. At least one language is required.
                                {filledLangs.length > 0 && (
                                    <span className="ml-1 text-good">
                                        ({filledLangs.length}/{LANGS.length} filled)
                                    </span>
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={activeLang} onValueChange={setActiveLang} className="w-full">
                                <TabsList className="mb-4 grid h-auto w-full grid-cols-3 gap-1 bg-alpha/10 p-1 dark:bg-light/10">
                                    {LANGS.map((lang) => {
                                        const filled = !isEmptyHtml(bodies[lang.id]);
                                        return (
                                            <TabsTrigger
                                                key={lang.id}
                                                value={lang.id}
                                                className="gap-1.5 data-[state=active]:bg-alpha data-[state=active]:text-black data-[state=active]:shadow-sm"
                                            >
                                                <span>{lang.flag}</span>
                                                <span className="hidden sm:inline">{lang.label}</span>
                                                {filled && <span className="h-1.5 w-1.5 rounded-full bg-good" />}
                                            </TabsTrigger>
                                        );
                                    })}
                                </TabsList>

                                {LANGS.map((lang) => (
                                    <TabsContent key={lang.id} value={lang.id} className="mt-0 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-medium">
                                                {lang.flag} {lang.label}
                                            </Label>
                                            {lang.dir === 'rtl' && (
                                                <span className="text-xs text-dark/50 dark:text-light/50">RTL layout</span>
                                            )}
                                        </div>
                                        {activeLang === lang.id && (
                                            <NewsletterBodyEditor
                                                key={`${lang.id}-${editorKey}`}
                                                value={bodies[lang.id]}
                                                onChange={setBody[lang.id]}
                                                placeholder={lang.placeholder}
                                                dir={lang.dir}
                                            />
                                        )}
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </form>

            <RecipientsModal
                open={isRecipientsOpen}
                setOpen={setIsRecipientsOpen}
                users={users}
                trainings={trainings}
                roles={roles}
                canSelectRoles={canSelectRoles}
                recipientMode={recipientMode}
                setRecipientMode={setRecipientMode}
                selectedTrainingIds={selectedTrainingIds}
                setSelectedTrainingIds={setSelectedTrainingIds}
                selectAllTrainings={selectAllTrainings}
                setSelectAllTrainings={setSelectAllTrainings}
                selectedRoles={selectedRoles}
                setSelectedRoles={setSelectedRoles}
                selectAllRoles={selectAllRoles}
                setSelectAllRoles={setSelectAllRoles}
                selectedUserIds={selectedUserIds}
                setSelectedUserIds={setSelectedUserIds}
                recipientsCount={selectedRecipients.length}
            />
        </>
    );
}
