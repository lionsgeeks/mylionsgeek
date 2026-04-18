import { Link } from '@inertiajs/react';
import PostCard from '../../../../../components/post/PostCard';

export default function PostsTab({ posts, user }) {
    return (
        <>
            <div className="mx-auto min-h-screen bg-[#fafafa] p-4 dark:bg-[#171717]">
                {user?.id != null && (
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm text-beta/80 dark:text-light/80">
                            {posts.posts.length > 0
                                ? `${posts.posts.length} ${posts.posts.length === 1 ? 'post' : 'posts'} in this tab.`
                                : 'No posts in the preview below.'}
                        </p>
                        <Link href={`/students/${user.id}/posts`} className="text-sm font-semibold text-alpha hover:underline dark:text-alpha">
                            See all posts (full page)
                        </Link>
                    </div>
                )}
                {posts.posts.length === 0 ? <h1>No Posts There</h1> : <PostCard user={user} posts={posts.posts} />}
            </div>
        </>
    );
}
