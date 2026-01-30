import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, Trash2 } from 'lucide-react';
import DeleteModal from '../DeleteModal';
import EditPost from './EditPost';

import { MoreHorizontal } from 'lucide-react';

const PostMenuDropDown = ({
    user,
    onOpen,
    onOpenChange,
    openDelete,
    openChangeDelete,
    post,
    handleDelete,
    openEditPost,
    openChangeEdit,
    isDeleting,
}) => {
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="cursor-pointer text-xl" variant="primary">
                        <MoreHorizontal className="text-3xl" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => openChangeEdit(true)}>
                            <Edit size={16} />
                            Update
                            {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                if (!isDeleting) {
                                    openChangeDelete(true);
                                }
                            }}
                        >
                            <Trash2 size={16} />
                            {isDeleting ? 'Deleting...' : 'Delete'}
                            {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            {openDelete && (
                <DeleteModal open={openDelete} onOpenChange={openChangeDelete} title="Delete Post" onConfirm={handleDelete} loading={isDeleting} />
            )}
            {openEditPost && <EditPost user={user} onOpenChange={openChangeEdit} post={post} />}
        </>
        // <>
        //     {/* Dropdown */}
        //     <div className="absolute top-8 right-2 w-70 py-5 bg-white dark:bg-dark_gray border border-light/20 rounded-lg shadow-lg overflow-hidden z-50">
        //         <ul className="flex flex-col">
        //             <>
        //                 <li onClick={() => openChangeEdit(true)} className="flex items-center gap-2 px-4 py-2 cursor-pointer text-sm text-beta dark:text-light hover:text-beta/70 dark:hover:text-alpha">
        //                     <Edit size={16} />
        //                     Update
        //                 </li>
        //                 <li
        //                     onClick={() => {
        //                         if (!isDeleting) {
        //                             openChangeDelete(true)
        //                         }
        //                     }}
        //                     className={`flex items-center gap-2 px-4 py-2 cursor-pointer text-sm ${isDeleting ? 'text-error/60 cursor-not-allowed' : 'text-error'}`}
        //                 >
        //                     <Trash2 size={16} />
        //                     {isDeleting ? 'Deleting...' : 'Delete'}
        //                 </li>
        //             </>
        //         </ul>
        //     </div>
        //
        // </>
    );
};

export default PostMenuDropDown;
