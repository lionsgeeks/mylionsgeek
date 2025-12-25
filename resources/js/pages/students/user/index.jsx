import React, { useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import LeftSideBar from './partials/feed/LeftSideBar';
import CenterFeed from './partials/feed/CenterFeed';
// import RightSideBar from './partials/RightSideBar';


export default function StudentFeed({ user, posts }) {
    const currentUser = user.user
    const currentPosts = posts.posts

    return (
        <>
            <AppLayout>
                <div className='z-30 dark:bg-black/25'>
                    <div className="min-h-screen  bg-transparent ">
                        {/* Main Container */}
                        <div className="max-w-7xl  mx-auto px-4 bg-blend-darken">
                            <div className="grid relative grid-cols-1 lg:grid-cols-12 gap-6">
                                <LeftSideBar user={currentUser} />
                                <CenterFeed user={currentUser} posts={currentPosts} />
                                {/* <RightSideBar /> */}
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}



