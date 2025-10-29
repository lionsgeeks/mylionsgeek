import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { ChevronDown, Clipboard, Copy, Plus, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

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
            [field]: e.target.value,
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
                });
            },
            onError: (errors) => {
                console.log(errors);
            },
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
        return filteredUsers
            ?.map((u) => u?.email)
            .filter(Boolean)
            .join(', ');
    }, [filteredUsers]);

    const availableRoles = ['admin', 'studio manager', 'student', 'coworker', 'coach', 'pro', 'moderator', 'recruiter'];

    const currentRoles = data.roles;
    const filteredRoles = availableRoles.filter((role) => !currentRoles.includes(role));

    const addRole = (role) => {
        if (!currentRoles.includes(role)) {
            setData('roles', [...currentRoles, role]);
        }
    };

    const removeRole = (role) => {
        setData(
            'roles',
            currentRoles.filter((r) => r !== role),
        );
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

    return (
        <>
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-5xl">All Members</h1>
                    <p className="text-sm text-beta dark:text-light">{filteredUsers?.length} membres disponibles</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleCopyEmails}
                        className="flex w-fit cursor-pointer items-center gap-2 rounded-lg bg-[#e5e5e5] px-2 py-1 text-[#0a0a0a] hover:bg-[#e5e5e5] hover:text-[#0a0a0a] dark:bg-[#262626] dark:text-white"
                        disabled={!emailsToCopy}
                    >
                        {copy ? <Copy className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                        {copy ? 'Copy Emails' : 'Copied!'}
                    </Button>

                    <Dialog open={exportOpen} onOpenChange={setExportOpen}>
                        <DialogTrigger asChild>
                            <Button className="cursor-pointer rounded-lg bg-alpha px-7 py-4 text-black hover:bg-alpha hover:text-beta">
                                Export Students
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[700px] max-w-[90vw]">
                            <DialogHeader>
                                <DialogTitle>Export Students</DialogTitle>
                                <DialogDescription>Choose which columns to include. Click Export All to download every student.</DialogDescription>
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
                                            <label htmlFor={key} className="cursor-pointer text-sm text-gray-800 capitalize dark:text-gray-200">
                                                {key.replace(/_/g, ' ')}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button className="bg-alpha text-black hover:text-white dark:text-black dark:hover:bg-alpha dark:hover:text-black">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button
                                    onClick={triggerExport}
                                    className="bg-alpha text-black hover:text-white dark:text-black dark:hover:bg-alpha dark:hover:text-black"
                                >
                                    Export
                                </Button>
                                <Button
                                    onClick={() => {
                                        window.open('/admin/users/export', '_blank');
                                    }}
                                    className="bg-alpha text-black hover:text-white dark:text-black dark:hover:bg-alpha dark:hover:text-black"
                                >
                                    Export All
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex cursor-pointer items-center gap-2 rounded-lg bg-alpha px-7 py-4 text-black hover:bg-alpha hover:text-beta">
                                <Plus />
                                Add User
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] w-[80%] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add User</DialogTitle>
                                <DialogDescription>Fill in the information to create a new user profile.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                    {/* Name Field */}
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={data.name}
                                            onChange={handleChange('name')}
                                            placeholder="Enter full name"
                                        />
                                        {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
                                    </div>

                                    {/* Email Field */}
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={data.email}
                                            onChange={handleChange('email')}
                                            placeholder="Enter email address"
                                        />
                                        {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
                                        {message && <span className="text-xs text-yellow-500">{message}</span>}
                                    </div>

                                    {/* Formation Field */}
                                    <div className="flex flex-col gap-2">
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
                                        {errors.formation_id && <span className="text-xs text-red-500">{errors.formation_id}</span>}
                                    </div>

                                    {/* Roles Field - Multi-Select with Same Style as Other Selects */}
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="roles">Roles</Label>
                                        <div ref={rolesInputRef} className="relative">
                                            {/* Trigger button styled like SelectTrigger */}
                                            <button
                                                type="button"
                                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <span className={currentRoles.length === 0 ? 'text-muted-foreground' : ''}>
                                                    {currentRoles.length === 0 ? 'Select Roles' : `${currentRoles.length} role(s) selected`}
                                                </span>
                                                <ChevronDown
                                                    className={`h-4 w-4 opacity-50 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                                                />
                                            </button>

                                            {/* Dropdown menu */}
                                            {dropdownOpen && (
                                                <div className="absolute z-50 mt-2 w-full rounded-md border border-input bg-popover text-popover-foreground shadow-md">
                                                    <div className="max-h-60 space-y-1 overflow-y-auto p-2">
                                                        {filteredRoles.length === 0 ? (
                                                            <div className="px-2 py-2 text-sm text-muted-foreground">All roles selected</div>
                                                        ) : (
                                                            filteredRoles.map((role) => (
                                                                <div
                                                                    key={role}
                                                                    className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 hover:bg-accent hover:text-accent-foreground"
                                                                    onClick={() => addRole(role)}
                                                                >
                                                                    {/* <Checkbox checked={false} className="pointer-events-none" /> */}
                                                                    <span className="text-sm">{role}</span>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Selected Roles Tags */}
                                        {currentRoles.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {currentRoles.map((role) => (
                                                    <span
                                                        key={role}
                                                        className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                                                    >
                                                        {role}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeRole(role)}
                                                            className="rounded-full p-0.5 hover:bg-primary/20"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {errors.roles && <span className="text-xs text-red-500">{errors.roles}</span>}
                                    </div>

                                    {/* Access Studio Field */}
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="access-studio">Access Studio</Label>
                                        <Select
                                            id="access-studio"
                                            value={data.access_studio?.toString() || ''}
                                            onValueChange={(selectedId) => setData('access_studio', Number(selectedId))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Access Studio" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={'1'}>Yes</SelectItem>
                                                <SelectItem value={'0'}>No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.access_studio && <span className="text-xs text-red-500">{errors.access_studio}</span>}
                                    </div>

                                    {/* Access Cowork Field */}
                                    <div className="flex flex-col gap-2">
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
                                        {errors.access_cowork && <span className="text-xs text-red-500">{errors.access_cowork}</span>}
                                    </div>
                                </div>

                                <DialogFooter className="mt-4 flex justify-end gap-4">
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
