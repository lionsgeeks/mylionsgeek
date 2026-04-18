import AppLayout from '@/layouts/app-layout';
import { Link, usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import CenterFeed from './partials/feed/CenterFeed';

function useProfileBackHref(viewedUserId) {
    const { auth } = usePage().props;
    return useMemo(() => {
        const raw = auth?.user?.role;
        const roles = Array.isArray(raw) ? raw : raw != null && raw !== '' ? [raw] : [];
        const rolesLower = roles.map((r) => String(r).toLowerCase());
        const canOpenAdminUser = rolesLower.some((r) => ['admin', 'super_admin', 'moderateur', 'coach'].includes(r));
        if (canOpenAdminUser) {
            return `/admin/users/${viewedUserId}`;
        }
        return `/students/${viewedUserId}`;
    }, [auth?.user?.role, viewedUserId]);
}

export default function UserPosts({ user, posts, postsTotal }) {
    const currentUser = user.user;
    const { auth } = usePage().props;
    const isOwnProfile = auth?.user?.id === currentUser.id;
    const profileBackHref = useProfileBackHref(currentUser.id);

    return (
        <AppLayout>
            <div className="z-30 dark:bg-dark">
                <div className="min-h-screen bg-transparent">
                    <div className="mx-auto max-w-7xl px-4">
                        <div className="relative grid grid-cols-1 justify-items-center gap-6 lg:grid-cols-4">
                            {/* <LeftSideBar user={currentUser} /> */}
                            <CenterFeed
                                displayAddPost={false}
                                user={currentUser}
                                posts={posts}
                                showComposer={isOwnProfile}
                                profileBackHref={profileBackHref}
                                lead={
                                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-4 shadow shadow-alpha/10 dark:bg-dark_gray">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Link href={profileBackHref} className="text-sm font-semibold text-alpha hover:underline">
                                                ← Profile
                                            </Link>
                                            <h1 className="text-lg font-semibold text-beta dark:text-light">Posts</h1>
                                            {postsTotal > 0 && (
                                                <span className="text-sm text-beta/70 dark:text-light/70">
                                                    {postsTotal} {postsTotal === 1 ? 'post' : 'posts'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
