import { Avatar } from '@/components/ui/avatar';
import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { helpers } from '../utils/helpers';
import PostMenuDropDown from './PostMenuDropDown';

const PostCardHeader = ({ post, user, takeUserProfile, timeAgo, onDeletePost, isDeleting = false }) => {
    const { addOrRemoveFollow } = helpers();
    const [openDetails, setOpenDetails] = useState(null);
    const [openDeletePost, setOpenDeletePost] = useState(false);
    const [openEditPost, setOpenEditPost] = useState(false);

    //! Delete Post
    const handleDeletePost = () => {
        if (!post?.id || !onDeletePost || isDeleting) {
            return Promise.resolve(false);
        }

        return onDeletePost(post.id).then((result) => {
            setOpenDetails(null);
            setOpenDeletePost(false);
            return result;
        });
    };
    //! open dropdonw
    const handleOpenDetails = (post) => {
        setOpenDetails(post?.id);
    };
    return (
        <>
            <div className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <Link href={takeUserProfile(post)} className="text-sm font-semibold text-gray-900 dark:text-light">
                            <Avatar
                                className="relative z-50 h-12 w-12 overflow-hidden"
                                image={post?.user_image}
                                name={post?.user_name}
                                lastActivity={post?.user_last_online || null}
                                onlineCircleClass="hidden"
                            />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <Link href={takeUserProfile(post)} className="text-sm font-semibold text-gray-900 dark:text-light">
                                    {post?.user_name}
                                </Link>
                                {user?.id != post?.user_id && (
                                    <span
                                        onClick={() => addOrRemoveFollow(post?.user_id, post?.is_following)}
                                        className="cursor-pointer text-xs text-gray-500 dark:text-alpha"
                                    >
                                        • {post?.is_following ? 'Unfollow' : 'Follow'}
                                    </span>
                                )}
                            </div>
                            {/* <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {post?.user_status}
                                        </p> */}
                            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <span>{timeAgo(post?.created_at)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {user?.id === post?.user_id && (
                            <PostMenuDropDown
                                user={user}
                                onOpen={openDetails}
                                onOpenChange={setOpenDetails}
                                openDelete={openDeletePost}
                                openChangeDelete={setOpenDeletePost}
                                openEditPost={openEditPost}
                                openChangeEdit={(state) => {
                                    setOpenEditPost(state);
                                    if (!state) {
                                        setOpenDetails(null);
                                    }
                                }}
                                post={post}
                                handleDelete={handleDeletePost}
                                isDeleting={isDeleting}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default PostCardHeader;
