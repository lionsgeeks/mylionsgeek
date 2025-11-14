import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ImagePlus } from 'lucide-react';
import { useInitials } from '@/hooks/use-initials';
import { router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import RolesMultiSelect from './RolesMultiSelect';

const EditUserModal = ({ open, editedUser, onClose, roles = [], status = [], trainings = [] }) => {
    const getInitials = useInitials();
    const { auth } = usePage().props
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: editedUser.name,
        email: editedUser.status,
        roles: editedUser.role,
        status: editedUser.status,
        formation_id: editedUser.formation_id,
        phone: editedUser.phone,
        cin: editedUser.cin,
        image: editedUser.image,
        access_studio: editedUser.access_studio, // Add default value for access_studio
        access_cowork: editedUser.access_cowork, // Add default value for access_cowork
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
                    else rolesArray = editedUser.role.split(',').map((r) => r.trim()).filter(Boolean);
                } catch {
                    rolesArray = editedUser.role.split(',').map((r) => r.trim()).filter(Boolean);
                }
            }
            rolesArray = rolesArray.map(r => String(r).toLowerCase());
            setFormData({
                name: editedUser.name,
                email: editedUser.email,
                roles: rolesArray,
                status: editedUser.status,
                formation_id: editedUser.formation_id,
                phone: editedUser.phone,
                cin: editedUser.cin,
                image: editedUser?.image || null, // User's image from DB (if exists)
                access_studio: editedUser.access_studio === 1 ? 'Yes' : 'No', // Convert 1/0 to Yes/No
                access_cowork: editedUser.access_cowork === 1 ? 'Yes' : 'No', // Convert 1/0 to Yes/No
            });
            console.log(formData);
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
        if (formData?.image instanceof File) {
            form.append('image', formData?.image);
        }

        // Sending data to backend
        router.post(`/users/update/${editedUser.id}`, form, {
            onSuccess: () => {
                setErrors({});
                onClose();
                console.log('success');

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
                //alert('Password reset successfully');
            },
            onError: () => {
                //alert('Error resetting password');
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[720px] max-h-[80vh] overflow-y-auto bg-light text-dark dark:bg-dark dark:text-light">
                <DialogHeader>
                    <DialogTitle>Modify user</DialogTitle>
                </DialogHeader>
                <form onSubmit={submitEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {/* Avatar */}
                    <div className="col-span-1 md:col-span-2 flex justify-center items-center gap-4 mb-4">
                        <div className="relative w-24 h-24">
                            <Avatar
                                image={
                                    formData?.image instanceof File
                                        ? URL.createObjectURL(formData?.image) // Use Object URL for file input
                                        : formData?.image || editedUser?.image // Use the provided image URL or the fallback editedUser image
                                }
                                name={formData?.name}
                                lastActivity={editedUser?.last_online || null}
                                className="w-24 h-24 rounded-full overflow-hidden"
                                onlineCircleClass="hidden"
                            />


                            <label className="absolute bottom-0 right-0 flex items-center justify-center w-8 h-8 bg-alpha rounded-full cursor-pointer border-2 border-white hover:bg-alpha/80">
                                <ImagePlus size={18} className="text-white" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
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
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="col-span-1">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="col-span-1">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    { }

                    {/* Roles - multi-select dropdown with chips */}
                    <div className="col-span-1">
                        <Label>Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(v) => setFormData({ ...formData, status: v })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {status?.map((s, idx) => (
                                    <SelectItem key={idx} value={s}>
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {auth.user?.roles?.includes('admin') &&
                        <>
                            <div className="col-span-1">
                                <Label htmlFor="roles">Roles</Label>
                                <RolesMultiSelect roles={formData.roles} onChange={(newRoles) => setFormData({ ...formData, roles: newRoles })} />
                            </div>
                            {/* Access Studio Field */}
                            <div className='flex flex-col gap-2'>
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
                            <div className='flex flex-col gap-2'>
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
                        </>
                    }



                    {/* Footer */}
                    <div className="col-span-1 md:col-span-2 mt-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t pt-4">
                            {/* Left side - Resend Link */}
                            {editedUser?.activation_token != null ?
                                <Button
                                    onClick={() => resendLink(editedUser.id)}
                                    type="button"
                                    className="bg-[#e5e5e5] dark:bg-[#262626] text-[#0a0a0a] dark:text-white cursor-pointer py-1 px-2 w-fit flex gap-2 items-center rounded-lg hover:bg-[#e5e5e5] hover:text-[#0a0a0a]"
                                >
                                    Resend Link
                                </Button>
                                :
                                <Button
                                    onClick={() => resetPassword(editedUser.id)}
                                    type="button"
                                    className="bg-[#e5e5e5] dark:bg-[#262626] text-[#0a0a0a] dark:text-white cursor-pointer py-1 px-2 w-fit flex gap-2 items-center rounded-lg hover:bg-[#e5e5e5] hover:text-[#0a0a0a]"
                                >
                                    Reset Password
                                </Button>
                            }

                            {/* Right side - Action buttons */}
                            <div className="flex gap-2">
                                <Button type="button" className="bg-[#e5e5e5] dark:bg-[#262626] text-[#0a0a0a] dark:text-white cursor-pointer py-1 px-2 w-fit flex gap-2 items-center rounded-lg hover:bg-[#e5e5e5] hover:text-[#0a0a0a]" onClick={onClose}>
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
