import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

const Members = () => {
    return (
        <>
            <AppLayout>
                <Head title="Members" />
                <div className='p-10'>
                    <h1>hello world</h1>
                </div>
            </AppLayout>
        </>
    );
};

export default Members;