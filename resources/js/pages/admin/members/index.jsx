import React from 'react';
import AppLayout from '@/layouts/app-layout';
import Header from './partials/Header';
import FilterPart from './partials/FilterPart';
import { usePage } from '@inertiajs/react';

const Members = () => {
    const {allMembers} = usePage().props
    console.log(allMembers.length);
    
    return (
        <>
            <AppLayout>
                <div className='p-10 flex flex-col gap-10'>
                    <Header allmembers={allMembers.length} />
                    <FilterPart />
                </div>
            </AppLayout>
        </>
    );
};

export default Members;