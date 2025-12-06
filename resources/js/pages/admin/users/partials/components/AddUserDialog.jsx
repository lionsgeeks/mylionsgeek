import React, { useState, useRef, useEffect } from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { X, ChevronDown } from 'lucide-react';
import { useForm } from "@inertiajs/react";

const availableRoles = [
    'admin', 'studio_responsable', 'student',
    'coworker', 'coach', 'pro', 'moderateur', 'recruiter'
];

const formatRoleLabel = (role) =>
    role === 'studio_responsable' ? 'Responsable Studio' : role;

export default function AddUserDialog({ open, setOpen, trainings }) {
    const { data, setData, post, processing } = useForm({
        name: '',
        email: '',
        access_studio: null,
        access_cowork: null,
        formation_id: null,
        roles: [],
    });

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const rolesInputRef = useRef(null);

    const currentRoles = data.roles;
    const filteredRoles = availableRoles.filter(r => !currentRoles.includes(r));

    const addRole = (role) => {
        setData("roles", [...currentRoles, role]);
    };

    const removeRole = (role) => {
        setData("roles", currentRoles.filter(r => r !== role));
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (rolesInputRef.current && !rolesInputRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);

    }, [dropdownOpen]);

    const inputClass =
        "bg-[#e5e5e5] dark:bg-[#262626] text-black dark:text-white focus:ring-2 focus:ring-alpha";

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/admin/users/store", {
            onSuccess: () => {
                setOpen(false);
                setData({ name: "", email: "", cin: "" });
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="w-[80%] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add User</DialogTitle>
                    <DialogDescription>
                        Fill in the information to create a new user.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name / Email */}
                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                        <div>
                            <Label>Name</Label>
                            <Input
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <Label>Email</Label>
                            <Input
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                                type="email"
                                className={inputClass}
                            />
                        </div>

                        {/* Formation */}
                        <div>
                            <Label>Formation</Label>
                            <Select
                                value={data.formation_id?.toString() || ""}
                                onValueChange={(v) => setData("formation_id", Number(v))}
                            >
                                <SelectTrigger className={inputClass}>
                                    <SelectValue placeholder="Select Formation" />
                                </SelectTrigger>
                                <SelectContent>
                                    {trainings.map((t) => (
                                        <SelectItem key={t.id} value={t.id.toString()}>
                                            {t.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Roles */}
                        <div>
                            <Label>Roles</Label>

                            {currentRoles.length > 0 && (
                                <div className="flex flex-wrap gap-2 my-2">
                                    {currentRoles.map((r) => (
                                        <span
                                            key={r}
                                            className="px-2 py-1 bg-primary/10 rounded-md flex items-center gap-1"
                                        >
                                            {formatRoleLabel(r)}
                                            <button type="button" onClick={() => removeRole(r)}>
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
                                    className={`${inputClass} flex items-center justify-between px-3 py-2 rounded-md`}
                                >
                                    {currentRoles.length === 0
                                        ? "Select Roles"
                                        : `${currentRoles.length} role(s) selected`}
                                    <ChevronDown className={`h-4 w-4 ${dropdownOpen ? "rotate-180" : ""}`} />
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute w-full bg-popover border rounded-md shadow z-50 mt-2">
                                        {filteredRoles.length === 0 ? (
                                            <p className="p-2 text-sm">All roles selected</p>
                                        ) : (
                                            filteredRoles.map((role) => (
                                                <p
                                                    key={role}
                                                    className="p-2 hover:bg-accent cursor-pointer"
                                                    onClick={() => addRole(role)}
                                                >
                                                    {formatRoleLabel(role)}
                                                </p>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Access Fields */}
                        <div>
                            <Label>Access Studio</Label>
                            <Select
                                value={data.access_studio?.toString() || ""}
                                onValueChange={(v) => setData("access_studio", Number(v))}
                            >
                                <SelectTrigger className={inputClass}>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Yes</SelectItem>
                                    <SelectItem value="0">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Access Cowork</Label>
                            <Select
                                value={data.access_cowork?.toString() || ""}
                                onValueChange={(v) => setData("access_cowork", Number(v))}
                            >
                                <SelectTrigger className={inputClass}>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Yes</SelectItem>
                                    <SelectItem value="0">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button className='bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)] cursor-pointer' type="submit" disabled={processing}>
                            {processing ? "Saving..." : "Save User"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
