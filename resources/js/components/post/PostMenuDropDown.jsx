import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, Flag, Trash2 } from 'lucide-react';
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
    onReportPost,
}) => {
    const isRepostCard = post?.type === 'repost';
    const isOwner = user?.id === post?.user_id;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="cursor-pointer text-xl" variant="primary">
                        <MoreHorizontal className="text-3xl" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start">
                    <DropdownMenuLabel>Post</DropdownMenuLabel>
                    <DropdownMenuGroup>
                        {isOwner && isRepostCard ? (
                            <DropdownMenuItem
                                onClick={() => {
                                    if (!isDeleting) {
                                        openChangeDelete(true);
                                    }
                                }}
                            >
                                <Trash2 size={16} className="text-red-600" />
                                <span className="font-semibold text-red-600">{isDeleting ? 'Removing...' : 'Remove repost'}</span>
                            </DropdownMenuItem>
                        ) : isOwner ? (
                            <>
                                <DropdownMenuItem onClick={() => openChangeEdit(true)}>
                                    <Edit size={16} />
                                    Update
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
                                </DropdownMenuItem>
                            </>
                        ) : (
                            <DropdownMenuItem
                                onClick={() => {
                                    if (typeof onReportPost === 'function') {
                                        onReportPost(post);
                                    }
                                }}
                            >
                                <Flag size={16} className="text-red-600" />
                                <span className="font-semibold text-red-600">Report</span>
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            {openDelete && (
                <DeleteModal
                    open={openDelete}
                    onOpenChange={openChangeDelete}
                    title={isRepostCard ? 'Remove repost' : 'Delete Post'}
                    description={
                        isRepostCard
                            ? 'This removes your repost from the feed. The original post will not be deleted.'
                            : undefined
                    }
                    onConfirm={handleDelete}
                    loading={isDeleting}
                />
            )}
            {openEditPost && <EditPost user={user} onOpenChange={openChangeEdit} post={post} />}
        </>
    );
};

export default PostMenuDropDown;
