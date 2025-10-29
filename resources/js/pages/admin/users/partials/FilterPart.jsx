import React, { useEffect, useMemo, useState } from 'react';
import { Input } from "@/components/ui/input"
import { RotateCw, Search } from "lucide-react"
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
                {/* Search Input */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                    <Input
                        type="text"
                        placeholder="Search"
                        className="pl-10 bg-white dark:bg-[#262626] text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-white"
                        value={filters.search}
                        onChange={e => handleChange("search", e.target.value)}
                    />
                </div>

                {/* Select by Training */}
                <Select
                    value={filters.training === null ? undefined : String(filters.training)}
                    onValueChange={e => {
                        if (e === 'all') handleChange('training', null);
                        else handleChange('training', Number(e));
                    }}
                >
                    <SelectTrigger className="bg-white dark:bg-[#262626] text-gray-700 dark:text-white data-[placeholder]:text-gray-400 dark:data-[placeholder]:text-white">
                        <SelectValue placeholder="Select By Training" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#262626] text-gray-700 dark:text-white">
                        <SelectItem value="all" className="text-gray-700 dark:text-white focus:bg-gray-200 dark:focus:bg-neutral-700">
                            All
                        </SelectItem>
                        {trainings.map(training => (
                            <SelectItem key={training.id} value={training.id.toString()} className="text-gray-700 dark:text-white focus:bg-gray-200 dark:focus:bg-neutral-700">
                                {training.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Select by Promo */}
                <Select
                    value={filters.promo ?? undefined}
                    onValueChange={e => handleChange('promo', e === 'all' ? '' : e)}
                >
                    <SelectTrigger className="bg-white dark:bg-[#262626] text-gray-700 dark:text-white data-[placeholder]:text-gray-400 dark:data-[placeholder]:text-white">
                        <SelectValue placeholder="Select By Promo" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#262626] text-gray-700 dark:text-white">
                        <SelectItem value="all" className="text-gray-700 dark:text-white focus:bg-gray-200 dark:focus:bg-neutral-700">
                            All
                        </SelectItem>
                        {allPromo.map((p, index) => (
                            <SelectItem key={index} value={p} className="text-gray-700 dark:text-white focus:bg-gray-200 dark:focus:bg-neutral-700">
                                {p}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Select by Role */}
                <Select
                    value={filters.role ?? undefined}
                    onValueChange={e => handleChange('role', e === 'all' ? '' : e)}
                >
                    <SelectTrigger className="bg-white dark:bg-[#262626] text-gray-700 dark:text-white data-[placeholder]:text-gray-400 dark:data-[placeholder]:text-white">
                        <SelectValue placeholder="Select By Role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#262626] text-gray-700 dark:text-white">
                        <SelectItem value="all" className="text-gray-700 dark:text-white focus:bg-gray-200 dark:focus:bg-neutral-700">
                            All
                        </SelectItem>
                        {roles.map((role, index) => (
                            <SelectItem key={index} value={role} className="text-gray-700 dark:text-white focus:bg-gray-200 dark:focus:bg-neutral-700">
                                {role}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Select by Status */}
                <Select
                    value={filters.status ?? undefined}
                    onValueChange={e => handleChange('status', e === 'all' ? '' : e)}
                >
                    <SelectTrigger className="bg-white dark:bg-[#262626] text-gray-700 dark:text-white data-[placeholder]:text-gray-400 dark:data-[placeholder]:text-white">
                        <SelectValue placeholder="Select By Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#262626] text-gray-700 dark:text-white">
                        <SelectItem value="all" className="text-gray-700 dark:text-white focus:bg-gray-200 dark:focus:bg-neutral-700">
                            All
                        </SelectItem>
                        {status.map((s, index) => (
                            <SelectItem key={index} value={s} className="text-gray-700 dark:text-white focus:bg-gray-200 dark:focus:bg-neutral-700">
                                {s}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Reset Button */}
                <Button
                    className="bg-[#262626] cursor-pointer py-1 px-2 w-fit flex gap-2 items-center  text-light rounded-lg"
                    onClick={() => setFilters({
                        search: "",
                        training: null,
                        promo: null,
                        role: "",
                        status: "",
                        date: ""
                    })}
                >
                    <RotateCw size={15} /> Reset
                </Button>


            </div>
        </>
    );
};

export default FilterPart;