import React from 'react';
import { Edit3, Trash2, Flag, Share2, Link2, Bookmark } from 'lucide-react'
import { usePage } from '@inertiajs/react';
import DeleteModal from './DeleteModal';

const PostMenuDropDown = ({ open, openChange, post, handleDelete }) => {
    const { auth } = usePage().props
    return (
        <>
            {/* Dropdown */}
            <div className="absolute top-8 right-2 w-70 py-5 bg-white dark:bg-dark_gray border border-light/20 rounded-lg shadow-lg overflow-hidden z-50">
                <ul className="flex flex-col">
                    {auth.user.id == post.user_id &&
                        <li onClick={() => openChange(true)} className="flex items-center gap-2 px-4 py-2 cursor-pointer text-sm text-beta dark:text-light hover:text-beta/70 dark:hover:text-alpha">
                            <Trash2 size={16} />
                            Delete
                        </li>
                    }
                </ul>
            </div>
            {open && <DeleteModal open={open} onOpenChange={openChange} title='Delete Post' onConfirm={handleDelete} />}
        </>
    );
};

export default PostMenuDropDown;