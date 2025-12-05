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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { Checkbox } from '@/components/ui/checkbox';
import { Clipboard, Copy, Plus, X, ChevronDown, Users, PlayCircle, Laptop, Code, Camera, Mail, Send, Search, Users2, CheckCircle2 } from 'lucide-react';
import StatsCard from '../../../../components/StatCard';

const formatRoleLabel = (role) => role === 'studio_responsable' ? 'Responsable Studio' : role;

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
    const [emailOpen, setEmailOpen] = useState(false);
    const [selectedTrainingIds, setSelectedTrainingIds] = useState([]);
    const [selectAllTrainings, setSelectAllTrainings] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [emailBodyFr, setEmailBodyFr] = useState('');
    const [emailBodyAr, setEmailBodyAr] = useState('');
    const [emailBodyEn, setEmailBodyEn] = useState('');
    const [emailProcessing, setEmailProcessing] = useState(false);
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
    const [emailFeilds, setEmailsFeilds] = useState({
        name: true,
        email: true,
        cin: true,
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
                    cin: '',
                })
            }
        });
    };
    // Filter users based on search query (for all users)
    const searchedUsers = useMemo(() => {
        if (!userSearchQuery.trim()) {
            return filteredUsers;
        }
        const query = userSearchQuery.toLowerCase();
        return filteredUsers.filter(user => 
            (user.name || '').toLowerCase().includes(query) ||
            (user.email || '').toLowerCase().includes(query)
        );
    }, [userSearchQuery, filteredUsers]);

    // Filter users based on selected trainings
    const selectedTrainingUsers = useMemo(() => {
        let users = [];
        if (selectAllTrainings) {
            users = filteredUsers;
        } else if (selectedTrainingIds.length > 0) {
            users = filteredUsers.filter(user => selectedTrainingIds.includes(user.formation_id));
        }
        
        // Add selected users without training
        if (selectedUserIds.length > 0) {
            const usersWithoutTraining = filteredUsers.filter(user => 
                selectedUserIds.includes(user.id)
            );
            users = [...users, ...usersWithoutTraining];
        }
        
        // Remove duplicates
        const uniqueUsers = users.filter((user, index, self) => 
            index === self.findIndex(u => u.id === user.id)
        );
        
        return uniqueUsers;
    }, [selectedTrainingIds, selectAllTrainings, selectedUserIds, filteredUsers]);

    // Handle training selection
    const handleTrainingToggle = (trainingId) => {
        if (trainingId === 'all') {
            setSelectAllTrainings(!selectAllTrainings);
            setSelectedTrainingIds([]);
        } else {
            const id = Number(trainingId);
            if (selectedTrainingIds.includes(id)) {
                setSelectedTrainingIds(selectedTrainingIds.filter(tid => tid !== id));
            } else {
                setSelectedTrainingIds([...selectedTrainingIds, id]);
            }
            setSelectAllTrainings(false);
        }
    };

    const handleSendEmail = async (e) => {
        e.preventDefault();
        // Check if at least one language content is provided
        if (!emailSubject.trim() || (!emailBody.trim() && !emailBodyFr.trim() && !emailBodyAr.trim() && !emailBodyEn.trim())) {
            alert('Please provide at least one language content.');
            return;
        }

        setEmailProcessing(true);
        try {
            const response = await fetch('/admin/users/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    training_ids: selectAllTrainings ? null : selectedTrainingIds,
                    user_ids: selectedUserIds.length > 0 ? selectedUserIds : null,
                    subject: emailSubject,
                    body: emailBody.trim() || null,
                    body_fr: emailBodyFr.trim() || null,
                    body_ar: emailBodyAr.trim() || null,
                    body_en: emailBodyEn.trim() || null,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                if (result.queued) {
                    alert(result.message || `Newsletter emails are being sent to ${result.total_users} user(s) in the background.`);
                } else {
                    alert(result.message || `Email sent successfully to ${result.sent_count || result.total_users} user(s)!`);
                }
                setEmailOpen(false);
                setSelectedTrainingIds([]);
                setSelectAllTrainings(false);
                setSelectedUserIds([]);
                setUserSearchQuery('');
                setEmailSubject('');
                setEmailBody('');
                setEmailBodyFr('');
                setEmailBodyAr('');
                setEmailBodyEn('');
            } else {
                const error = await response.json();
                console.error('Error sending email:', error);
                alert(error.error || 'Failed to send email. Please try again.');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Failed to send email. Please try again.');
        } finally {
            setEmailProcessing(false);
        }
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
        'student',
        'coworker',
        'coach',
        'pro',
        'moderateur',
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
                                                        {formatRoleLabel(role)}
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
                                                                    <span className="text-sm">{formatRoleLabel(role)}</span>
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
                    <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-alpha hover:bg-alpha hover:text-beta flex gap-2 items-center text-black cursor-pointer rounded-lg px-7 py-4">
                                <Mail />
                                Send Email
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="w-[90%] max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Send Newsletter Email</DialogTitle>
                                <DialogDescription>
                                    Select recipients and compose your message
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSendEmail} className="mt-6 space-y-6">
                                {/* Training Selection */}
                                <div className="flex flex-col gap-3">
                                    <Label>Select Training(s)</Label>

                                    {/* Search Input */}
                                    <Input
                                        placeholder="Search trainings or users by name or email..."
                                        value={userSearchQuery}
                                        onChange={(e) => setUserSearchQuery(e.target.value)}
                                        className={inputClass}
                                    />

                                    {/* Select All Option */}
                                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-alpha/20 hover:bg-alpha/5 transition-colors">
                                        <Checkbox
                                            id="select-all-trainings"
                                            checked={selectAllTrainings}
                                            onCheckedChange={() => handleTrainingToggle('all')}
                                        />
                                        <label
                                            htmlFor="select-all-trainings"
                                            className="text-sm font-medium cursor-pointer flex-1"
                                        >
                                            All Users ({filteredUsers.length} users)
                                        </label>
                                    </div>

                                    {/* Training List with Checkboxes */}
                                    <div className="max-h-60 overflow-y-auto space-y-2 border border-alpha/20 rounded-lg p-3">
                                        {/* Show trainings */}
                                        {trainings.filter(training => {
                                            if (!userSearchQuery.trim()) return true;
                                            const query = userSearchQuery.toLowerCase();
                                            return training.name.toLowerCase().includes(query) ||
                                                   (training.coach?.name || '').toLowerCase().includes(query);
                                        }).map(training => {
                                            const trainingUsersCount = filteredUsers.filter(u => u.formation_id === training.id).length;
                                            const isSelected = selectedTrainingIds.includes(training.id);
                                            return (
                                                <div
                                                    key={training.id}
                                                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-alpha/5 transition-colors"
                                                >
                                                    <Checkbox
                                                        id={`training-${training.id}`}
                                                        checked={isSelected}
                                                        onCheckedChange={() => handleTrainingToggle(training.id)}
                                                    />
                                                    <label
                                                        htmlFor={`training-${training.id}`}
                                                        className="text-sm cursor-pointer flex-1"
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{training.name} ({trainingUsersCount} users)</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                Coach: {training.coach?.name ?? '—'}
                                                            </span>
                                                        </div>
                                                    </label>
                                                </div>
                                            );
                                        })}

                                        {/* Show users if search query exists */}
                                        {userSearchQuery.trim() && searchedUsers.length > 0 && (
                                            <>
                                                {searchedUsers.map(user => {
                                                    const isSelected = selectedUserIds.includes(user.id);
                                                    return (
                                                        <div
                                                            key={`user-${user.id}`}
                                                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-alpha/5 transition-colors"
                                                        >
                                                            <Checkbox
                                                                id={`user-${user.id}`}
                                                                checked={isSelected}
                                                                onCheckedChange={(checked) => {
                                                                    if (checked) {
                                                                        setSelectedUserIds([...selectedUserIds, user.id]);
                                                                    } else {
                                                                        setSelectedUserIds(selectedUserIds.filter(id => id !== user.id));
                                                                    }
                                                                }}
                                                            />
                                                            <label
                                                                htmlFor={`user-${user.id}`}
                                                                className="text-sm cursor-pointer flex-1"
                                                            >
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">{user.name || 'No name'}</span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {user.email || 'No email'}
                                                                    </span>
                                                                </div>
                                                            </label>
                                                        </div>
                                                    );
                                                })}
                                            </>
                                        )}

                                        {/* No results message */}
                                        {userSearchQuery.trim() && 
                                         trainings.filter(training => {
                                             const query = userSearchQuery.toLowerCase();
                                             return training.name.toLowerCase().includes(query) ||
                                                    (training.coach?.name || '').toLowerCase().includes(query);
                                         }).length === 0 && 
                                         searchedUsers.length === 0 && (
                                            <p className="text-sm text-muted-foreground text-center py-4">
                                                No trainings or users found matching your search.
                                            </p>
                                        )}
                                    </div>

                                    {selectedUserIds.length > 0 && (
                                        <div className="pt-2 border-t border-alpha/20">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedUserIds([])}
                                                className="text-xs w-full"
                                            >
                                                Clear User Selection ({selectedUserIds.length} selected)
                                            </Button>
                                        </div>
                                    )}

                                    {(selectAllTrainings || selectedTrainingIds.length > 0 || selectedUserIds.length > 0) && (
                                        <p className="text-sm text-muted-foreground">
                                            This email will be sent to <strong>{selectedTrainingUsers.length}</strong> user{selectedTrainingUsers.length !== 1 ? 's' : ''}
                                            {selectedTrainingIds.length > 0 && !selectAllTrainings && (
                                                <span> from {selectedTrainingIds.length} training{selectedTrainingIds.length !== 1 ? 's' : ''}</span>
                                            )}
                                            {selectedUserIds.length > 0 && (
                                                <span> and {selectedUserIds.length} individual user{selectedUserIds.length !== 1 ? 's' : ''}</span>
                                            )}
                                        </p>
                                    )}
                                </div>

                                {/* Email Subject */}
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="email-subject">Subject</Label>
                                    <Input
                                        id="email-subject"
                                        value={emailSubject}
                                        onChange={(e) => setEmailSubject(e.target.value)}
                                        placeholder="Enter email subject"
                                        className={inputClass}
                                        required
                                    />
                                </div>

                                {/* Email Body - Multi-language Support */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Message Content</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Fill at least one language. You can use HTML formatting.
                                        </p>
                                    </div>

                                    {/* French Content */}
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="email-body-fr" className="text-sm font-semibold">
                                            French (Français) 🇫🇷
                                        </Label>
                                        <Textarea
                                            id="email-body-fr"
                                            value={emailBodyFr}
                                            onChange={(e) => setEmailBodyFr(e.target.value)}
                                            placeholder="Compose your French message here..."
                                            className={inputClass}
                                            rows={8}
                                        />
                                    </div>

                                    {/* Arabic Content */}
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="email-body-ar" className="text-sm font-semibold">
                                            Arabic (العربية) 🇸🇦
                                        </Label>
                                        <Textarea
                                            id="email-body-ar"
                                            value={emailBodyAr}
                                            onChange={(e) => setEmailBodyAr(e.target.value)}
                                            placeholder="اكتب رسالتك بالعربية هنا..."
                                            className={inputClass}
                                            rows={8}
                                            dir="rtl"
                                        />
                                    </div>

                                    {/* English Content */}
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="email-body-en" className="text-sm font-semibold">
                                            English 🇬🇧
                                        </Label>
                                        <Textarea
                                            id="email-body-en"
                                            value={emailBodyEn}
                                            onChange={(e) => setEmailBodyEn(e.target.value)}
                                            placeholder="Compose your English message here..."
                                            className={inputClass}
                                            rows={8}
                                        />
                                    </div>

                                    {/* Legacy single body field (optional, for backward compatibility) */}
                                    <details className="text-xs">
                                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                            Legacy: Single Body Field (Optional)
                                        </summary>
                                        <div className="mt-2">
                                            <Textarea
                                                id="email-body"
                                                value={emailBody}
                                                onChange={(e) => setEmailBody(e.target.value)}
                                                placeholder="Legacy: Single body field (if not using language-specific fields above)..."
                                                className={inputClass}
                                                rows={6}
                                            />
                                        </div>
                                    </details>
                                </div>

                                {/* Recipients Preview */}
                                {(selectAllTrainings || selectedTrainingIds.length > 0 || selectedUserIds.length > 0) && selectedTrainingUsers.length > 0 && (
                                    <div className="flex flex-col gap-2 p-4 bg-muted rounded-lg">
                                        <Label className="text-sm font-semibold">Recipients ({selectedTrainingUsers.length}):</Label>
                                        <div className="max-h-32 overflow-y-auto text-sm text-muted-foreground">
                                            {selectedTrainingUsers.slice(0, 10).map(user => (
                                                <div key={user.id} className="flex items-center gap-2 py-1">
                                                    <span>{user.name}</span>
                                                    <span className="text-xs">({user.email})</span>
                                                </div>
                                            ))}
                                            {selectedTrainingUsers.length > 10 && (
                                                <p className="text-xs mt-2">...and {selectedTrainingUsers.length - 10} more</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <DialogFooter className="flex justify-end gap-4 mt-4">
                                    <DialogClose asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setSelectedTrainingIds([]);
                                                setSelectAllTrainings(false);
                                                setSelectedUserIds([]);
                                                setUserSearchQuery('');
                                                setEmailSubject('');
                                                setEmailBody('');
                                                setEmailBodyFr('');
                                                setEmailBodyAr('');
                                                setEmailBodyEn('');
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        type="submit"
                                        disabled={emailProcessing || (!selectAllTrainings && selectedTrainingIds.length === 0 && selectedUserIds.length === 0) || !emailSubject.trim() || (!emailBody.trim() && !emailBodyFr.trim() && !emailBodyAr.trim() && !emailBodyEn.trim())}
                                        className="bg-alpha hover:text-white text-black"
                                    >
                                        {emailProcessing ? 'Sending...' : `Send to ${selectedTrainingUsers.length} User${selectedTrainingUsers.length !== 1 ? 's' : ''}`}
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
