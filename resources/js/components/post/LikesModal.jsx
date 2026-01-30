import { Avatar } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { timeAgo } from '../../lib/utils';

const LikesModal = ({ postId, open, onClose, takeToUserProfile }) => {
    const [likes, setLikes] = useState([]);
    const [loading, setLoading] = useState(false);
    const getInitials = useInitials();

    useEffect(() => {
        if (open && postId) {
            setLoading(true);
            axios
                .get(`/posts/likes/${postId}`)
                .then((res) => {
                    setLikes(res.data.likes || []);
                })
                .catch((err) => console.error('Error fetching likes:', err))
                .finally(() => setLoading(false));
        } else {
            setLikes([]);
            setLoading(false);
        }
    }, [open, postId]);

    // const getInitials = (name) =>
    //     name
    //         .split(" ")
    //         .map((n) => n[0])
    //         .join("")
    //         .toUpperCase()
    //         .slice(0, 2);

    // const getAvatarGradient = (index) => {
    //     const gradients = [
    //         "from-alpha to-yellow-500",
    //         "from-yellow-400 to-alpha",
    //         "from-alpha to-yellow-300",
    //         "from-yellow-300 to-yellow-500",
    //     ];
    //     return gradients[index % gradients.length];
    // };

    if (!open) return null;
    //(likes);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" onClick={onClose} />

            {/* Modal */}
            <div className="relative mx-auto flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-alpha/30 bg-light shadow-2xl transition-all duration-300 dark:bg-dark_gray">
                {/* Header */}
                <div className="relative border-b border-alpha/30 bg-gradient-to-r from-alpha/10 to-alpha/5 px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                        <h2 className="text-lg font-semibold text-beta dark:text-alpha">Liked by</h2>
                    </div>
                    <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">{loading ? 'Loading...' : `${likes.length} people`}</p>
                    <button
                        onClick={onClose}
                        className="absolute top-1/2 right-4 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-gray-500 transition hover:bg-alpha/10 hover:text-dark dark:text-gray-400"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Likes List */}
                <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
                    {loading ? (
                        <p className="py-6 text-center text-gray-500 dark:text-gray-400">Loading likes...</p>
                    ) : likes.length === 0 ? (
                        <p className="py-6 text-center text-gray-500 dark:text-gray-400">No likes yet</p>
                    ) : (
                        likes.map((like, index) => (
                            <div
                                key={like.id}
                                className="flex items-center gap-3 rounded-2xl border border-alpha/10 bg-gray-50 p-3 transition duration-200 hover:border-alpha/30 hover:shadow-md dark:bg-beta"
                            >
                                {/* Avatar */}
                                <Link
                                    href={takeToUserProfile(like)}
                                    className="hover:bg-light_gray flex w-full items-center gap-3 rounded-lg p-2 transition-colors"
                                >
                                    {/* Avatar */}
                                    <Avatar
                                        className="h-11 w-11 flex-shrink-0 ring-2 ring-alpha/30"
                                        image={like.user_image}
                                        name={like.user_name}
                                        width="w-11"
                                        height="h-11"
                                    />

                                    {/* User info */}
                                    <div className="flex flex-1 items-start justify-between">
                                        <div className="flex flex-col">
                                            <span className="max-w-[150px] truncate font-medium text-dark dark:text-light">{like.user_name}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{like.user_status}</span>
                                        </div>

                                        <span className="text-xs whitespace-nowrap text-gray-400">{timeAgo(like.created_at)}</span>
                                    </div>
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default LikesModal;
