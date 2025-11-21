import React, { useEffect, useMemo, useState, useRef } from 'react';
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
import { Clipboard, Copy, Plus, X, ChevronDown, Users, PlayCircle, Laptop, Code, Camera } from 'lucide-react';
import { Users2 } from "lucide-react";
import StatsCard from '../../../../components/StatCard';

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
    const [dropdownOpen, setDropdownOpen] = useState(false);
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

    const rolesInputRef = useRef(null);

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
                setData({
                    name: '',
                    email: '',
                    access_studio: null,
                    access_cowork: null,
                    formation_id: null,
                    roles: [],
                })
            }
        });
    };

    const [copy, setCopy] = useState(true);
    const emailsToCopy = useMemo(() => {
        return filteredUsers?.map(u => u?.email)
            .filter(Boolean)
            .join(", ");
    }, [filteredUsers]);

    const handleCopyEmails = () => {
        if (!emailsToCopy) return;
        navigator.clipboard.writeText(emailsToCopy).then(() => {
            setCopy(false);
            setTimeout(() => setCopy(true), 1500);
        });
    };

    const availableRoles = [
        'admin',
        'studio_responsable',
        'studio manager',
        'student',
        'coworker',
        'coach',
        'pro',
        'moderator',
        'recruiter',
    ];

    const currentRoles = data.roles;
    const filteredRoles = availableRoles.filter(role => !currentRoles.includes(role));

    const addRole = (role) => {
        if (!currentRoles.includes(role)) {
            setData('roles', [...currentRoles, role]);
        }
    };

    const removeRole = (role) => {
        setData('roles', currentRoles.filter(r => r !== role));
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (rolesInputRef.current && !rolesInputRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);

    // Shared input classes for consistent styling
    const inputClass =
        "bg-[#e5e5e5] dark:bg-[#262626] text-[#0a0a0a] dark:text-white placeholder:text-[#0a0a0a]/50 dark:placeholder:text-white focus:ring-2 focus:ring-alpha";

    const mediaTraining = trainings.filter(t => t.name.toLowerCase().includes('création') || t.name.toLowerCase().includes('media') || t.name.toLowerCase().includes('creator'))
    const codingTraining = trainings.filter(t => t.name.toLowerCase().includes('coding') || t.name.toLowerCase().includes('developpement') || t.name.toLowerCase().includes('developement'))
    const mediaStidents = filteredUsers.filter(users => mediaTraining.map(t => t.id).includes(users.formation_id))
    const codingStudents = filteredUsers.filter(users => codingTraining.map(t => t.id).includes(users.formation_id))
    const staticCardData = [
        {
            title: 'Total Users',
            value: filteredUsers.length,
            icon: Users2,
        },
        {
            title: 'Total Media Students',
            value: mediaStidents.length,
            icon: Camera,
        },
        {
            title: 'Total Coding Students',
            value: codingStudents.length,
            icon: Code,
        },
    ]

    return (
        <>
            <StatsCard statsData={staticCardData} />
            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-2">
                    {/* <h1 className="text-5xl">All Members</h1>
                    <p className="text-beta dark:text-light text-sm">{filteredUsers?.length} membres disponibles</p> */}
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleCopyEmails}
                        className="bg-[#e5e5e5] dark:bg-[#262626] text-[#0a0a0a] dark:text-white cursor-pointer py-1 px-2 w-fit flex gap-2 items-center rounded-lg hover:bg-[#d9d9d9]"
                        disabled={!emailsToCopy}
                    >
                        {copy ? <Copy className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                        {copy ? 'Copy Emails' : 'Copied!'}
                    </Button>

                    <Dialog open={exportOpen} onOpenChange={setExportOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-alpha text-black hover:bg-alpha hover:text-beta cursor-pointer rounded-lg px-7 py-4">
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
                                {Object.keys(exportFields).map((key) => {
                                    const isChecked = Boolean(exportFields[key]);
                                    return (
                                        <div key={key} className="flex items-center space-x-3">
                                            <Checkbox
                                                id={key}
                                                checked={isChecked}
                                                onCheckedChange={(checked) =>
                                                    setExportFields((prev) => ({
                                                        ...prev,
                                                        [key]: !!checked,
                                                    }))
                                                }
                                            />
                                            <label
                                                htmlFor={key}
                                                className="text-sm text-gray-800 dark:text-gray-200 capitalize cursor-pointer"
                                            >
                                                {key.replace(/_/g, ' ')}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button className="bg-alpha dark:hover:bg-alpha hover:text-white text-black">Cancel</Button>
                                </DialogClose>
                                <Button onClick={triggerExport} className="bg-alpha hover:text-white text-black">Export</Button>
                                <Button onClick={() => { window.open('/admin/users/export', '_blank'); }} className="bg-alpha hover:text-white text-black">Export All</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-alpha hover:bg-alpha hover:text-beta flex gap-2 items-center text-black cursor-pointer rounded-lg px-7 py-4">
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
                                        <Input id="name" name="name" value={data.name} onChange={handleChange('name')} placeholder="Enter full name" className={inputClass} />
                                    </div>

                                    {/* Email Field */}
                                    <div className='flex flex-col gap-2'>
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" name="email" type="email" value={data.email} onChange={handleChange('email')} placeholder="Enter email address" className={inputClass} />
                                    </div>

                                    {/* Formation Field */}
                                    <div className='flex flex-col gap-2'>
                                        <Label htmlFor="formation">Formation</Label>
                                        <Select
                                            id="formation"
                                            value={data.formation_id?.toString() || ''}
                                            onValueChange={(selectedId) => setData('formation_id', Number(selectedId))}
                                        >
                                            <SelectTrigger className={inputClass}>
                                                <SelectValue placeholder="Select Formation" />
                                            </SelectTrigger>
                                            <SelectContent className={inputClass}>
                                                {trainings?.map((t) => (
                                                    <SelectItem key={t.id} value={t.id.toString()}>
                                                        {t.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Roles Field */}
                                    <div className='flex flex-col gap-2'>
                                        <Label htmlFor="roles">Roles</Label>
                                        {currentRoles.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {currentRoles.map((role) => (
                                                    <span key={role} className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-md text-xs font-medium">
                                                        {role}
                                                        <button type="button" onClick={() => removeRole(role)} className="hover:bg-primary/20 rounded-full p-0.5">
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div ref={rolesInputRef} className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                                className={`${inputClass} flex h-10 w-full items-center justify-between rounded-md border border-input px-3 py-2 text-sm`}
                                            >
                                                <span className={currentRoles.length === 0 ? "text-white" : ""}>
                                                    {currentRoles.length === 0 ? 'Select Roles' : `${currentRoles.length} role(s) selected`}
                                                </span>
                                                <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            {dropdownOpen && (
                                                <div className="absolute z-50 mt-2 w-full rounded-md border border-input bg-popover text-popover-foreground shadow-md">
                                                    <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
                                                        {filteredRoles.length === 0 ? (
                                                            <div className="px-2 py-2 text-sm text-muted-foreground">
                                                                All roles selected
                                                            </div>
                                                        ) : (
                                                            filteredRoles.map((role) => (
                                                                <div
                                                                    key={role}
                                                                    className="flex items-center gap-2 px-2 py-2 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
                                                                    onClick={() => addRole(role)}
                                                                >
                                                                    <span className="text-sm">{role}</span>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Access Studio */}
                                    <div className='flex flex-col gap-2'>
                                        <Label htmlFor="access-studio">Access Studio</Label>
                                        <Select
                                            id="access-studio"
                                            value={data.access_studio?.toString() || ''}
                                            onValueChange={(selectedId) => setData('access_studio', Number(selectedId))}
                                        >
                                            <SelectTrigger className={inputClass}>
                                                <SelectValue placeholder="Select Access Studio" />
                                            </SelectTrigger>
                                            <SelectContent className={inputClass}>
                                                <SelectItem value={'1'}>Yes</SelectItem>
                                                <SelectItem value={'0'}>No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Access Cowork */}
                                    <div className='flex flex-col gap-2'>
                                        <Label htmlFor="access-cowork">Access Cowork</Label>
                                        <Select
                                            id="access-cowork"
                                            value={data.access_cowork?.toString() || ''}
                                            onValueChange={(selectedId) => setData('access_cowork', Number(selectedId))}
                                        >
                                            <SelectTrigger className={inputClass}>
                                                <SelectValue placeholder="Select Access Cowork" />
                                            </SelectTrigger>
                                            <SelectContent className={inputClass}>
                                                <SelectItem value={'1'}>Yes</SelectItem>
                                                <SelectItem value={'0'}>No</SelectItem>
                                            </SelectContent>
                                        </Select>
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
