import React from 'react';
import { Trash2, Edit } from 'lucide-react'; // Importing icons for edit and delete

const PostMenuDropDown = ({ post, handleDelete, handleEdittePost }) => {
    return (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#212529] rounded-lg shadow-lg border dark:border-[#1f2326]">
            {/* Dropdown Menu */}
            <ul className="flex flex-col">
                {/* Check if the post belongs to the current user (user can edit or delete only their own posts) */}
                {post?.user_id && (
                    <>
                        <li
                            onClick={() => handleDelete(post.id)} // Handle delete post
                            className="flex items-center gap-2 px-4 py-2 cursor-pointer text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-[#1f2326] rounded-t-lg"
                        >
                            <Trash2 size={16} /> {/* Trash icon */}
                            Delete
                        </li>

                        <li
                            onClick={() => handleEdittePost(post)} // Handle edit post
                            className="flex items-center gap-2 px-4 py-2 cursor-pointer text-sm text-beta dark:text-light hover:bg-gray-100 dark:hover:bg-[#1f2326] rounded-b-lg"
                        >
                            <Edit size={16} /> {/* Edit icon */}
                            Edit
                        </li>
                    </>
                )}
            </ul>
        </div>
    );
};

export default PostMenuDropDown;
