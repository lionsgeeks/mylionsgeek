import React, { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';

const User = ({ user, trainings, close, open }) => {
    const getInitials = useInitials();
    const [activeTab, setActiveTab] = useState('overview');
    const [summary, setSummary] = useState({ discipline: null, recentAbsences: [] });
    const [notes, setNotes] = useState([]);
    const [docs, setDocs] = useState({ contracts: [], medicals: [] });

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

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="sm:max-w-[780px] overflow-x-visible bg-light text-dark dark:bg-dark dark:text-light border border-alpha/20">
                <DialogHeader>
                    <DialogTitle className="text-dark dark:text-light">User Overview</DialogTitle>
                </DialogHeader>

                {/* Tabs */}
                <div className="px-1 mt-2">
                    <div className="flex gap-2 border-b border-alpha/20">
                        {['overview', 'access', 'attendance', 'projects', 'posts', 'documents', 'notes'].map(tab => (
                            <button
                                key={tab}
                                className={`px-3 py-2 text-sm capitalize ${activeTab === tab ? 'border-b-2 border-alpha text-alpha' : 'text-neutral-600 dark:text-neutral-400'}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
                        <div className="md:col-span-1">
                            <div className="flex flex-col items-center gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                                <div className="relative w-24 h-24">
                                    <Avatar className="w-24 h-24 rounded-full overflow-hidden">
                                        {user?.image ? (
                                            <AvatarImage
                                                src={`/storage/img/profile/${user.image}`}
                                                alt={user?.name}
                                            />
                                        ) : (
                                        <AvatarFallback className="rounded-full bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(user?.name)}
                                        </AvatarFallback>
                                        )}
                                    </Avatar>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-semibold">{user.name || '-'}</div>
                                    <div className="text-xs text-neutral-600 dark:text-neutral-400">{user.email || '-'}</div>
                                </div>
                                <div className="w-full grid grid-cols-2 gap-2 text-xs">
                                    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-2">
                                        <div className="text-neutral-500">Role</div>
                                        <div className="font-medium">{user.role || '-'}</div>
                                    </div>
                                    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-2">
                                        <div className="text-neutral-500">Status</div>
                                        <div className="font-medium">{user.status || '-'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-1 space-y-3">
                            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                                <Label>Promo</Label>
                                <p className="mt-1">{user.promo || '-'}</p>
                            </div>
                            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                                <Label>Training</Label>
                                <p className="mt-1">{trainingName}</p>
                            </div>
                            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                                <Label>Discipline</Label>
                                {summary.discipline == null ? (
                                    <p className="mt-1 text-sm text-neutral-500">No data</p>
                                ) : (
                                    <div className="mt-1 flex items-center gap-3">
                                        <div className="text-2xl font-extrabold text-alpha">{summary.discipline}%</div>
                                        <div className="flex-1 h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                                            <div className="h-full bg-alpha" style={{ width: `${Math.max(0, Math.min(100, summary.discipline))}%` }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="md:col-span-1 space-y-3">
                            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                                <Label>Phone</Label>
                                <p className="mt-1">{user.phone || '-'}</p>
                            </div>
                            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                                <Label>CIN</Label>
                                <p className="mt-1">{user.cin || '-'}</p>
                            </div>
                            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                                <Label>Access</Label>
                                <div className="mt-1 text-sm space-y-1">
                                    <div>Studio: {(user?.access?.access_studio ?? user?.access_studio) ? 'Yes' : 'No'}</div>
                                    <div>Cowork: {(user?.access?.access_cowork ?? user?.access_cowork) ? 'Yes' : 'No'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'access' && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                            <Label>Studio Access</Label>
                            <p className="mt-1 text-sm">{(user?.access?.access_studio ?? user?.access_studio) ? 'Granted' : 'Not granted'}</p>
                        </div>
                        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                            <Label>Cowork Access</Label>
                            <p className="mt-1 text-sm">{(user?.access?.access_cowork ?? user?.access_cowork) ? 'Granted' : 'Not granted'}</p>
                        </div>
                        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                            <Label>Quick actions</Label>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <Button  disabled={processing} onClick={() => router.visit(`/admin/users/${user.id}`)} variant="secondary">Open full profile</Button>
                                <Button 
                                disabled={processing} onClick={() => {
                                    setProcessing(true);
                                    const newState = user.account_state === 1 ? 0 : 1;
                                    router.post(`/admin/users/update/${user.id}/account-state`, { _method: 'put', account_state: newState }, {
                                        onFinish: () => setProcessing(false)
                                    });
                                }}
                                variant={ user.account_state ? 'default' : 'danger'}
                                >{user.account_state ? 'Activate' : 'Suspend'}</Button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'attendance' && (
                    <div style={{ overflowX: 'auto' }} className="mt-4  rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                        {/* Monthly full-day absences summary */}
                        <div className="mt-4 ">
                            <Label>Full-day absences per month</Label>
                            {Array.isArray(summary.monthlyFullDayAbsences) && summary.monthlyFullDayAbsences.length > 0 ? (
                                <div className="mt-2 pb-2 -mx-3 px-3 w-full overflow-x-auto custom-scrollbar">
                                    <div className="grid grid-flow-col auto-cols-[220px] gap-3 pr-3">
                                        {summary.monthlyFullDayAbsences.map((m, idx) => (
                                            <div
                                                key={idx}
                                                className="min-w-[220px] flex items-center justify-between rounded-lg border border-alpha/20 px-3 py-2 text-sm bg-neutral-50/60 dark:bg-neutral-900/40"
                                            >
                                                <span className="text-neutral-700 dark:text-neutral-300">
                                                    {new Date(m.month + '-01').toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                                                </span>
                                                <span className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-semibold ${m.fullDayAbsences > 0 ? 'bg-error/10 text-error' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'}`}>
                                                    {m.fullDayAbsences}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">No full-day absences recorded.</div>
                            )}
                        </div>
                        <Label>Absences</Label>
                        {Array.isArray(summary.recentAbsences) && summary.recentAbsences.length > 0 ? (
                            <div className="mt-2 space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                                {summary.recentAbsences.map((row, i) => (
                                    <div key={i} className="flex items-center justify-between rounded-lg border border-alpha/20 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                                        <div className="text-sm font-medium">{new Date(row.date).toLocaleDateString()}</div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className={`px-2 py-0.5 rounded-full ${row.morning==='absent'?'bg-error/10 text-error':'bg-neutral-100 dark:bg-neutral-800'}`}>AM: {row.morning}</span>
                                            <span className={`px-2 py-0.5 rounded-full ${row.lunch==='absent'?'bg-error/10 text-error':'bg-neutral-100 dark:bg-neutral-800'}`}>Noon: {row.lunch}</span>
                                            <span className={`px-2 py-0.5 rounded-full ${row.evening==='absent'?'bg-error/10 text-error':'bg-neutral-100 dark:bg-neutral-800'}`}>PM: {row.evening}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">No absences.</div>
                        )}

                        {/* Legend */}
                        {/* <div className="mt-3 text-xs text-neutral-500 dark:text-neutral-400 flex flex-wrap items-center gap-2">
                            <span>Legend:</span>
                            <span className="px-2 py-0.5 rounded-full bg-error/10 text-error">absent</span>
                            <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800">present/other</span>
                        </div> */}
                    </div>
                )}

                {activeTab === 'projects' && (
                    <div className="mt-4 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">No projects to show here. View full profile for details.</div>
                    </div>
                )}

                {activeTab === 'posts' && (
                    <div className="mt-4 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">No posts yet.</div>
                    </div>
                )}

                {activeTab === 'documents' && (
                    <div className="mt-4 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                        <Label>Documents</Label>
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
                            // include CSRF both as header and form field for compatibility with multipart
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

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm font-medium">Contracts</div>
                                    <div className="text-xs text-neutral-500">{docs.contracts?.length || 0}</div>
                                </div>
                                {Array.isArray(docs.contracts) && docs.contracts.length > 0 ? (
                                    <ul className="space-y-2 text-sm">
                                        {docs.contracts.map((d, i) => (
                                            <li key={i} className="flex items-center justify-between rounded-lg border border-alpha/20 px-3 py-2 bg-neutral-50/50 dark:bg-neutral-900/30">
                                                <span className="truncate max-w-[70%]">{d.name}</span>
                                                {d.id ? (
                                                    <a className="text-alpha text-xs" href={`/admin/users/${user.id}/documents/contract/${d.id}`} target="_blank" rel="noreferrer">View</a>
                                                ) : (d.url ? <a className="text-alpha text-xs" href={d.url} target="_blank" rel="noreferrer">View</a> : null)}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-xs text-neutral-500">No contracts.</div>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm font-medium">Medical certificates</div>
                                    <div className="text-xs text-neutral-500">{docs.medicals?.length || 0}</div>
                                </div>
                                {Array.isArray(docs.medicals) && docs.medicals.length > 0 ? (
                                    <ul className="space-y-2 text-sm">
                                        {docs.medicals.map((d, i) => (
                                            <li key={i} className="flex items-center justify-between rounded-lg border border-alpha/20 px-3 py-2 bg-neutral-50/50 dark:bg-neutral-900/30">
                                                <span className="truncate max-w-[70%]">{d.name}</span>
                                                {d.id ? (
                                                    <a className="text-alpha text-xs" href={`/admin/users/${user.id}/documents/medical/${d.id}`} target="_blank" rel="noreferrer">View</a>
                                                ) : (d.url ? <a className="text-alpha text-xs" href={d.url} target="_blank" rel="noreferrer">View</a> : null)}
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
                    <div className="mt-4 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                        <Label className="text-dark dark:text-light">Notes</Label>
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
                                        // reload notes
                                        const r = await fetch(`/admin/users/${user.id}/notes`);
                                        const d = await r.json();
                                        setNotes(Array.isArray(d?.notes) ? d.notes : []);
                                        if (input) input.value = '';
                                    }
                                } catch {}
                            }}
                        >
                            <input name="newNote" type="text" placeholder="Add a note and press Enter" className="flex-1 rounded-md border border-alpha/20 px-3 py-2 bg-transparent" />
                            <Button type="submit">Save</Button>
                        </form>

                        {Array.isArray(notes) && notes.length > 0 ? (
                            <ul className="mt-3 space-y-2 text-sm">
                                {notes.map((n, i) => (
                                    <li key={i} className="rounded-lg border border-alpha/20 p-2">
                                        <div className="font-medium text-dark dark:text-light">{n.note || n.text}</div>
                                        <div className="text-xs text-neutral-500 mt-1">{new Date(n.created_at).toLocaleString()} • {n.author}</div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">No notes yet.</div>
                        )}
                    </div>
                )}

                <div className="flex justify-end gap-2 mt-5">
                    <Button onClick={close} variant="secondary">Close</Button>
                    <Button  onClick={() => router.visit(`/admin/users/${user.id}`)} className="">View full profile</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default User;
