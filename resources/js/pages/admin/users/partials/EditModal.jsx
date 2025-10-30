import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInitials } from '@/hooks/use-initials';
import { router } from '@inertiajs/react';
import { ImagePlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import RolesMultiSelect from './RolesMultiSelect';

const EditUserModal = ({ open, editedUser, onClose, roles, status, trainings }) => {
    const getInitials = useInitials();
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        roles: [],
        status: '',
        formation_id: null,
        phone: '',
        cin: '',
        image: null,
        access_studio: '', // Add default value for access_studio
        access_cowork: '', // Add default value for access_cowork
    });

    // Load user data into form when modal opens or user changes
    useEffect(() => {
        if (editedUser) {
            let rolesArray = [];
            if (Array.isArray(editedUser.role)) {
                rolesArray = editedUser.role;
            } else if (typeof editedUser.role === 'string' && editedUser.role.length > 0) {
                try {
                    const parsed = JSON.parse(editedUser.role);
                    if (Array.isArray(parsed)) rolesArray = parsed;
                    else
                        rolesArray = editedUser.role
                            .split(',')
                            .map((r) => r.trim())
                            .filter(Boolean);
                } catch {
                    rolesArray = editedUser.role
                        .split(',')
                        .map((r) => r.trim())
                        .filter(Boolean);
                }
            }
            rolesArray = rolesArray.map((r) => String(r).toLowerCase());
            setFormData({
                name: editedUser.name || '',
                email: editedUser.email || '',
                roles: rolesArray,
                status: editedUser.status || '',
                formation_id: editedUser.formation_id || null,
                phone: editedUser.phone || '',
                cin: editedUser.cin || '',
                image: editedUser.image || null, // User's image from DB (if exists)
                access_studio: editedUser.access_studio === 1 ? 'Yes' : 'No', // Convert 1/0 to Yes/No
                access_cowork: editedUser.access_cowork === 1 ? 'Yes' : 'No', // Convert 1/0 to Yes/No
            });
        }
    }, [editedUser]);

    const submitEdit = (e) => {
        e.preventDefault();

        if (!editedUser) return;

        const form = new FormData();

        form.append('_method', 'put'); // Ensure to override method if using put
        form.append('name', formData.name);
        form.append('email', formData.email);
        formData.roles.forEach((r) => form.append('roles[]', r)); // Send roles as array
        form.append('status', formData.status);
        form.append('phone', formData.phone);
        form.append('cin', formData.cin);
        form.append('formation_id', formData.formation_id || '');

        // Convert Yes/No back to 1/0 for submission
        form.append('access_studio', formData.access_studio === 'Yes' ? 1 : 0);
        form.append('access_cowork', formData.access_cowork === 'Yes' ? 1 : 0);

        // Append image ONLY if it's a File
        if (formData.image instanceof File) {
            form.append('image', formData.image);
        }

        // Sending data to backend
        router.post(`/admin/users/update/${editedUser.id}`, form, {
            onSuccess: () => {
                setErrors({});
                onClose();
            },
            onError: (err) => {
                setErrors(err);
                console.error('Form submission error:', err);
            },
        });
    };

    function resendLink(userId) {
        router.post(`/admin/users/${userId}/resend-link`);
    }

    const resetPassword = (id) => {
        router.post(`/admin/users/${id}/reset-password`, {
            onSuccess: () => {
                alert('Password reset successfully');
            },
            onError: () => {
                alert('Error resetting password');
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="max-h-[80vh] overflow-y-auto bg-light text-dark sm:max-w-[720px] dark:bg-dark dark:text-light">
                <DialogHeader>
                    <DialogTitle>Modify user</DialogTitle>
                </DialogHeader>
                <form onSubmit={submitEdit} className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Avatar */}
                    <div className="col-span-1 mb-4 flex items-center justify-center gap-4 md:col-span-2">
                        <div className="relative h-24 w-24">
                            <Avatar className="h-24 w-24 overflow-hidden rounded-full">
                                {/* If the user has an image, display it */}
                                {formData.image ? (
                                    <AvatarImage
                                        src={
                                            formData.image instanceof File
                                                ? URL.createObjectURL(formData.image)
                                                : `/storage/img/profile/${formData.image}`
                                        }
                                        alt="User Avatar"
                                    />
                                ) : (
                                    // Fallback to initials if no image is provided
                                    <AvatarFallback className="rounded-full bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                        {getInitials(formData.name)}
                                    </AvatarFallback>
                                )}
                            </Avatar>

                            <label className="absolute right-0 bottom-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-alpha hover:bg-alpha/80">
                                <ImagePlus size={18} className="text-white" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 cursor-pointer opacity-0"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        setFormData({ ...formData, image: file });
                                    }}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="col-span-1">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="col-span-1">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div className="col-span-1">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div className="col-span-1">
                        <Label htmlFor="cin">CIN</Label>
                        <Input id="cin" value={formData.cin} onChange={(e) => setFormData({ ...formData, cin: e.target.value })} />
                    </div>

                    {/* Roles - multi-select dropdown with chips */}
                    <div className="col-span-1">
                        <Label>Status</Label>
                        <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {status.map((s, idx) => (
                                    <SelectItem key={idx} value={s}>
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-1">
                        <Label htmlFor="roles">Roles</Label>
                        <RolesMultiSelect roles={formData.roles} onChange={(newRoles) => setFormData({ ...formData, roles: newRoles })} />
                    </div>

                    {/* Access Studio Field */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="access-studio">Access Studio</Label>
                        <Select
                            id="access-studio"
                            value={formData.access_studio}
                            onValueChange={(v) => setFormData({ ...formData, access_studio: v })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Access Studio" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={'Yes'}>Yes</SelectItem>
                                <SelectItem value={'No'}>No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Access Cowork Field */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="access-cowork">Access Cowork</Label>
                        <Select
                            id="access-cowork"
                            value={formData.access_cowork}
                            onValueChange={(v) => setFormData({ ...formData, access_cowork: v })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Access Cowork" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={'Yes'}>Yes</SelectItem>
                                <SelectItem value={'No'}>No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <Label>Training</Label>
                        <Select
                            value={formData.formation_id ? String(formData.formation_id) : ''}
                            onValueChange={(v) => setFormData({ ...formData, formation_id: Number(v) })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select training" />
                            </SelectTrigger>
                            <SelectContent>
                                {trainings.map((t) => (
                                    <SelectItem key={t.id} value={String(t.id)}>
                                        {t.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Footer */}
                    <div className="col-span-1 mt-6 md:col-span-2">
                        <div className="flex flex-col items-center justify-between gap-4 border-t pt-4 md:flex-row">
                            {/* Left side - Resend Link */}
                            {editedUser?.activation_token != null ? (
                                <Button
                                    onClick={() => resendLink(editedUser.id)}
                                    type="button"
                                    className="flex w-fit cursor-pointer items-center gap-2 rounded-lg bg-[#e5e5e5] px-2 py-1 text-[#0a0a0a] hover:bg-[#e5e5e5] hover:text-[#0a0a0a] dark:bg-[#262626] dark:text-white"
                                >
                                    Resend Link
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => resetPassword(editedUser.id)}
                                    type="button"
                                    className="flex w-fit cursor-pointer items-center gap-2 rounded-lg bg-[#e5e5e5] px-2 py-1 text-[#0a0a0a] hover:bg-[#e5e5e5] hover:text-[#0a0a0a] dark:bg-[#262626] dark:text-white"
                                >
                                    Reset Password
                                </Button>
                            )}

                            {/* Right side - Action buttons */}
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    className="flex w-fit cursor-pointer items-center gap-2 rounded-lg bg-[#e5e5e5] px-2 py-1 text-[#0a0a0a] hover:bg-[#e5e5e5] hover:text-[#0a0a0a] dark:bg-[#262626] dark:text-white"
                                    onClick={onClose}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">Save changes</Button>
                            </div>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditUserModal;
