import AppLayout from '@/layouts/app-layout';
import StudentAttendanceReminderBanner from '@/components/student-attendance-reminder-banner';
import CenterFeed from './partials/feed/CenterFeed';
import LeftSideBar from './partials/feed/LeftSideBar';
// import RightSideBar from './partials/RightSideBar';

export default function StudentFeed({ user, feedPosts, feedNextCursor, feedHasMore }) {
    const currentUser = user.user;

    return (
        <>
            <AppLayout>
                <StudentAttendanceReminderBanner />
                <div className="dark:bg-dark">
                    <div className="min-h-screen bg-transparent">
                        {/* Main Container */}
                        <div className="mx-auto max-w-7xl px-4 bg-blend-darken">
                            <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-12">
                                <LeftSideBar user={currentUser} />
                                <CenterFeed
                                    user={currentUser}
                                    posts={feedPosts}
                                    feedNextCursor={feedNextCursor}
                                    feedHasMore={feedHasMore}
                                    enableInfiniteScroll
                                />
                                {/* <RightSideBar /> */}
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
