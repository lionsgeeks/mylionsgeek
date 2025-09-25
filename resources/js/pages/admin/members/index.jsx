import React from 'react';
import AppLayout from '@/layouts/app-layout';
import Header from './partials/Header';
import FilterPart from './partials/FilterPart';
import { usePage } from '@inertiajs/react';
import MembersTable from './partials/MembersTable';

const Members = () => {
    const {allMembers , paginateMembers} = usePage().props
    
    return (
        <>
            <AppLayout>
                <div className='p-10 flex flex-col gap-10'>
                    <Header allmembers={allMembers.length} />
                    <FilterPart />
                    <MembersTable paginateMembers={paginateMembers} />
                </div>
            </AppLayout>
        </>
    );
};

export default Members;