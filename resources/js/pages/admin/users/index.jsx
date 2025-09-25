import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import Header from './partials/Header';
import FilterPart from './partials/FilterPart';
import { usePage } from '@inertiajs/react';
import UsersTable from './partials/UsersTable';

const Users = ({ users }) => {
    const [filters, setFilters] = useState({
        search: "",              // "default" means no sorting applied
    });

    return (
        <>
            <AppLayout>
                <div className='p-10 flex flex-col gap-10'>
                    <Header allmembers={users.length} />
                    <FilterPart filters={filters} setFilters={setFilters} />
                    <UsersTable users={users} filter={filters} />
                </div>
            </AppLayout>
        </>
    );
};

export default Users;