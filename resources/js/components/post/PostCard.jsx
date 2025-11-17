import React, { useState, useEffect } from 'react';
import { timeAgo } from '../../lib/utils';
import CommentsModal from './CommentsModal';
import LikesModal from './LikesModal';
import UndoRemove from '../UndoRemove';
import { Link, router, usePage } from '@inertiajs/react';
import { helpers } from '../utils/helpers';
import PostCardHeader from './PostCardHeader';
import PostCardMainContent from './PostCardMainContent';
import PostCardFooter from './PostCardFooter';

const PostCard = ({ user, posts }) => {
    const { auth } = usePage().props
    const { addOrRemoveFollow } = helpers();
    const [undoState, setUndoState] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [undoTimer, setUndoTimer] = useState(null);
    const [postText, setPostText] = useState(null);
    const [postImage, setPostImage] = useState(null);

    // 🩵 Comment count handlers



    // 🩵 Undo delete logic
    useEffect(() => {
        return () => {
            if (undoTimer) clearTimeout(undoTimer);
        };
    }, [undoTimer]);

    const handlePostRemoved = (postId) => {
        // const newPosts = posts?.filter((p) => p?.id !== postId);
        // onPostsChange(newPosts);
    };



    const handleUndoClick = () => {
        if (undoTimer) clearTimeout(undoTimer);
        setUndoState(false);
        setPendingDeleteId(null);
    };

    // 🩵 Open/close post details dropdown
    const handleOpenDetails = (post) => {
        setOpenDetails(post?.id);
        setPostText(post?.description);
        setPostImage(post?.image);
    };



    const takeToUserProfile = (post) => {
        if (auth.user.role.includes('admin')) {
            return '/admin/users/' + post?.user_id
        }
        return '/student/' + post?.user_id
    }

    return (
        <>
            {posts?.map((p, index) => {
                return (
                    <div key={index} className="bg-white dark:bg-dark rounded-lg shadow mb-4">
                        {/* Post Header */}
                        <PostCardHeader post={p} user={auth.user} postText={postText} postImage={postImage} onPostTextChange={setPostText} onPostImageChange={setPostImage} takeUserProfile={takeToUserProfile} timeAgo={timeAgo} />

                        {/* Post Content */}
                        <PostCardMainContent post={p} user={auth.user} addOrRemoveFollow={addOrRemoveFollow} timeAgo={timeAgo} takeToUserProfile={takeToUserProfile} />

                        {/* post footer */}
                        <PostCardFooter post={p} user={auth.user} takeToUserProfile={takeToUserProfile} />
                    </div>
                );
            })}

            {/* Undo popup */}
            {undoState && <UndoRemove state={undoState} onUndo={handleUndoClick} />}


           
        </>
    );
};

export default PostCard;
