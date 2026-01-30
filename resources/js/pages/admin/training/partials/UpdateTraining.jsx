import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router, useForm } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import { useState } from 'react';

export default function UpdateTraining({ training, coaches }) {
    const [open, setOpen] = useState(false);

    const { data, setData, put, processing, reset, errors } = useForm({
        name: training.name || '',
        category: training.category || '',
        start_time: training.start_time || '',
        user_id: training.user_id || '',
        promo: training.promo || '',
    });

    const handleOpenChange = (newOpen) => {
        if (!newOpen) {
            reset();
        }
        setOpen(newOpen);
    };

    function handleSubmit(e) {
        e.preventDefault();

        put(`/trainings/${training.id}`, {
            onSuccess: () => {
                setOpen(false);
                router.reload({ only: ['trainings'], preserveState: false });
            },
            onError: (errors) => {
                //('Form errors:', errors);
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="flex cursor-pointer items-center gap-2 rounded-lg border border-transparent bg-transparent px-3 text-yellow-600 hover:border-yellow-600 hover:bg-transparent active:scale-95">
                    <Pencil size={1} />
                </Button>
            </DialogTrigger>

            <DialogContent className="border border-alpha/20 bg-light text-dark sm:max-w-lg dark:bg-dark dark:text-light">
                <DialogHeader>
                    <DialogTitle>Edit Training</DialogTitle>
                    <DialogDescription>Update the fields below to edit training session.</DialogDescription>
                </DialogHeader>

                <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <Label htmlFor="title">Training Name</Label>
                        <Input id="title" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Enter training name" />
                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                        <Label>Category</Label>
                        <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="coding">Coding</SelectItem>
                                <SelectItem value="media">Media</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
                    </div>

                    <div>
                        <Label htmlFor="startDay">Starting Day</Label>
                        <Input id="startDay" type="date" value={data.start_time} onChange={(e) => setData('start_time', e.target.value)} />
                        {errors.start_time && <p className="text-sm text-red-600">{errors.start_time}</p>}
                    </div>

                    <div>
                        <Label>Coach</Label>
                        <Select value={data.user_id?.toString()} onValueChange={(value) => setData('user_id', Number(value))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select coach" />
                            </SelectTrigger>
                            <SelectContent>
                                {coaches?.map((coach) => (
                                    <SelectItem key={coach.id} value={coach.id.toString()}>
                                        {coach.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.user_id && <p className="text-sm text-red-600">{errors.user_id}</p>}
                    </div>

                    <div>
                        <Label htmlFor="promo">Promo</Label>
                        <Input
                            id="promo"
                            value={data.promo}
                            onChange={(e) => setData('promo', e.target.value)}
                            placeholder="Enter promo name/number"
                        />
                        {errors.promo && <p className="text-sm text-red-600">{errors.promo}</p>}
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            className="cursor-pointer border border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black hover:bg-transparent hover:text-[var(--color-alpha)]"
                            disabled={processing}
                        >
                            {processing ? 'Updating...' : 'Update'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
