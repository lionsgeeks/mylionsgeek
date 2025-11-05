import React, { useEffect, useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import LineStatistic from './components/LineChart';
import { Input } from '@headlessui/react';
import DeleteModal from '../../../../components/DeleteModal';
const User = ({ user, trainings, close, open }) => {
    const { auth } = usePage().props

const [projects, setProjects] = useState([]);
const [rejectingId, setRejectingId] = useState(null);
const [rejectionReason, setRejectionReason] = useState('');
const [processingId, setProcessingId] = useState(null);

    const getInitials = useInitials();
    const [activeTab, setActiveTab] = useState('overview');
    const [summary, setSummary] = useState({ discipline: null, recentAbsences: [] });
    const [notes, setNotes] = useState([]);
    const [docs, setDocs] = useState({ contracts: [], medicals: [] });
    const [chartData, setChartData] = useState();
    const [selectedFileName, setSelectedFileName] = useState('');
    const [SusupendAccount, setSusupendAccount] = useState(false);


    const fetchChart = async () => {
        const res = await fetch(`/admin/users/${user?.id}/attendance-chart`)
        const data = await res.json()
        setChartData(data)
    }
    useEffect(() => {

        fetchChart()

    }, [user?.id])


    React.useEffect(() => {
        if (!open) return;
        fetch(`/admin/users/${user.id}/attendance-summary`)
            .then(r => r.json())
            .then((data) => setSummary({
                discipline: data?.discipline ?? null,
                recentAbsences: Array.isArray(data?.recentAbsences) ? data.recentAbsences : [],
                monthlyFullDayAbsences: Array.isArray(data?.monthlyFullDayAbsences) ? data.monthlyFullDayAbsences : [],
            }))
            .catch(() => setSummary({ discipline: null, recentAbsences: [] }));
        fetch(`/admin/users/${user.id}/notes`)
            .then(r => r.json())
            .then((data) => setNotes(Array.isArray(data?.notes) ? data.notes : []))
            .catch(() => setNotes([]));
        fetch(`/admin/users/${user.id}/documents`)
            .then(r => r.json())
            .then((data) => setDocs({
                contracts: Array.isArray(data?.contracts) ? data.contracts : [],
                medicals: Array.isArray(data?.medicals) ? data.medicals : [],
            }))
            .catch(() => setDocs({ contracts: [], medicals: [] }));
    // Fetch projects
    fetch(`/admin/users/${user.id}/projects`)
        .then(r => r.json())
        .then((data) => setProjects(Array.isArray(data?.projects) ? data.projects : []))
        .catch(() => setProjects([]));
    }, [open, user.id]);
    const [processing, setProcessing] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadKind, setUploadKind] = useState('contract');
    const trainingName = useMemo(() => trainings.find(t => t.id === user.formation_id)?.name || '-', [trainings, user]);

    const handleSsuspned = () => {
        if (SusupendAccount) {
            // Assuming the delete endpoint is something like this
            const newState = user.account_state === 1 ? 0 : 1;
            router.post(`/admin/users/update/${user.id}/account-state`, {
                _method: 'put',
                account_state: newState,
            }, {
                onSuccess: () => {
                    // Handle success
                    setSusupendAccount(false)
                },
                onError: () => {
                    // Handle error
                    setSusupendAccount(false)
                }
            });
        }
    }
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
            <DialogContent className="sm:max-w-[900px]  max-h-[90vh] overflow-y-auto overflow-x-visible bg-light text-dark dark:bg-dark dark:text-light border border-alpha/20">
                {/* <DialogHeader className="border-b border-alpha/10">
                    <DialogTitle className="text-dark dark:text-light text-xl pb-2 font-bold">{user?.name}</DialogTitle>
                </DialogHeader> */}

                {/* Tabs Navigation */}
                <div className="px-1 mt-2">
                    <div className="flex gap-1 border-b border-alpha/10">
                        {['overview', 'attendance', 'projects', 'documents', 'notes'].map(tab => (
                            <button
                                key={tab}
                                className={`px-4 py-3 text-sm font-medium capitalize rounded-t-lg transition-all ${activeTab === tab
                                    ? 'bg-alpha/5 text-alpha border-b-2 border-alpha'
                                    : 'text-neutral-600 dark:text-neutral-400 hover:text-alpha hover:bg-alpha/5'
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                        {/* Left Column - Profile Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-gradient-to-br from-alpha/10 to-beta/10 rounded-2xl px-6 py-10 border border-alpha/20 shadow-lg sticky top-6">
                                <div className="flex flex-col items-center">
                                    {/* Avatar */}
                                    <div className="relative">
                                        <Avatar
                                            className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-alpha/20"
                                            image={user.image}
                                            name={user.name}
                                            lastActivity={user.last_online || null}
                                            onlineCircleClass="w-7 h-7"
                                        />
                                        <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-4 border-light dark:border-dark ${timeAgo(user.last_online) === 'Online now' ? 'bg-green-500' : 'bg-neutral-500'
                                            }`}></div>
                                    </div>

                                    {/* Name & Email */}
                                    <h3 className="mt-4 text-xl font-bold text-dark dark:text-light text-center">{user.name || '-'}</h3>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">{user.email || '-'}</p>

                                    {/* Status Indicator */}
                                    <div className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-neutral-900/60 backdrop-blur border border-alpha/10">
                                        <span className={`w-2 h-2 rounded-full ${timeAgo(user.last_online) === 'Online now' ? 'bg-green-500 animate-pulse' : 'bg-neutral-400'
                                            }`}></span>
                                        <span className={`text-xs font-medium ${timeAgo(user.last_online) === 'Online now'
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-neutral-500 dark:text-neutral-400'
                                            }`}>
                                            {timeAgo(user.last_online)}
                                        </span>
                                    </div>

                                    {/* Role & Status Grid */}
                                    <div className="mt-6 w-full grid grid-cols-2 gap-3">
                                        {/* Role Section */}
                                        <div className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur rounded-xl p-3 text-center border border-alpha/10">
                                            <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Role</div>
                                            <div className="text-sm font-bold text-dark dark:text-light mt-1 flex flex-col space-y-1">
                                                {user.role?.length > 0 ? (
                                                    user.role.map((r, index) => (
                                                        <span key={index}>{r}</span>
                                                    ))
                                                ) : (
                                                    <span className="text-neutral-500 dark:text-neutral-400">-</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status Section */}
                                        <div className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur rounded-xl p-3 text-center border border-alpha/10">
                                            <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Status</div>
                                            <div className="text-sm font-bold text-green-600 dark:text-green-400 mt-1">
                                                {user.status || '-'}
                                            </div>
                                        </div>
                                    </div>


                                    {/* Quick Actions */}
                                    <div className="mt-6 w-full flex flex-col gap-2 space-y-2">
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
                                        <Button onClick={() => router.visit(`/admin/users/${user.id}`)}>View Full Profile</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {SusupendAccount && <DeleteModal
                            open={SusupendAccount}
                            color={user.account_state === 1 ? 'alpha' : 'error'}
                            onOpenChange={setSusupendAccount}
                            title={user.account_state === 1 ? `Activate ${user.name}` : `Suspend ${user.name}`}
                            description={`This action cannot be undone. This will permanently ${user.account_state === 1 ? 'Activate' : 'Suspend'} ${user.name} .`}
                            confirmLabel={user.account_state === 1 ? 'Activate' : 'Suspend'}
                            cancelLabel="Cancel"
                            onConfirm={handleSsuspned}
                            loading={false}
                        />}

                        {/* Right Column - Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Personal Information Section */}
                            <div className="rounded-2xl border border-alpha/20 shadow-sm overflow-hidden bg-light dark:bg-dark">
                                <div className="bg-gradient-to-r from-alpha/10 to-beta/10 px-5 py-3 border-b border-alpha/20">
                                    <h4 className="font-bold text-dark dark:text-light">Personal Information</h4>
                                </div>
                                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Access Rights */}
                                <div className="rounded-2xl border border-alpha/20 shadow-sm overflow-hidden bg-light dark:bg-dark">
                                    <div className="bg-gradient-to-r from-alpha/10 to-beta/10 px-5 py-3 border-b border-alpha/20">
                                        <h4 className="font-bold text-dark dark:text-light">Access Rights</h4>
                                    </div>
                                    <div className="p-5 space-y-3">
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/60 dark:bg-neutral-900/60 backdrop-blur border border-alpha/10">
                                            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Studio</span>
                                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${(user?.access?.access_studio ?? user?.access_studio)
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                                                }`}>
                                                {(user?.access?.access_studio ?? user?.access_studio) ? 'Granted' : 'No Access'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/60 dark:bg-neutral-900/60 backdrop-blur border border-alpha/10">
                                            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Cowork</span>
                                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${(user?.access?.access_cowork ?? user?.access_cowork)
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                                                }`}>
                                                {(user?.access?.access_cowork ?? user?.access_cowork) ? 'Granted' : 'No Access'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Discipline Score */}
                                <div className="rounded-2xl border border-alpha/20 shadow-sm overflow-hidden bg-gradient-to-br from-alpha/5 to-beta/5">
                                    <div className="bg-gradient-to-r from-alpha/10 to-beta/10 px-5 py-3 border-b border-alpha/20">
                                        <h4 className="font-bold text-dark dark:text-light">Discipline Score</h4>
                                    </div>
                                    <div className="p-5">
                                        {summary.discipline == null ? (
                                            <p className="text-sm text-neutral-500 text-center py-8">No data available</p>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-4">
                                                <div className="text-5xl font-extrabold text-alpha">
                                                    {summary.discipline}%
                                                </div>
                                                <div className="mt-4 w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-alpha to-beta transition-all duration-500 rounded-full"
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
                    <div style={{ overflowX: 'auto' }} className="mt-4 rounded-xl border border-alpha/20 p-4 bg-light dark:bg-dark">
                        <LineStatistic chartData={chartData} />
                    </div>
                )}

                {activeTab === 'projects' && (
                    <div className="p-6 space-y-4">
                        <h3 className="text-lg font-semibold">Projects</h3>
                        
                        {projects && projects.length > 0 ? (
                            <div className="space-y-3">
                                {projects.map((project) => (
                                    <div 
                                        key={project.id} 
                                        className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg flex gap-4 "
                                    >
                                        {/* Image */}
                                        {project.image && (
                                            <div className="w-50 h-30 rounded-lg overflow-hidden flex-shrink-0">
                                                <img
                                                    src={`/storage/${project.image}`}
                                                    alt={project.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div className="flex flex-col justify-between w-full">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-semibold mb-1">{project.title}</h4>
                                                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2 line-clamp-2">
                                                                {project.description}
                                                            </p>
                                                        <p className="text-xs text-neutral-500">
                                                            {new Date(project.created_at).toLocaleString('en-US', {
                                                                year: 'numeric',
                                                                month: '2-digit',
                                                                day: '2-digit',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                hour12: false
                                                            })}
                                                        </p>
                                                </div>
                                                <span
                                                    className={`px-2 py-1 text-xs rounded-full font-semibold whitespace-nowrap ${
                                                        project.status === 'approved'
                                                            ? 'bg-green-600 text-green-50 dark:text-white'
                                                            : project.status === 'rejected'
                                                            ? 'bg-red-600 text-red-50 dark:text-white'
                                                            : 'bg-yellow-600 text-yellow-50 dark:text-white'
                                                    }`}
                                                >
                                                    {project.status === 'pending' ? 'Pending' : project.status}
                                                </span>
                                            </div>


                                            <div className="flex gap-2 flex-wrap mb-1">
                                                {project.url && (
                                                    <a
                                                        href={project.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[var(--color-alpha)] hover:underline text-sm font-medium"
                                                    >
                                                        View →
                                                    </a>
                                                )}

                                                {project.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setProcessingId(project.id);
                                                                router.post(`/admin/projects/${project.id}/approve`, {}, {
                                                                    onSuccess: () => {
                                                                        setProjects(prev => prev.filter(p => p.id !== project.id));

                                                                    },
                                                                    onFinish: () => setProcessingId(null),
                                                                });
                                                            }}
                                                            disabled={processingId === project.id}
                                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium cursor-pointer"
                                                        >
                                                            {processingId === project.id ? 'Approving...' : 'Approve'}
                                                        </button>
                                                        <button
                                                            onClick={() => setRejectingId(project.id)}
                                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium cursor-pointer"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Reject Modal */}
                                        {rejectingId === project.id && (
                                            <Dialog open={rejectingId === project.id} onOpenChange={() => {
                                                setRejectingId(null);
                                                setRejectionReason('');
                                            }}>
                                                <DialogContent className="max-w-sm">
                                                    <DialogHeader>
                                                        <DialogTitle>Reject Project</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <Label className="text-sm">Rejection Reason *</Label>
                                                            <textarea
                                                                value={rejectionReason}
                                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                                placeholder="Explain why this project is being rejected..."
                                                                rows={3}
                                                                className="w-full p-2 border border-neutral-300 rounded text-sm dark:bg-neutral-800 dark:border-neutral-600"
                                                            />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setRejectingId(null);
                                                                    setRejectionReason('');
                                                                }}
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                onClick={() => {
                                                                    if (!rejectionReason.trim()) {
                                                                        alert('Please provide a rejection reason');
                                                                        return;
                                                                    }
                                                                    setProcessingId(project.id);
                                                                    router.post(`/admin/projects/${project.id}/reject`, {
                                                                        rejection_reason: rejectionReason,
                                                                    }, {
                                                                        onSuccess: () => {
                                                                            setProjects(prev => prev.filter(p => p.id !== project.id));

                                                                            setRejectingId(null);
                                                                            setRejectionReason('');
                                                                        },
                                                                        onFinish: () => setProcessingId(null),
                                                                    });
                                                                }}
                                                                disabled={processingId === project.id}
                                                                className="bg-red-600 hover:bg-red-700"
                                                            >
                                                                {processingId === project.id ? 'Rejecting...' : 'Reject'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-neutral-500 text-center py-8">No projects</p>
                        )}
                    </div>
                )}

                {activeTab === 'documents' && (
                    <div className="mt-4 rounded-xl border border-alpha/20 p-5 bg-light dark:bg-dark">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <Label className="text-lg font-bold text-alpha">Documents</Label>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Upload and manage user documents</p>
                            </div>
                        </div>

                        <form className="bg-gradient-to-br from-alpha/5 to-beta/5 rounded-xl p-4 border border-alpha/20" onSubmit={async (e) => {
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
                                    'Accept': 'application/json',
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
                                    setUploadError(res.status === 419 ? 'Your session expired. Please reload the page and try again.' : (text || 'Upload failed'));
                                }
                                return;
                            }
                            const r = await fetch(`/admin/users/${user.id}/documents`, { credentials: 'same-origin', headers: { 'Accept': 'application/json' } });
                            const d = await r.json();
                            setDocs({ contracts: Array.isArray(d?.contracts) ? d.contracts : [], medicals: Array.isArray(d?.medicals) ? d.medicals : [] });
                            form.reset();
                            setUploadKind('contract');
                            setSelectedFileName('');
                        }}>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                                {/* Document Type Select */}
                                <div>
                                    <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">Document Type</Label>
                                    <select
                                        name="docKind"
                                        value={uploadKind}
                                        onChange={(e) => setUploadKind(e.target.value)}
                                        className="w-full rounded-lg border border-alpha/30 px-3 py-2.5 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-alpha/50 transition-all"
                                    >
                                        <option value="contract">Contract</option>
                                        <option value="medical">Medical</option>
                                    </select>
                                </div>

                                {/* Name/Description */}
                                <div>
                                    <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                                        {uploadKind === 'contract' ? 'Document Name' : 'Description'}
                                    </Label>
                                    <input
                                        name="docName"
                                        type="text"
                                        placeholder={uploadKind === 'contract' ? 'Enter name' : 'Enter description'}
                                        className="w-full rounded-lg border border-alpha/30 px-3 py-2.5 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-alpha/50 transition-all"
                                    />
                                </div>

                                {/* Contract Type (conditional) */}
                                {uploadKind === 'contract' ? (
                                    <div>
                                        <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">Contract Type</Label>
                                        <input
                                            name="docType"
                                            type="text"
                                            placeholder="e.g., Full-time"
                                            className="w-full rounded-lg border border-alpha/30 px-3 py-2.5 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-alpha/50 transition-all"
                                        />
                                    </div>
                                ) : (
                                    <input name="docType" type="hidden" value="" />
                                )}

                                {/* File Upload */}
                                <div>
                                    <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">Select File</Label>
                                    <label
                                        htmlFor="docFile"
                                        className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-alpha/40 px-3 py-2.5 bg-white dark:bg-neutral-800 text-sm text-neutral-600 dark:text-neutral-300 hover:border-alpha hover:bg-alpha/5 transition-all cursor-pointer"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
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
                                        className="w-full bg-alpha hover:bg-alpha/90 text-white font-medium py-2.5 rounded-lg transition-all"
                                    >
                                        Upload
                                    </Button>
                                </div>
                            </div>
                        </form>

                        {uploadError && (
                            <div className="mt-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-2 border border-red-200 dark:border-red-800">
                                {uploadError}
                            </div>
                        )}

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-xl border border-alpha/20 p-4 bg-gradient-to-br from-alpha/5 to-alpha/10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-alpha" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <div className="text-sm font-bold text-alpha">Contracts</div>
                                    </div>
                                    <div className="text-xs px-2.5 py-1 rounded-full bg-alpha text-white font-semibold">
                                        {docs.contracts?.length || 0}
                                    </div>
                                </div>
                                {Array.isArray(docs.contracts) && docs.contracts.length > 0 ? (
                                    <ul className="space-y-2">
                                        {docs.contracts.map((d, i) => (
                                            <li key={i} className="flex items-center justify-between rounded-lg border border-alpha/20 px-3 py-2.5 bg-white dark:bg-neutral-800 hover:bg-alpha/5 dark:hover:bg-alpha/10 transition-all group">
                                                <span className="truncate max-w-[70%] text-sm text-neutral-700 dark:text-neutral-200">{d.name}</span>
                                                {d.id ? (
                                                    <a className="text-alpha text-xs font-semibold hover:underline flex items-center gap-1" href={`/admin/users/${user.id}/documents/contract/${d.id}`} target="_blank" rel="noreferrer">
                                                        View
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </a>
                                                ) : (d.url ? <a className="text-alpha text-xs font-semibold hover:underline flex items-center gap-1" href={d.url} target="_blank" rel="noreferrer">
                                                    View
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a> : null)}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center py-8 text-neutral-500">
                                        <svg className="w-12 h-12 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-xs">No contracts uploaded</p>
                                    </div>
                                )}
                            </div>

                            <div className="rounded-xl border border-alpha/20 p-4 bg-gradient-to-br from-alpha/5 to-alpha/10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-alpha" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <div className="text-sm font-bold text-alpha">Medical Certificates</div>
                                    </div>
                                    <div className="text-xs px-2.5 py-1 rounded-full bg-alpha text-white font-semibold">
                                        {docs.medicals?.length || 0}
                                    </div>
                                </div>
                                {Array.isArray(docs.medicals) && docs.medicals.length > 0 ? (
                                    <ul className="space-y-2">
                                        {docs.medicals.map((d, i) => (
                                            <li key={i} className="flex items-center justify-between rounded-lg border border-alpha/20 px-3 py-2.5 bg-white dark:bg-neutral-800 hover:bg-alpha/5 dark:hover:bg-alpha/10 transition-all group">
                                                <span className="truncate max-w-[70%] text-sm text-neutral-700 dark:text-neutral-200">{d.name}</span>
                                                {d.id ? (
                                                    <a className="text-alpha text-xs font-semibold hover:underline flex items-center gap-1" href={`/admin/users/${user.id}/documents/medical/${d.id}`} target="_blank" rel="noreferrer">
                                                        View
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </a>
                                                ) : (d.url ? <a className="text-alpha text-xs font-semibold hover:underline flex items-center gap-1" href={d.url} target="_blank" rel="noreferrer">
                                                    View
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a> : null)}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center py-8 text-neutral-500">
                                        <svg className="w-12 h-12 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-xs">No medical certificates uploaded</p>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                )}

                {activeTab === 'notes' && (
                    <div className="mt-4 rounded-xl border border-alpha/20 p-4 bg-light dark:bg-dark">
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
                                } catch { }
                            }}
                        >
                            <input name="newNote" type="text" placeholder="Add a note and press Enter" className="flex-1 rounded-md border border-alpha/20 px-3 py-2 bg-transparent" />
                            <Button type="submit">Save</Button>
                        </form>

                        {Array.isArray(notes) && notes.length > 0 ? (
                            <ul className="mt-4 space-y-3 text-sm">
                                {notes.map((n, i) => (
                                    <li key={i} className="rounded-lg border border-alpha/20 p-3 bg-alpha/5 hover:bg-alpha/10 transition-colors">
                                        <div className="font-medium text-dark dark:text-light">{n.note || n.text}</div>
                                        <div className="text-xs text-neutral-500 mt-2 flex items-center gap-2">
                                            <span>{new Date(n.created_at).toLocaleString()}</span>
                                            <span>•</span>
                                            <span className="text-alpha font-medium">{n.author}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">No notes yet.</div>
                        )}
                    </div>
                )}

                {/* <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-alpha/10">
                    <Button onClick={close} variant="secondary">Close</Button>
                </div> */}
            </DialogContent>
        </Dialog >
    );
};

export default User;
