import React, { useEffect, useMemo, useState } from 'react';
import { Input } from "@/components/ui/input"
import {RotateCw, Search } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from '@headlessui/react';



const FilterPart = ({ filters, setFilters, allPromo, trainings, roles, filteredUsers = [], status }) => {





    

    

    //! handel change selects and saerch
    const handleChange = (field, e) => {
        setFilters(prev => ({ ...prev, [field]: e }));
    };

    return (
        <>
            <div className='grid lg:grid-cols-6 grid-cols-1 gap-4'>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                    <Input
                        type="text"
                        placeholder="Search"
                        className="pl-10"
                        value={filters.search}
                        onChange={e => handleChange("search", e.target.value)}
                    />
                </div>
                {/* select by training */}
                <Select
                    value={filters.training === null ? undefined : String(filters.training)}
                    onValueChange={e => handleChange('training', Number(e))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select By Training" />
                    </SelectTrigger>
                    <SelectContent>
                        {trainings.map(training => (
                            <SelectItem key={training.id} value={training.id.toString()}>
                                {training.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {/* select by Promo */}
                <Select
                    value={filters.promo || undefined}
                    onValueChange={e => handleChange('promo', e)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select By Promo" />
                    </SelectTrigger>
                    <SelectContent>
                        {allPromo.map((p, index) => (
                            <SelectItem key={index} value={p}>
                                {p}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {/* select by select by role */}
                <Select
                    value={filters.role || undefined}
                    onValueChange={e => handleChange('role', e)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select By Role" />
                    </SelectTrigger>
                    <SelectContent>
                        {roles.map((role, index) =>
                            <SelectItem key={index} value={role}>{role}</SelectItem>
                        )}
                    </SelectContent>
                </Select>
                {/* select by select by date newest to older or reverse */}
                <Select
                    value={filters.status || undefined}
                    onValueChange={e => handleChange('status', e)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select By Status" />
                    </SelectTrigger>
                    <SelectContent>
                        {status.map((s, index) =>
                            <SelectItem key={index} value={s}>{s}</SelectItem>
                        )}
                    </SelectContent>
                </Select>
                <Button className='dark:bg-light cursor-pointer dark:hover:bg-light/80 py-1 px-2 w-fit flex gap-2 items-center dark:text-black bg-dark text-light rounded-lg'
                    onClick={() =>
                        setFilters({
                            search: "",
                            training: null,
                            role: "",
                            status: '',
                            date: ""
                        })
                    }
                >
                    <RotateCw size={15} /> Reset
                </Button>
            </div>
        </>
    );
};

export default FilterPart;