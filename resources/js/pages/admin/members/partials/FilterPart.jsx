import React from 'react';
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"



const FilterPart = () => {
    return (
        <>
            <div className='grid grid-cols-4 gap-4'>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                    <Input
                        type="text"
                        placeholder="Search"
                        className="pl-10"
                    />
                </div>
                {/* select by training */}
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Select By Training" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                    </SelectContent>
                </Select>
                {/* select by select by promo */}
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Select By Training" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                    </SelectContent>
                </Select>
                {/* select by select by date newest to older or reverse */}
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Select By Training" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                    </SelectContent>
                </Select>

            </div>
        </>
    );
};

export default FilterPart;