import React, { useEffect, useState } from 'react';
import axios from "axios";
import { useInitials } from "@/hooks/use-initials";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from '@inertiajs/react';

const LikesModal = ({ postId, open, onClose }) => {
    const [likes, setLikes] = useState([]);
    const [loading, setLoading] = useState(false);
    const getInitials = useInitials();

    useEffect(() => {
        if (open && postId) {
            setLoading(true);
            axios
                .get(`/admin/users/get/${postId}/likes`)
                .then((res) => {
                    setLikes(res.data.likes || []);
                })
                .catch((err) => console.error("Error fetching likes:", err))
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

    const timeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        if (seconds < 60) return "Just now";
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    };

    if (!open) return null;
    console.log(likes);


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg mx-auto rounded-3xl overflow-hidden shadow-2xl border border-alpha/30 bg-light dark:bg-dark_gray flex flex-col max-h-[90vh] transition-all duration-300">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-alpha/10 to-alpha/5 px-6 py-4 border-b border-alpha/30">
                    <div className="flex items-center justify-center gap-2">
                        <h2 className="text-lg font-semibold text-beta dark:text-alpha">Liked by</h2>
                    </div>
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {loading ? "Loading..." : `${likes.length} people`}
                    </p>
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-dark hover:bg-alpha/10 rounded-full transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Likes List */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                    {loading ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-6">Loading likes...</p>
                    ) : likes.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-6">No likes yet</p>
                    ) : (
                        likes.map((like, index) => (
                            <div
                                key={like.id}
                                className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-beta border border-alpha/10 hover:border-alpha/30 transition duration-200 hover:shadow-md"
                            >
                                {/* Avatar */}
                                <Link href={'/admin/users/' + like.user_id}>
                                    <Avatar className="w-11 h-11 flex-shrink-0 ring-2 ring-alpha/30" image={like.user_image} name={like.user_name} width="w-11" height="h-11" />
                                </Link>
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <Link className="font-semibold text-beta dark:text-light text-sm truncate" href={'/admin/users/' + like.user_id}>

                                        {like.user_name}
                                    </Link>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {like.user_status}
                                    </div>

                                </div>

                                {/* Heart Icon */}
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {timeAgo(like.created_at)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default LikesModal;
