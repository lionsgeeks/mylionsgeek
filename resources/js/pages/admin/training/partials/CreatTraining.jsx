import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router, useForm } from '@inertiajs/react';
import { Code, ImageIcon, PlusCircle } from 'lucide-react';
import { useState } from 'react';

export default function CreatTraining({ coaches }) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        category: '',
        start_time: '',
        user_id: '',
        promo: '',
    });

    const handleOpenChange = (newOpen) => {
        if (!newOpen) {
            reset();
        }
        setOpen(newOpen);
    };

    function handleSubmit(e) {
        e.preventDefault();

        post('/admin/training', {
            onSuccess: () => {
                reset();
                setOpen(false);
                router.reload({ only: ['trainings'], preserveState: false });
            },
            onError: (errors) => {
                console.log('Form errors:', errors);
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--color-alpha)] bg-[var(--color-alpha)] px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-transparent dark:hover:text-[var(--color-alpha)]">
                    <PlusCircle size={20} />
                    Add Training
                </Button>
            </DialogTrigger>

            <DialogContent className="border border-alpha/20 bg-light text-dark sm:max-w-lg dark:bg-dark dark:text-light">
                <DialogHeader>
                    <DialogTitle>Add New Training</DialogTitle>
                    <DialogDescription>Fill the form below to create a new training session.</DialogDescription>
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
                                <SelectItem value="coding">
                                    <div className="flex items-center gap-2">
                                        <Code size={16} /> Coding
                                    </div>
                                </SelectItem>
                                <SelectItem value="media">
                                    <div className="flex items-center gap-2">
                                        <ImageIcon size={16} /> Media
                                    </div>
                                </SelectItem>
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
                        <Button type="submit" className="cursor-pointer bg-yellow-600 hover:bg-yellow-700" disabled={processing}>
                            {processing ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
