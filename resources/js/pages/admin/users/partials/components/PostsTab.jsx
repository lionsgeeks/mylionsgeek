import PostCard from '../../../../../components/post/PostCard';

export default function PostsTab({ posts, user }) {
    //console.log(posts);
    return (
        <>
            <div className="mx-auto min-h-screen bg-[#fafafa] p-4 dark:bg-[#171717]">
                {posts.posts.length === 0 ? <h1>No Posts There</h1> : <PostCard user={user} posts={posts.posts} />}
            </div>
        </>
    );
}
