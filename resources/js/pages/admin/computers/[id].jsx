import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function ComputerDetail({ computer }) {
    const [form, setForm] = useState({
        reference: computer?.reference || '',
        cpu: computer?.cpu || '',
        gpu: computer?.gpu || '',
        state: computer?.state || 'working',
        user_id: computer?.user_id || null,
        start: computer?.start || '',
        end: computer?.end || '',
        mark: computer?.mark || '',
    });

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }

    function save() {
        router.put(`/admin/computers/${computer.id}`, form, {
            onSuccess: () => {
                window.history.back();
            },
        });
    }

    return (
        <AppLayout>
            <Head title="Edit Computer" />
            <div className="max-w-2xl p-6 md:p-10">
                <h1 className="mb-4 text-xl font-semibold">Edit Computer</h1>
                <div className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm">Reference</label>
                        <Input name="reference" value={form.reference} onChange={handleChange} placeholder="Model reference" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm">Serial Number</label>
                        <Input name="cpu" value={form.cpu} onChange={handleChange} placeholder="Serial number" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm">CPU/GPU</label>
                        <Select value={form.gpu} onValueChange={(value) => setForm((prev) => ({ ...prev, gpu: value }))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select CPU-GPU" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="I5-GTX">I5-GTX</SelectItem>
                                <SelectItem value="I7-RTX">I7-RTX</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm">Computer State</label>
                        <Select value={form.state} onValueChange={(value) => setForm((prev) => ({ ...prev, state: value }))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="working">Working</SelectItem>
                                <SelectItem value="not_working">Not Working</SelectItem>
                                <SelectItem value="damaged">Damaged</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm">Mark</label>
                        <Input name="mark" value={form.mark} onChange={handleChange} placeholder="Mark" />
                    </div>

                    {/* <div>
                        <label className="block text-sm mb-1">End Date</label>
                        <Input type="date" name="end" value={form.end} onChange={handleChange} />
                    </div> */}
                    {/* <div className="flex gap-2 pt-2">
                        <Button variant="outline" onClick={() => window.history.back()}>Cancel</Button>
                        <Button onClick={save}>Save</Button>
                    </div> */}
                </div>
            </div>
        </AppLayout>
    );
}
