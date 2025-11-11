import React from 'react';
import { Trash2, Edit } from 'lucide-react'
import DeleteModal from '../DeleteModal';
import EditPost from './EditPost';

const PostMenuDropDown = ({ user, openDelete, openChangeDelete, post, handleDelete, openEditPost, openChangeEdit, postText, onPostTextChange, postImage, onPostImageChange, handleEditePost }) => {
    return (
        <>
            {/* Dropdown */}
            <div className="absolute top-8 right-2 w-70 py-5 bg-white dark:bg-dark_gray border border-light/20 rounded-lg shadow-lg overflow-hidden z-50">
                <ul className="flex flex-col">
                    {user.id == post?.user_id &&
                        <>
                            <li onClick={() => openChangeEdit(true)} className="flex items-center gap-2 px-4 py-2 cursor-pointer text-sm text-beta dark:text-light hover:text-beta/70 dark:hover:text-alpha">
                                <Edit size={16} />
                                Update
                            </li>
                            <li onClick={() => openChangeDelete(true)} className="flex items-center gap-2 px-4 py-2 cursor-pointer text-sm text-error">
                                <Trash2 size={16} />
                                Delete
                            </li>
                        </>
                    }
                </ul>
            </div>
            {openDelete && <DeleteModal open={openDelete} onOpenChange={openChangeDelete} title='Delete Post' onConfirm={handleDelete} />}
            {openEditPost && <EditPost user={user} open={openEditPost} onOpenChange={openChangeEdit} post={post} postText={postText} onPostTextChange={onPostTextChange} onPostImageChange={onPostImageChange} onConfirm={handleEditePost} />}
        </>
    );
};

export default PostMenuDropDown;