import React, { useEffect, useState } from 'react';
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
import { useForm } from '@inertiajs/react'; // Import Inertia's useForm hook

const Header = ({ members, message, roles, trainings }) => {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        access_studio: null,
        access_cowork: null,
        formation_id: null,
        role: ''
    });

    const [isModalOpen, setIsModalOpen] = useState(false); // Modal open/close state

    // Handle form input change
    const handleChange = (field) => (e) => {
        setData((prevData) => ({
            ...prevData,
            [field]: e.target.value
        }));
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Submit the form to the server if no validation errors
        post('/admin/users/store', {
            onSuccess: () => {
                setIsModalOpen(false);  // Close modal on success
            },
            onError: (errors) => {
                console.log(errors);  // You can remove this for production
            }
        });
    };

    return (
        <>
            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-2">
                    <h1 className="text-5xl">All Members</h1>
                    <p className="text-beta dark:text-light text-sm">{members} membres disponibles</p>
                </div>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-beta cursor-pointer dark:bg-alpha text-white dark:text-black rounded-lg px-7 py-4">
                            Add User
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[80%]">
                        <DialogHeader>
                            <DialogTitle>Add User</DialogTitle>
                            <DialogDescription>
                                Fill in the information to create a new user profile.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 h-[40vh] grid-cols-1 lg:grid-cols-2">
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
                                    {/* Display error message */}
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
                                    {/* Display error message */}
                                    {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}

                                    {/* Display custom message under the email input if not undefined */}
                                    {message && <span className="text-yellow-500 text-xs">{message}</span>}
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
                                    {/* Display error message */}
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
                                    {/* Display error message */}
                                    {errors.access_cowork && <span className="text-red-500 text-xs">{errors.access_cowork}</span>}
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
                                    {/* Display error message */}
                                    {errors.formation_id && <span className="text-red-500 text-xs">{errors.formation_id}</span>}
                                </div>

                                {/* Role Field */}
                                <div className='flex flex-col gap-2'>
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        id="role"
                                        value={data.role}
                                        onValueChange={(value) => setData('role', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles?.map((r, index) => (
                                                <SelectItem key={index} value={r}>
                                                    {r}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {/* Display error message */}
                                    {errors.role && <span className="text-red-500 text-xs">{errors.role}</span>}
                                </div>
                            </div>

                            <DialogFooter>
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
        </>
    );
};

export default Header;
