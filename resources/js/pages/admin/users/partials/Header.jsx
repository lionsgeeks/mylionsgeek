import React, { useEffect, useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { Checkbox } from '@/components/ui/checkbox';
import { Clipboard, Copy, Plus, X } from 'lucide-react';

const Header = ({ message, roles, trainings, filteredUsers }) => {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        access_studio: null,
        access_cowork: null,
        formation_id: null,
        roles: [],
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rolesDropdownOpen, setRolesDropdownOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [exportFields, setExportFields] = useState({
        name: true,
        email: true,
        cin: true,
        phone: false,
        formation: true,
        access_studio: false,
        access_cowork: false,
        role: false,
        status: false,
    });

    const exportQuery = useMemo(() => {
        const selected = Object.entries(exportFields)
            .filter(([, v]) => v)
            .map(([k]) => k)
            .join(',');
        return selected.length ? selected : 'name,email,cin';
    }, [exportFields]);

    const triggerExport = () => {
        const url = `/admin/users/export?fields=${encodeURIComponent(exportQuery)}`;
        window.open(url, '_blank');
    };

    const handleChange = (field) => (e) => {
        setData((prevData) => ({
            ...prevData,
            [field]: e.target.value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/users/store', {
            onSuccess: () => {
                setIsModalOpen(false);
            },
            onError: (errors) => {
                console.log(errors);
            }
        });
    };

    const handleCopyEmails = () => {
        if (!emailsToCopy) return;
        navigator.clipboard.writeText(emailsToCopy).then(() => {
            setCopy(false);
            setTimeout(() => setCopy(true), 1500);
        });
    };

    const [copy, setCopy] = useState(true);

    const emailsToCopy = useMemo(() => {
        return filteredUsers?.map(u => u?.email)
            .filter(Boolean)
            .join(", ");
    }, [filteredUsers]);

    const availableRoles = [
        'Admin',
        'Studio Manager',
        'Student',
        'Coworker',
        'Coach',
        'Pro',
        'Moderator',
        'Recruiter',
    ];

    const toggleRole = (role) => {
        if (data.roles.includes(role)) {
            setData('roles', data.roles.filter(r => r !== role));
        } else {
            setData('roles', [...data.roles, role]);
        }
    };

    const removeRole = (role) => {
        setData('roles', data.roles.filter(r => r !== role));
    };

    return (
        <>
            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-2">
                    <h1 className="text-5xl">All Members</h1>
                    <p className="text-beta dark:text-light text-sm">{filteredUsers?.length} membres disponibles</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleCopyEmails}
                        className="bg-[#262626] cursor-pointer py-1 px-2 w-fit flex gap-2 items-center text-light rounded-lg"
                        disabled={!emailsToCopy}
                    >
                        {copy ? <Copy className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                        {copy ? 'Copy Emails' : 'Copied!'}
                    </Button>

                    <Dialog open={exportOpen} onOpenChange={setExportOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-alpha text-black cursor-pointer rounded-lg px-7 py-4">
                                Export Students
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[700px] max-w-[90vw]">
                            <DialogHeader>
                                <DialogTitle>Export Students</DialogTitle>
                                <DialogDescription>
                                    Choose which columns to include. Click Export All to download every student.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-2">
                                {Object.keys(exportFields).map((key) => (
                                    <label key={key} className="flex items-center gap-3">
                                        <Checkbox
                                            checked={!!exportFields[key]}
                                            onCheckedChange={(checked) => setExportFields((prev) => ({ ...prev, [key]: Boolean(checked) }))}
                                        />
                                        <span className="capitalize">{key.replace('_', ' ')}</span>
                                    </label>
                                ))}
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button className="bg-alpha dark:hover:bg-alpha dark:hover:text-black hover:text-white text-black dark:text-black">Cancel</Button>
                                </DialogClose>
                                <Button onClick={triggerExport} className="bg-alpha dark:hover:bg-alpha dark:hover:text-black hover:text-white text-black dark:text-black">Export</Button>
                                <Button onClick={() => { window.open('/admin/users/export', '_blank'); }} className="bg-alpha dark:hover:bg-alpha hover:text-white dark:hover:text-black text-black dark:text-black">Export All</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-alpha flex gap-2 items-center text-black cursor-pointer rounded-lg px-7 py-4">
                                <Plus />
                                Add User
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[80%] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add User</DialogTitle>
                                <DialogDescription>
                                    Fill in the information to create a new user profile.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                                    {/* Name Field */}
                                    <div className='flex flex-col gap-2'>
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={data.name}
                                            onChange={handleChange('name')}
                                            placeholder="Enter full name"
                                        />
                                        {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
                                    </div>

                                    {/* Email Field */}
                                    <div className='flex flex-col gap-2'>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={data.email}
                                            onChange={handleChange('email')}
                                            placeholder="Enter email address"
                                        />
                                        {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}
                                        {message && <span className="text-yellow-500 text-xs">{message}</span>}
                                    </div>

                                    {/* Formation Field */}
                                    <div className='flex flex-col gap-2'>
                                        <Label htmlFor="formation">Formation</Label>
                                        <Select
                                            id="formation"
                                            value={data.formation_id?.toString() || ''}
                                            onValueChange={(selectedId) => setData('formation_id', Number(selectedId))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Formation" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {trainings?.map((t, index) => (
                                                    <SelectItem key={index} value={t.id.toString()}>
                                                        {t.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.formation_id && <span className="text-red-500 text-xs">{errors.formation_id}</span>}
                                    </div>

                                    {/* Roles Field - Multi-select Dropdown */}
                                    <div className='flex flex-col gap-2'>
                                        <Label htmlFor="roles">Roles</Label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setRolesDropdownOpen(!rolesDropdownOpen)}
                                                className="w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            >
                                                <span className="text-muted-foreground">
                                                    {data.roles.length === 0 ? 'Select Roles' : `${data.roles.length} role(s) selected`}
                                                </span>
                                                <svg
                                                    className={`h-4 w-4 transition-transform ${rolesDropdownOpen ? 'rotate-180' : ''}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            {rolesDropdownOpen && (
                                                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
                                                    <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
                                                        {availableRoles.map((role) => (
                                                            <label
                                                                key={role}
                                                                className="flex items-center gap-2 px-2 py-2 hover:bg-accent rounded-sm cursor-pointer"
                                                            >
                                                                <Checkbox
                                                                    checked={data.roles.includes(role)}
                                                                    onCheckedChange={() => toggleRole(role)}
                                                                />
                                                                <span className="text-sm">{role}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Selected Roles Tags */}
                                        {data.roles.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {data.roles.map((role) => (
                                                    <span
                                                        key={role}
                                                        className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-md text-xs font-medium"
                                                    >
                                                        {role}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeRole(role)}
                                                            className="hover:bg-primary/20 rounded-full p-0.5"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {errors.roles && <span className="text-red-500 text-xs">{errors.roles}</span>}
                                    </div>

                                    {/* Access Studio Field */}
                                    <div className='flex flex-col gap-2'>
                                        <Label htmlFor="access-studio">Access Studio</Label>
                                        <Select
                                            id="access-studio"
                                            value={data.access_studio?.toString() || ''}
                                            onValueChange={(selectedId) => setData('access_studio', Number(selectedId))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue className="text-white dark:text-white" placeholder="Select Access Studio" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={'1'}>Yes</SelectItem>
                                                <SelectItem value={'0'}>No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.access_studio && <span className="text-red-500 text-xs">{errors.access_studio}</span>}
                                    </div>

                                    {/* Access Cowork Field */}
                                    <div className='flex flex-col gap-2'>
                                        <Label htmlFor="access-cowork">Access Cowork</Label>
                                        <Select
                                            id="access-cowork"
                                            value={data.access_cowork?.toString() || ''}
                                            onValueChange={(selectedId) => setData('access_cowork', Number(selectedId))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Access Cowork" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={'1'}>Yes</SelectItem>
                                                <SelectItem value={'0'}>No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.access_cowork && <span className="text-red-500 text-xs">{errors.access_cowork}</span>}
                                    </div>
                                </div>

                                <DialogFooter className="flex justify-end gap-4 mt-4">
                                    <DialogClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Processing...' : 'Save User'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </>
    );
};

export default Header;