import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';

const availableRoles = ['admin', 'studio_responsable', 'student', 'coworker', 'coach', 'pro', 'moderateur', 'recruiter'];

const formatRoleLabel = (role) => (role === 'studio_responsable' ? 'Responsable Studio' : role);

const defaultForm = {
    name: '',
    email: '',
    access_studio: 1,
    access_cowork: 1,
    formation_id: null,
    roles: ['student'],
};

export default function AddUserDialog({ open, setOpen, trainings }) {
    const { data, setData, post, processing } = useForm(defaultForm);

    const inputClass = 'bg-[#e5e5e5] dark:bg-[#262626] text-black dark:text-white focus:ring-2 focus:ring-alpha';

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/users/store', {
            onSuccess: () => {
                setOpen(false);
                setData(defaultForm);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-h-[90vh] w-[80%] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add User</DialogTitle>
                    <DialogDescription>Fill in the information to create a new user.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div>
                            <Label>Name</Label>
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} className={inputClass} />
                        </div>

                        <div>
                            <Label>Email</Label>
                            <Input value={data.email} onChange={(e) => setData('email', e.target.value)} type="email" className={inputClass} />
                        </div>

                        <div>
                            <Label>Formation</Label>
                            <Select value={data.formation_id?.toString() || ''} onValueChange={(v) => setData('formation_id', Number(v))}>
                                <SelectTrigger className={inputClass}>
                                    <SelectValue placeholder="Select Formation" />
                                </SelectTrigger>
                                <SelectContent>
                                    {trainings.map((t) => (
                                        <SelectItem key={t.id} value={t.id.toString()}>
                                            {t.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Role</Label>
                            <Select value={data.roles[0] || 'student'} onValueChange={(v) => setData('roles', [v])}>
                                <SelectTrigger className={inputClass}>
                                    <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableRoles.map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {formatRoleLabel(role)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Access Studio</Label>
                            <Select value={data.access_studio?.toString() || ''} onValueChange={(v) => setData('access_studio', Number(v))}>
                                <SelectTrigger className={inputClass}>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Yes</SelectItem>
                                    <SelectItem value="0">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Access Cowork</Label>
                            <Select value={data.access_cowork?.toString() || ''} onValueChange={(v) => setData('access_cowork', Number(v))}>
                                <SelectTrigger className={inputClass}>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Yes</SelectItem>
                                    <SelectItem value="0">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            className="cursor-pointer border border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black hover:bg-transparent hover:text-[var(--color-alpha)]"
                            type="submit"
                            disabled={processing}
                        >
                            {processing ? 'Saving...' : 'Save User'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
