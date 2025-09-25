import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ComputerDetail() {
    const [form, setForm] = useState({ mark: '', reference: '', serialNumber: '', cpuGpu: '', isBroken: false });

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }

    function save() {
        // Placeholder save
        window.history.back();
    }

    return (
        <AppLayout>
            <Head title="Edit Computer" />
            <div className="p-6 md:p-10 max-w-2xl">
                <h1 className="text-xl font-semibold mb-4">Edit Computer</h1>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1">Mark</label>
                        <Input name="mark" value={form.mark} onChange={handleChange} placeholder="Dell, HP, Apple..." />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Reference</label>
                        <Input name="reference" value={form.reference} onChange={handleChange} placeholder="Model reference" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Serial number</label>
                        <Input name="serialNumber" value={form.serialNumber} onChange={handleChange} placeholder="SN-123" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">CPU/GPU</label>
                        <Input name="cpuGpu" value={form.cpuGpu} onChange={handleChange} placeholder="i7 / RTX 4060, M3, ..." />
                    </div>
                    <div className="flex items-center gap-2">
                        <input id="isBroken" name="isBroken" type="checkbox" checked={form.isBroken} onChange={handleChange} />
                        <label htmlFor="isBroken" className="text-sm">Broken</label>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button variant="outline" onClick={() => window.history.back()}>Cancel</Button>
                        <Button onClick={save}>Save</Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}


