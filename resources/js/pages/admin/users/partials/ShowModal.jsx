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
    const [processing, setProcessing] = useState(false);
    const trainingName = useMemo(() => trainings.find(t => t.id === user.formation_id)?.name || '-', [trainings, user]);

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="sm:max-w-[780px] bg-light text-dark dark:bg-dark dark:text-light border border-alpha/20">
                <DialogHeader>
                    <DialogTitle className="text-dark dark:text-light">User Overview</DialogTitle>
                </DialogHeader>

                {/* Tabs */}
                <div className="px-1 mt-2">
                    <div className="flex gap-2 border-b border-alpha/20">
                        {['overview','access','attendance','projects','posts','notes'].map(tab => (
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
                                        <AvatarImage src={user.image} alt={user?.name} />
                                        <AvatarFallback className="rounded-full bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(user?.name)}
                                        </AvatarFallback>
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
                                <Label>Absences</Label>
                                <p className="mt-1">—</p>
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
                    <div className="mt-4 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                        <Label>Absences</Label>
                        <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">No absence data available.</div>
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

                {activeTab === 'notes' && (
                    <div className="mt-4 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                        <Label>Notes</Label>
                        <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">Add/view notes on the full profile page.</div>
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
