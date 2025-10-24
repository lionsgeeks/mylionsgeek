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
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                    <Input
                        type="text"
                        placeholder="Search"
                        className="pl-10 bg-[#262626] text-white placeholder:text-white"
                        value={filters.search}
                        onChange={e => handleChange("search", e.target.value)}
                    />
                </div>
                {/* select by training */}
                <Select
                    value={filters.training === null ? undefined : String(filters.training)}
                    onValueChange={e => {
                        if (e === 'all') {
                            handleChange('training', null); // show all trainings
                        } else {
                            handleChange('training', Number(e)); // filter by specific training
                        }
                    }}
                >
                    <SelectTrigger className="bg-[#262626] text-white data-[placeholder]:text-white">
                        <SelectValue placeholder="Select By Training" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] text-white">
                        <SelectItem
                            value="all"
                            className="text-white focus:bg-neutral-700 focus:text-white"
                        >
                            All
                        </SelectItem>
                        {trainings.map(training => (
                            <SelectItem
                                key={training.id}
                                value={training.id.toString()}
                                className="text-white focus:bg-neutral-700 focus:text-white"
                            >
                                {training.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>


                {/* select by Promo */}
                {/* Select by Promo */}
                <Select
                    value={filters.promo ?? undefined}
                    onValueChange={e => {
                        if (e === 'all') {
                            handleChange('promo', ''); // show all trainings
                        } else {
                            handleChange('promo', e); // filter by specific training
                        }
                    }}
                >
                    <SelectTrigger className="bg-[#262626] text-white data-[placeholder]:text-white">
                        <SelectValue placeholder="Select By Promo" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] text-white">
                        <SelectItem value="all" className="text-white focus:bg-neutral-700 focus:text-white">
                            All
                        </SelectItem>
                        {allPromo.map((p, index) => (
                            <SelectItem key={index} value={p} className="text-white focus:bg-neutral-700 focus:text-white">
                                {p}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Select by Role */}
                <Select
                    value={filters.role ?? undefined}
                    onValueChange={e => {
                        if (e === 'all') {
                            handleChange('role', ''); // show all trainings
                        } else {
                            handleChange('role', e); // filter by specific training
                        }
                    }}
                >
                    <SelectTrigger className="bg-[#262626] text-white data-[placeholder]:text-white">
                        <SelectValue placeholder="Select By Role" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] text-white">
                        <SelectItem value="all" className="text-white focus:bg-neutral-700 focus:text-white">
                            All
                        </SelectItem>
                        {roles.map((role, index) => (
                            <SelectItem key={index} value={role} className="text-white focus:bg-neutral-700 focus:text-white">
                                {role}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Select by Status */}
                <Select
                    value={filters.status ?? undefined}
                    onValueChange={e => {
                        if (e === 'all') {
                            handleChange('status', ''); // show all trainings
                        } else {
                            handleChange('status', e); // filter by specific training
                        }
                    }}
                >
                    <SelectTrigger className="bg-[#262626] text-white data-[placeholder]:text-white">
                        <SelectValue placeholder="Select By Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] text-white">
                        <SelectItem value="all" className="text-white focus:bg-neutral-700 focus:text-white">
                            All
                        </SelectItem>
                        {status.map((s, index) => (
                            <SelectItem key={index} value={s} className="text-white focus:bg-neutral-700 focus:text-white">
                                {s}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button
                    className='dark:bg-[#262626] cursor-pointer py-1 px-2 w-fit flex gap-2 items-center dark:text-white bg-dark text-light rounded-lg'
                    onClick={() => {
                        setFilters({
                            search: "",
                            training: null,
                            promo: null,
                            role: "",
                            status: "",
                            date: ""
                        })
                        // console.log(filteredUsers.length)
                    }
                    }
                >
                    <RotateCw size={15} /> Reset
                </Button>

            </div>
        </>
    );
};

export default FilterPart;