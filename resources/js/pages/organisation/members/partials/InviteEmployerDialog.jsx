import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';

const inputClass = 'bg-white dark:bg-[#262626] text-black dark:text-white focus:ring-2 focus:ring-alpha';

export default function InviteEmployerDialog({ open, setOpen }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        email: '',
        name: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/organisation/members', {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                reset();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-h-[90vh] w-[90%] max-w-lg overflow-y-auto sm:w-full">
                <DialogHeader>
                    <DialogTitle>Invite employer</DialogTitle>
                    <DialogDescription>
                        Add a team member who can manage job postings for your organisation. They will receive login credentials by email.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="employer-email">Email</Label>
                        <Input
                            id="employer-email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className={inputClass}
                            required
                        />
                        {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
                    </div>

                    <div>
                        <Label htmlFor="employer-name">Name (optional)</Label>
                        <Input
                            id="employer-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className={inputClass}
                        />
                        {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="border border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black hover:bg-transparent hover:text-[var(--color-alpha)]"
                        >
                            {processing ? 'Sending…' : 'Send invitation'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
