import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import { router, usePage } from '@inertiajs/react';
import React, { useEffect, useMemo, useState } from 'react';
import DeleteModal from '../../../../components/DeleteModal';
import LineStatistic from './components/LineChart';

const User = ({ user, trainings, close, open }) => {
    const { auth } = usePage().props;
    const getInitials = useInitials();
    const [activeTab, setActiveTab] = useState('overview');
    const [summary, setSummary] = useState({ discipline: null, recentAbsences: [] });
    const [notes, setNotes] = useState([]);
    const [docs, setDocs] = useState({ contracts: [], medicals: [] });
    const [chartData, setChartData] = useState();
    const [selectedFileName, setSelectedFileName] = useState('');
    const [SusupendAccount, setSusupendAccount] = useState(false);

    const fetchChart = async () => {
        const res = await fetch(`/admin/users/${user?.id}/attendance-chart`);
        const data = await res.json();
        setChartData(data);
    };
    useEffect(() => {
        fetchChart();
    }, [user?.id]);

    React.useEffect(() => {
        if (!open) return;
        fetch(`/admin/users/${user.id}/attendance-summary`)
            .then((r) => r.json())
            .then((data) =>
                setSummary({
                    discipline: data?.discipline ?? null,
                    recentAbsences: Array.isArray(data?.recentAbsences) ? data.recentAbsences : [],
                    monthlyFullDayAbsences: Array.isArray(data?.monthlyFullDayAbsences) ? data.monthlyFullDayAbsences : [],
                }),
            )
            .catch(() => setSummary({ discipline: null, recentAbsences: [] }));
        fetch(`/admin/users/${user.id}/notes`)
            .then((r) => r.json())
            .then((data) => setNotes(Array.isArray(data?.notes) ? data.notes : []))
            .catch(() => setNotes([]));
        fetch(`/admin/users/${user.id}/documents`)
            .then((r) => r.json())
            .then((data) =>
                setDocs({
                    contracts: Array.isArray(data?.contracts) ? data.contracts : [],
                    medicals: Array.isArray(data?.medicals) ? data.medicals : [],
                }),
            )
            .catch(() => setDocs({ contracts: [], medicals: [] }));
    }, [open, user.id]);
    const [processing, setProcessing] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadKind, setUploadKind] = useState('contract');
    const trainingName = useMemo(() => trainings.find((t) => t.id === user.formation_id)?.name || '-', [trainings, user]);

    const handleSsuspned = () => {
        if (SusupendAccount) {
            // Assuming the delete endpoint is something like this
            const newState = user.account_state === 1 ? 0 : 1;
            router.post(
                `/admin/users/update/${user.id}/account-state`,
                {
                    _method: 'put',
                    account_state: newState,
                },
                {
                    onSuccess: () => {
                        // Handle success
                        setSusupendAccount(false);
                    },
                    onError: () => {
                        // Handle error
                        setSusupendAccount(false);
                    },
                },
            );
        }
    };
    function timeAgo(timestamp) {
        if (!timestamp) return 'Never';

        const now = new Date();
        const last = new Date(timestamp + 'Z');

        const diff = Math.floor((now - last) / 1000); // seconds

        if (diff < 60) return 'Online now';
        if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
        if (diff < 172800) return 'Yesterday';
        return last.toLocaleDateString();
    }

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="max-h-[90vh] overflow-x-visible overflow-y-auto border border-alpha/20 bg-light text-dark sm:max-w-[900px] dark:bg-dark dark:text-light">
                <DialogHeader className="border-b border-alpha/10 pb-4">
                    <DialogTitle className="text-2xl font-bold text-dark dark:text-light">User Profile</DialogTitle>
                </DialogHeader>

                {/* Tabs Navigation */}
                <div className="mt-2 px-1">
                    <div className="flex gap-1 border-b border-alpha/10">
                        {['overview', 'attendance', 'projects', 'documents', 'notes'].map((tab) => (
                            <button
                                key={tab}
                                className={`rounded-t-lg px-4 py-3 text-sm font-medium capitalize transition-all ${
                                    activeTab === tab
                                        ? 'border-b-2 border-alpha bg-alpha/5 text-alpha'
                                        : 'text-neutral-600 hover:bg-alpha/5 hover:text-alpha dark:text-neutral-400'
                                }`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                {activeTab === 'overview' && (
                    <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Left Column - Profile Card */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-6 rounded-2xl border border-alpha/20 bg-gradient-to-br from-alpha/10 to-beta/10 px-6 py-10 shadow-lg">
                                <div className="flex flex-col items-center">
                                    {/* Avatar */}
                                    <div className="relative">
                                        <Avatar className="h-28 w-28 overflow-hidden rounded-full ring-4 ring-alpha/20">
                                            {user?.image ? (
                                                <AvatarImage src={`/storage/img/profile/${user.image}`} alt={user?.name} />
                                            ) : (
                                                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                    {getInitials(user?.name)}
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                        <div
                                            className={`absolute -right-1 -bottom-1 h-7 w-7 rounded-full border-4 border-light dark:border-dark ${
                                                timeAgo(user.last_online) === 'Online now' ? 'bg-green-500' : 'bg-neutral-500'
                                            }`}
                                        ></div>
                                    </div>

                                    {/* Name & Email */}
                                    <h3 className="mt-4 text-center text-xl font-bold text-dark dark:text-light">{user.name || '-'}</h3>
                                    <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">{user.email || '-'}</p>

                                    {/* Status Indicator */}
                                    <div className="mt-3 flex items-center gap-2 rounded-full border border-alpha/10 bg-white/60 px-3 py-1.5 backdrop-blur dark:bg-neutral-900/60">
                                        <span
                                            className={`h-2 w-2 rounded-full ${
                                                timeAgo(user.last_online) === 'Online now' ? 'animate-pulse bg-green-500' : 'bg-neutral-400'
                                            }`}
                                        ></span>
                                        <span
                                            className={`text-xs font-medium ${
                                                timeAgo(user.last_online) === 'Online now'
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-neutral-500 dark:text-neutral-400'
                                            }`}
                                        >
                                            {timeAgo(user.last_online)}
                                        </span>
                                    </div>

                                    {/* Role & Status Grid */}
                                    <div className="mt-6 grid w-full grid-cols-2 gap-3">
                                        {/* Role Section */}
                                        <div className="rounded-xl border border-alpha/10 bg-white/60 p-3 text-center backdrop-blur dark:bg-neutral-900/60">
                                            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Role</div>
                                            <div className="mt-1 flex flex-col space-y-1 text-sm font-bold text-dark dark:text-light">
                                                {user.role?.length > 0 ? (
                                                    user.role.map((r, index) => <span key={index}>{r}</span>)
                                                ) : (
                                                    <span className="text-neutral-500 dark:text-neutral-400">-</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status Section */}
                                        <div className="rounded-xl border border-alpha/10 bg-white/60 p-3 text-center backdrop-blur dark:bg-neutral-900/60">
                                            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Status</div>
                                            <div className="mt-1 text-sm font-bold text-green-600 dark:text-green-400">{user.status || '-'}</div>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="mt-6 w-full space-y-2">
                                        {/* <Button
                                            disabled={processing}
                                            onClick={() => router.visit(`/admin/users/${user.id}`)}
                                            className="w-full"
                                            size="sm"
                                        >
                                            Open Full Profile
                                        </Button> */}
                                        <Button
                                            disabled={processing}
                                            onClick={() => setSusupendAccount(true)}
                                            variant={user.account_state ? 'default' : 'danger'}
                                            className="w-full"
                                            size="sm"
                                        >
                                            {user.account_state ? 'Activate Account' : 'Suspend Account'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {SusupendAccount && (
                            <DeleteModal
                                open={SusupendAccount}
                                color={user.account_state === 1 ? 'alpha' : 'error'}
                                onOpenChange={setSusupendAccount}
                                title={user.account_state === 1 ? `Activate ${user.name}` : `Suspend ${user.name}`}
                                description={`This action cannot be undone. This will permanently ${user.account_state === 1 ? 'Activate' : 'Suspend'} ${user.name} .`}
                                confirmLabel={user.account_state === 1 ? 'Activate' : 'Suspend'}
                                cancelLabel="Cancel"
                                onConfirm={handleSsuspned}
                                loading={false}
                            />
                        )}

                        {/* Right Column - Details */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Personal Information Section */}
                            <div className="overflow-hidden rounded-2xl border border-alpha/20 bg-light shadow-sm dark:bg-dark">
                                <div className="border-b border-alpha/20 bg-gradient-to-r from-alpha/10 to-beta/10 px-5 py-3">
                                    <h4 className="font-bold text-dark dark:text-light">Personal Information</h4>
                                </div>
                                <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-alpha">Promo</Label>
                                        <p className="text-dark dark:text-light">{user.promo || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-alpha">Training</Label>
                                        <p className="text-dark dark:text-light">{trainingName}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-alpha">Phone</Label>
                                        <p className="text-dark dark:text-light">{user.phone || '-'}</p>
                                    </div>
                                    {auth.user?.role?.includes('admin') && (
                                        <div className="space-y-1">
                                            <Label className="text-xs font-semibold text-alpha">CIN</Label>
                                            <p className="text-dark dark:text-light">{user.cin || '-'}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Access Rights & Discipline Section */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Access Rights */}
                                <div className="overflow-hidden rounded-2xl border border-alpha/20 bg-light shadow-sm dark:bg-dark">
                                    <div className="border-b border-alpha/20 bg-gradient-to-r from-alpha/10 to-beta/10 px-5 py-3">
                                        <h4 className="font-bold text-dark dark:text-light">Access Rights</h4>
                                    </div>
                                    <div className="space-y-3 p-5">
                                        <div className="flex items-center justify-between rounded-lg border border-alpha/10 bg-white/60 p-3 backdrop-blur dark:bg-neutral-900/60">
                                            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Studio</span>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                    (user?.access?.access_studio ?? user?.access_studio)
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'
                                                }`}
                                            >
                                                {(user?.access?.access_studio ?? user?.access_studio) ? 'Granted' : 'No Access'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border border-alpha/10 bg-white/60 p-3 backdrop-blur dark:bg-neutral-900/60">
                                            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Cowork</span>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                    (user?.access?.access_cowork ?? user?.access_cowork)
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'
                                                }`}
                                            >
                                                {(user?.access?.access_cowork ?? user?.access_cowork) ? 'Granted' : 'No Access'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Discipline Score */}
                                <div className="overflow-hidden rounded-2xl border border-alpha/20 bg-gradient-to-br from-alpha/5 to-beta/5 shadow-sm">
                                    <div className="border-b border-alpha/20 bg-gradient-to-r from-alpha/10 to-beta/10 px-5 py-3">
                                        <h4 className="font-bold text-dark dark:text-light">Discipline Score</h4>
                                    </div>
                                    <div className="p-5">
                                        {summary.discipline == null ? (
                                            <p className="py-8 text-center text-sm text-neutral-500">No data available</p>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-4">
                                                <div className="text-5xl font-extrabold text-alpha">{summary.discipline}%</div>
                                                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-alpha to-beta transition-all duration-500"
                                                        style={{ width: `${Math.max(0, Math.min(100, summary.discipline))}%` }}
                                                    />
                                                </div>
                                                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">Overall Performance</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'attendance' && (
                    <div style={{ overflowX: 'auto' }} className="mt-4 rounded-xl border border-alpha/20 bg-light p-4 dark:bg-dark">
                        <LineStatistic chartData={chartData} />
                    </div>
                )}

                {activeTab === 'projects' && (
                    <div className="mt-4 rounded-xl border border-alpha/20 bg-light p-4 dark:bg-dark">
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">No projects to show here. View full profile for details.</div>
                    </div>
                )}

                {activeTab === 'documents' && (
                    <div className="mt-4 rounded-xl border border-alpha/20 bg-light p-5 dark:bg-dark">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <Label className="text-lg font-bold text-alpha">Documents</Label>
                                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Upload and manage user documents</p>
                            </div>
                        </div>

                        <form
                            className="rounded-xl border border-alpha/20 bg-gradient-to-br from-alpha/5 to-beta/5 p-4"
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.currentTarget;
                                setUploadError('');
                                const kind = form.querySelector('select[name="docKind"]').value;
                                const name = form.querySelector('input[name="docName"]').value.trim();
                                const type = form.querySelector('input[name="docType"]').value.trim();
                                const fileInput = form.querySelector('input[name="docFile"]');
                                const file = fileInput && fileInput.files && fileInput.files[0];
                                if (!file) return;
                                const body = new FormData();
                                body.append('kind', kind);
                                body.append('file', file);
                                if (name) body.append('name', name);
                                if (kind === 'contract' && type) body.append('type', type);
                                const csrf = document.querySelector('meta[name="csrf-token"]').getAttribute('content') || '';
                                body.append('_token', csrf);
                                const res = await fetch(`/admin/users/${user.id}/documents`, {
                                    method: 'POST',
                                    headers: {
                                        'X-CSRF-TOKEN': csrf,
                                        'X-Requested-With': 'XMLHttpRequest',
                                        Accept: 'application/json',
                                    },
                                    credentials: 'same-origin',
                                    body,
                                });
                                if (!res.ok) {
                                    try {
                                        const data = await res.json();
                                        if (res.status === 419) {
                                            setUploadError('Your session expired. Please reload the page and try again.');
                                        } else {
                                            setUploadError(data?.message || 'Upload failed');
                                        }
                                    } catch (_) {
                                        const text = await res.text();
                                        setUploadError(
                                            res.status === 419
                                                ? 'Your session expired. Please reload the page and try again.'
                                                : text || 'Upload failed',
                                        );
                                    }
                                    return;
                                }
                                const r = await fetch(`/admin/users/${user.id}/documents`, {
                                    credentials: 'same-origin',
                                    headers: { Accept: 'application/json' },
                                });
                                const d = await r.json();
                                setDocs({
                                    contracts: Array.isArray(d?.contracts) ? d.contracts : [],
                                    medicals: Array.isArray(d?.medicals) ? d.medicals : [],
                                });
                                form.reset();
                                setUploadKind('contract');
                                setSelectedFileName('');
                            }}
                        >
                            <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-5">
                                {/* Document Type Select */}
                                <div>
                                    <Label className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300">Document Type</Label>
                                    <select
                                        name="docKind"
                                        value={uploadKind}
                                        onChange={(e) => setUploadKind(e.target.value)}
                                        className="w-full rounded-lg border border-alpha/30 bg-white px-3 py-2.5 text-sm transition-all focus:ring-2 focus:ring-alpha/50 focus:outline-none dark:bg-neutral-800"
                                    >
                                        <option value="contract">Contract</option>
                                        <option value="medical">Medical</option>
                                    </select>
                                </div>

                                {/* Name/Description */}
                                <div>
                                    <Label className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                        {uploadKind === 'contract' ? 'Document Name' : 'Description'}
                                    </Label>
                                    <input
                                        name="docName"
                                        type="text"
                                        placeholder={uploadKind === 'contract' ? 'Enter name' : 'Enter description'}
                                        className="w-full rounded-lg border border-alpha/30 bg-white px-3 py-2.5 text-sm transition-all focus:ring-2 focus:ring-alpha/50 focus:outline-none dark:bg-neutral-800"
                                    />
                                </div>

                                {/* Contract Type (conditional) */}
                                {uploadKind === 'contract' ? (
                                    <div>
                                        <Label className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                            Contract Type
                                        </Label>
                                        <input
                                            name="docType"
                                            type="text"
                                            placeholder="e.g., Full-time"
                                            className="w-full rounded-lg border border-alpha/30 bg-white px-3 py-2.5 text-sm transition-all focus:ring-2 focus:ring-alpha/50 focus:outline-none dark:bg-neutral-800"
                                        />
                                    </div>
                                ) : (
                                    <input name="docType" type="hidden" value="" />
                                )}

                                {/* File Upload */}
                                <div>
                                    <Label className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300">Select File</Label>
                                    <label
                                        htmlFor="docFile"
                                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-alpha/40 bg-white px-3 py-2.5 text-sm text-neutral-600 transition-all hover:border-alpha hover:bg-alpha/5 dark:bg-neutral-800 dark:text-neutral-300"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                            />
                                        </svg>
                                        <span className="truncate">{selectedFileName || 'Choose file'}</span>
                                    </label>
                                    <input
                                        id="docFile"
                                        name="docFile"
                                        type="file"
                                        accept="application/pdf,image/*"
                                        required
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            setSelectedFileName(file ? file.name : '');
                                        }}
                                    />
                                </div>

                                {/* Upload Button */}
                                <div>
                                    <Button
                                        type="submit"
                                        className="w-full rounded-lg bg-alpha py-2.5 font-medium text-white transition-all hover:bg-alpha/90"
                                    >
                                        Upload
                                    </Button>
                                </div>
                            </div>
                        </form>

                        {uploadError && (
                            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                                {uploadError}
                            </div>
                        )}

                        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="rounded-xl border border-alpha/20 bg-gradient-to-br from-alpha/5 to-alpha/10 p-4">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <svg className="h-5 w-5 text-alpha" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                        <div className="text-sm font-bold text-alpha">Contracts</div>
                                    </div>
                                    <div className="rounded-full bg-alpha px-2.5 py-1 text-xs font-semibold text-white">
                                        {docs.contracts?.length || 0}
                                    </div>
                                </div>
                                {Array.isArray(docs.contracts) && docs.contracts.length > 0 ? (
                                    <ul className="space-y-2">
                                        {docs.contracts.map((d, i) => (
                                            <li
                                                key={i}
                                                className="group flex items-center justify-between rounded-lg border border-alpha/20 bg-white px-3 py-2.5 transition-all hover:bg-alpha/5 dark:bg-neutral-800 dark:hover:bg-alpha/10"
                                            >
                                                <span className="max-w-[70%] truncate text-sm text-neutral-700 dark:text-neutral-200">{d.name}</span>
                                                {d.id ? (
                                                    <a
                                                        className="flex items-center gap-1 text-xs font-semibold text-alpha hover:underline"
                                                        href={`/admin/users/${user.id}/documents/contract/${d.id}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        View
                                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                            />
                                                        </svg>
                                                    </a>
                                                ) : d.url ? (
                                                    <a
                                                        className="flex items-center gap-1 text-xs font-semibold text-alpha hover:underline"
                                                        href={d.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        View
                                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                            />
                                                        </svg>
                                                    </a>
                                                ) : null}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="py-8 text-center text-neutral-500">
                                        <svg className="mx-auto mb-2 h-12 w-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                        <p className="text-xs">No contracts uploaded</p>
                                    </div>
                                )}
                            </div>

                            <div className="rounded-xl border border-alpha/20 bg-gradient-to-br from-alpha/5 to-alpha/10 p-4">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <svg className="h-5 w-5 text-alpha" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                        <div className="text-sm font-bold text-alpha">Medical Certificates</div>
                                    </div>
                                    <div className="rounded-full bg-alpha px-2.5 py-1 text-xs font-semibold text-white">
                                        {docs.medicals?.length || 0}
                                    </div>
                                </div>
                                {Array.isArray(docs.medicals) && docs.medicals.length > 0 ? (
                                    <ul className="space-y-2">
                                        {docs.medicals.map((d, i) => (
                                            <li
                                                key={i}
                                                className="group flex items-center justify-between rounded-lg border border-alpha/20 bg-white px-3 py-2.5 transition-all hover:bg-alpha/5 dark:bg-neutral-800 dark:hover:bg-alpha/10"
                                            >
                                                <span className="max-w-[70%] truncate text-sm text-neutral-700 dark:text-neutral-200">{d.name}</span>
                                                {d.id ? (
                                                    <a
                                                        className="flex items-center gap-1 text-xs font-semibold text-alpha hover:underline"
                                                        href={`/admin/users/${user.id}/documents/medical/${d.id}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        View
                                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                            />
                                                        </svg>
                                                    </a>
                                                ) : d.url ? (
                                                    <a
                                                        className="flex items-center gap-1 text-xs font-semibold text-alpha hover:underline"
                                                        href={d.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        View
                                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                            />
                                                        </svg>
                                                    </a>
                                                ) : null}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="py-8 text-center text-neutral-500">
                                        <svg className="mx-auto mb-2 h-12 w-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                        <p className="text-xs">No medical certificates uploaded</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'notes' && (
                    <div className="mt-4 rounded-xl border border-alpha/20 bg-light p-4 dark:bg-dark">
                        <Label className="font-semibold text-alpha">Add Note</Label>
                        <form
                            className="mt-3 flex gap-2"
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.currentTarget;
                                const input = form.querySelector('input[name="newNote"]');
                                const value = (input?.value || '').trim();
                                if (!value) return;
                                try {
                                    const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                                    const res = await fetch(`/admin/users/${user.id}/notes`, {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'X-CSRF-TOKEN': csrf,
                                            'X-Requested-With': 'XMLHttpRequest',
                                        },
                                        credentials: 'same-origin',
                                        body: JSON.stringify({ note: value }),
                                    });
                                    if (res.ok) {
                                        const r = await fetch(`/admin/users/${user.id}/notes`);
                                        const d = await r.json();
                                        setNotes(Array.isArray(d?.notes) ? d.notes : []);
                                        if (input) input.value = '';
                                    }
                                } catch {}
                            }}
                        >
                            <input
                                name="newNote"
                                type="text"
                                placeholder="Add a note and press Enter"
                                className="flex-1 rounded-md border border-alpha/20 bg-transparent px-3 py-2"
                            />
                            <Button type="submit">Save</Button>
                        </form>

                        {Array.isArray(notes) && notes.length > 0 ? (
                            <ul className="mt-4 space-y-3 text-sm">
                                {notes.map((n, i) => (
                                    <li key={i} className="rounded-lg border border-alpha/20 bg-alpha/5 p-3 transition-colors hover:bg-alpha/10">
                                        <div className="font-medium text-dark dark:text-light">{n.note || n.text}</div>
                                        <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
                                            <span>{new Date(n.created_at).toLocaleString()}</span>
                                            <span>•</span>
                                            <span className="font-medium text-alpha">{n.author}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">No notes yet.</div>
                        )}
                    </div>
                )}

                <div className="mt-6 flex justify-end gap-2 border-t border-alpha/10 pt-4">
                    <Button onClick={close} variant="secondary">
                        Close
                    </Button>
                    <Button onClick={() => router.visit(`/admin/users/${user.id}`)}>View Full Profile</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default User;
