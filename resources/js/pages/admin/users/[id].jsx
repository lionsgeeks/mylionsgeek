import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';

const User = ({ user, trainings, close, open }) => {
    const getInitials = useInitials();

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="sm:max-w-[720px] bg-light text-dark dark:bg-dark dark:text-light">
                <DialogHeader>
                    <DialogTitle>User Information</DialogTitle>
                </DialogHeader>

                <form className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {/* Avatar */}
                    <div className="col-span-1 md:col-span-2 flex justify-center items-center gap-4 mb-4">
                        <div className="relative w-24 h-24">
                            <Avatar className="w-24 h-24 rounded-full overflow-hidden">
                                <AvatarImage src={user.image} alt={user?.name} />
                                <AvatarFallback className="rounded-full bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                    {getInitials(user?.name)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>

                    {/* Name */}
                    <div className="col-span-1">
                        <Label>Name</Label>
                        <p className="mt-1">{user.name || '-'}</p>
                    </div>

                    {/* Email */}
                    <div className="col-span-1">
                        <Label>Email</Label>
                        <p className="mt-1">{user.email || '-'}</p>
                    </div>

                    {/* Role */}
                    <div className="col-span-1">
                        <Label>Role</Label>
                        <p className="mt-1">{user.role || '-'}</p>
                    </div>

                    {/* Status */}
                    <div className="col-span-1">
                        <Label>Status</Label>
                        <p className="mt-1">{user.status || '-'}</p>
                    </div>

                    {/* Training */}
                    <div className="col-span-1 md:col-span-2">
                        <Label>Training</Label>
                        <p className="mt-1">
                            {
                                trainings.find(t => t.id === user.formation_id)?.name || '-'
                            }
                        </p>
                    </div>

                    {/* Phone */}
                    <div className="col-span-1">
                        <Label>Phone</Label>
                        <p className="mt-1">{user.phone || '-'}</p>
                    </div>

                    {/* CIN */}
                    <div className="col-span-1">
                        <Label>CIN</Label>
                        <p className="mt-1">{user.cin || '-'}</p>
                    </div>

                    {/* Close Button */}
                    <div className="col-span-1 md:col-span-2 flex justify-end gap-2 mt-4">
                        <Button onClick={close} variant="secondary">
                            Close
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default User;
