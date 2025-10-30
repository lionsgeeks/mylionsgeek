import React, { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import LineStatistic from './components/LineChart';

const User = ({ user, trainings, close, open }) => {
    const getInitials = useInitials();
    const [activeTab, setActiveTab] = useState('overview');
    const [summary, setSummary] = useState({ discipline: null, recentAbsences: [] });
    const [notes, setNotes] = useState([]);
    const [docs, setDocs] = useState({ contracts: [], medicals: [] });
    const [chartData, setChartData] = useState();


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
    }, [open, user.id]);
    const [processing, setProcessing] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadKind, setUploadKind] = useState('contract');
    const trainingName = useMemo(() => trainings.find(t => t.id === user.formation_id)?.name || '-', [trainings, user]);


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
                <DialogHeader className="border-b border-alpha/10 pb-4">
                    <DialogTitle className="text-dark dark:text-light text-2xl font-bold">User Profile</DialogTitle>
                </DialogHeader>

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
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
                        {/* Left Column - Profile Card */}
                        <div className="lg:col-span-4 space-y-4">
                            {/* Status Badge */}
                            {/* <div className="bg-gradient-to-br from-alpha/5 to-alpha/10 rounded-xl p-4 border border-alpha/20">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Status</span>
                                    <span className={`flex items-center gap-2 text-sm font-semibold ${timeAgo(user.last_online) === 'Online now'
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-neutral-500 dark:text-neutral-400'
                                        }`}>
                                        <span className={`w-2 h-2 rounded-full ${timeAgo(user.last_online) === 'Online now'
                                                ? 'bg-green-500 animate-pulse'
                                                : 'bg-neutral-400'
                                            }`}></span>
                                        {timeAgo(user.last_online)}
                                    </span>
                                </div>
                            </div> */}

                            {/* Profile Card */}
                            <div className="bg-gradient-to-br from-alpha/10 to-beta/10 rounded-2xl p-6 border border-alpha/20 shadow-sm">
                                <div className="flex flex-col items-center">
                                    <div className="relative">
                                        <Avatar className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-alpha/20">
                                            {user?.image ? (
                                                <AvatarImage
                                                    src={`/storage/img/profile/${user.image}`}
                                                    alt={user?.name}
                                                />
                                            ) : (
                                                <AvatarFallback className="rounded-full bg-alpha text-white text-2xl font-bold">
                                                    {getInitials(user?.name)}
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                        <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-4 border-light dark:border-dark ${timeAgo(user.last_online) === 'Online now'
                                            ? 'bg-green-400'
                                            : 'bg-neutral-400'
                                            }`}></div>
                                    </div>

                                    <h3 className="mt-4 text-xl font-bold text-dark dark:text-light">{user.name || '-'}</h3>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{user.email || '-'}</p>

                                    <div className="mt-4 w-full grid grid-cols-2 gap-2">
                                        <div className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur rounded-lg p-3 text-center border border-alpha/10">
                                            <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Role</div>
                                            <div className="text-sm font-bold text-dark dark:text-light mt-1">{user.role || '-'}</div>
                                        </div>
                                        <div className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur rounded-lg p-3 text-center border border-alpha/10">
                                            <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Status</div>
                                            <div className="text-sm font-bold text-green-600 dark:text-green-400 mt-1">{user.status || '-'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Access Card */}
                            <div className="rounded-xl p-4 border border-alpha/20 shadow-sm bg-light dark:bg-dark">
                                <h4 className="font-semibold text-dark dark:text-light mb-3">Access Rights</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Studio</span>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${(user?.access?.access_studio ?? user?.access_studio)
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                            : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                                            }`}>
                                            {(user?.access?.access_studio ?? user?.access_studio) ? 'Granted' : 'No Access'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Cowork</span>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${(user?.access?.access_cowork ?? user?.access_cowork)
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                            : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                                            }`}>
                                            {(user?.access?.access_cowork ?? user?.access_cowork) ? 'Granted' : 'No Access'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Details */}
                        <div className="lg:col-span-8 space-y-4">
                            {/* Info Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="rounded-xl p-4 border border-alpha/20 shadow-sm hover:shadow-md transition-shadow bg-light dark:bg-dark">
                                    <Label className="text-xs font-semibold text-alpha">Promo</Label>
                                    <p className="mt-2 text-dark dark:text-light">{user.promo || '-'}</p>
                                </div>

                                <div className="rounded-xl p-4 border border-alpha/20 shadow-sm hover:shadow-md transition-shadow bg-light dark:bg-dark">
                                    <Label className="text-xs font-semibold text-alpha">Training</Label>
                                    <p className="mt-2 text-dark dark:text-light">{trainingName}</p>
                                </div>

                                <div className="rounded-xl p-4 border border-alpha/20 shadow-sm hover:shadow-md transition-shadow bg-light dark:bg-dark">
                                    <Label className="text-xs font-semibold text-alpha">Phone</Label>
                                    <p className="mt-2 text-dark dark:text-light">{user.phone || '-'}</p>
                                </div>

                                <div className="rounded-xl p-4 border border-alpha/20 shadow-sm hover:shadow-md transition-shadow bg-light dark:bg-dark">
                                    <Label className="text-xs font-semibold text-alpha">CIN</Label>
                                    <p className="mt-2 text-dark dark:text-light">{user.cin || '-'}</p>
                                </div>
                            </div>

                            {/* Discipline Card */}
                            <div className="rounded-xl p-5 border border-alpha/20 shadow-sm bg-gradient-to-br from-alpha/5 to-beta/5">
                                <Label className="text-xs font-semibold text-alpha">Discipline Score</Label>
                                {summary.discipline == null ? (
                                    <p className="mt-2 text-sm text-neutral-500">No data available</p>
                                ) : (
                                    <div className="mt-3 flex items-center gap-4">
                                        <div className="text-4xl font-extrabold text-alpha">{summary.discipline}%</div>
                                        <div className="flex-1 h-3 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-alpha to-beta transition-all duration-500"
                                                style={{ width: `${Math.max(0, Math.min(100, summary.discipline))}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Quick Actions */}
                            <div className="rounded-xl p-4 border border-alpha/20 shadow-sm bg-light dark:bg-dark">
                                <Label className="text-xs font-semibold text-alpha">Quick Actions</Label>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <Button disabled={processing} onClick={() => router.visit(`/admin/users/${user.id}`)} variant="secondary" size="sm">
                                        Open Full Profile
                                    </Button>
                                    <Button
                                        disabled={processing}
                                        onClick={() => {
                                            setProcessing(true);
                                            const newState = user.account_state === 1 ? 0 : 1;
                                            router.post(`/admin/users/update/${user.id}/account-state`, { _method: 'put', account_state: newState }, {
                                                onFinish: () => setProcessing(false)
                                            });
                                        }}
                                        variant={user.account_state ? 'default' : 'danger'}
                                        size="sm"
                                    >
                                        {user.account_state ? 'Activate Account' : 'Suspend Account'}
                                    </Button>
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
                    <div className="mt-4 rounded-xl border border-alpha/20 p-4 bg-light dark:bg-dark">
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">No projects to show here. View full profile for details.</div>
                    </div>
                )}

                {activeTab === 'documents' && (
                    <div className="mt-4 rounded-xl border border-alpha/20 p-4 bg-light dark:bg-dark">
                        <Label className="font-semibold text-alpha">Upload Document</Label>
                        <form className="mt-3 grid grid-cols-1 md:grid-cols-6 gap-2 items-end" onSubmit={async (e) => {
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
                        }}>
                            <div className="md:col-span-1">
                                <Label className="text-xs">Type</Label>
                                <select name="docKind" value={uploadKind} onChange={(e) => setUploadKind(e.target.value)} className="w-full rounded-md border border-alpha/20 px-3 py-2 bg-transparent text-xs">
                                    <option value="contract">Contract</option>
                                    <option value="medical">Medical certificate</option>
                                </select>
                            </div>
                            <div className={uploadKind === 'contract' ? 'md:col-span-2' : 'md:col-span-3'}>
                                <Label className="text-xs">{uploadKind === 'contract' ? 'Name' : 'Description'}</Label>
                                <input name="docName" type="text" placeholder={uploadKind === 'contract' ? 'Name' : 'Description'} className="w-full rounded-md border border-alpha/20 px-3 py-2 bg-transparent text-xs" />
                            </div>
                            {uploadKind === 'contract' ? (
                                <div className="md:col-span-2">
                                    <Label className="text-xs">Type</Label>
                                    <input name="docType" type="text" placeholder="Type" className="w-full rounded-md border border-alpha/20 px-3 py-2 bg-transparent text-xs" />
                                </div>
                            ) : (
                                <input name="docType" type="hidden" value="" />
                            )}
                            <div className="md:col-span-2">
                                <Label className="text-xs">File</Label>
                                <input name="docFile" type="file" accept="application/pdf,image/*" required className="w-full text-xs" />
                            </div>
                            <div className="md:col-span-1">
                                <Button type="submit" size="sm" className="w-full">Upload</Button>
                            </div>
                        </form>
                        {uploadError ? (
                            <div className="mt-2 text-xs text-red-600 dark:text-red-400 break-words">{uploadError}</div>
                        ) : null}

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-lg border border-alpha/20 p-4 bg-alpha/5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-sm font-semibold text-alpha">Contracts</div>
                                    <div className="text-xs px-2 py-1 rounded-full bg-alpha text-white">{docs.contracts?.length || 0}</div>
                                </div>
                                {Array.isArray(docs.contracts) && docs.contracts.length > 0 ? (
                                    <ul className="space-y-2 text-sm">
                                        {docs.contracts.map((d, i) => (
                                            <li key={i} className="flex items-center justify-between rounded-lg border border-alpha/20 px-3 py-2 bg-light dark:bg-dark hover:bg-alpha/5 transition-colors">
                                                <span className="truncate max-w-[70%]">{d.name}</span>
                                                {d.id ? (
                                                    <a className="text-alpha text-xs font-medium hover:underline" href={`/admin/users/${user.id}/documents/contract/${d.id}`} target="_blank" rel="noreferrer">View</a>
                                                ) : (d.url ? <a className="text-alpha text-xs font-medium hover:underline" href={d.url} target="_blank" rel="noreferrer">View</a> : null)}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-xs text-neutral-500">No contracts.</div>
                                )}
                            </div>
                            <div className="rounded-lg border border-alpha/20 p-4 bg-beta/5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-sm font-semibold text-beta">Medical Certificates</div>
                                    <div className="text-xs px-2 py-1 rounded-full bg-beta text-white">{docs.medicals?.length || 0}</div>
                                </div>
                                {Array.isArray(docs.medicals) && docs.medicals.length > 0 ? (
                                    <ul className="space-y-2 text-sm">
                                        {docs.medicals.map((d, i) => (
                                            <li key={i} className="flex items-center justify-between rounded-lg border border-alpha/20 px-3 py-2 bg-light dark:bg-dark hover:bg-beta/5 transition-colors">
                                                <span className="truncate max-w-[70%]">{d.name}</span>
                                                {d.id ? (
                                                    <a className="text-beta text-xs font-medium hover:underline" href={`/admin/users/${user.id}/documents/medical/${d.id}`} target="_blank" rel="noreferrer">View</a>
                                                ) : (d.url ? <a className="text-beta text-xs font-medium hover:underline" href={d.url} target="_blank" rel="noreferrer">View</a> : null)}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-xs text-neutral-500">No medical certificates.</div>
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

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-alpha/10">
                    <Button onClick={close} variant="secondary">Close</Button>
                    <Button onClick={() => router.visit(`/admin/users/${user.id}`)}>View Full Profile</Button>
                </div>
            </DialogContent>
        </Dialog >
    );
};

export default User;
