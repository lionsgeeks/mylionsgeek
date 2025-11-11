import React, { useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import LeftSideBar from './partials/LeftSideBar';
import CenterFeed from './partials/CenterFeed';
import RightSideBar from './partials/RightSideBar';


export default function StudentFeed({ user, posts }) {
    // console.log(posts);
    
    return (
        <>
            <AppLayout>
                <div className='z-30'>
                    <div className="min-h-screen  bg-transparent ">
                        {/* Main Container */}
                        <div className="max-w-7xl mx-auto px-4">
                            <div className="grid relative grid-cols-1 lg:grid-cols-12 gap-6">
                                <LeftSideBar user={user} />
                                <CenterFeed user={user} posts={posts} />
                                <RightSideBar />
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>

        </>
    );
}



