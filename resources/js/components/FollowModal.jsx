import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { helpers } from './utils/helpers';
import { Avatar } from '@/components/ui/avatar';
import { Link } from '@inertiajs/react';

const FollowModal = ({ openChange, onOpenChange, student }) => {
    const [activeTab, setActiveTab] = useState(openChange[1]);
    const [searchTerm, setSearchTerm] = useState('');
    const { stopScrolling, addOrRemoveFollow } = helpers();

    useEffect(() => {
        stopScrolling(openChange[0])
        return () => stopScrolling(false);
    }, [openChange[0]]);

    const closeModal = () => {
        onOpenChange([false, 'followers']);
    };

    const rawList = activeTab === 'followers' ? student?.followers || [] : student?.following || [];

    const displayList = rawList.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (!openChange[0]) return null;

    return (
        <>
            {/* Overlay */}
            <div
                onClick={closeModal}
                className="fixed inset-0 h-full z-30 bg-b/50 dark:bg-beta/60 backdrop-blur-md transition-all duration-300"
            />

            {/* Modal */}
            <div className="bg-light dark:bg-dark rounded-2xl z-50 fixed inset-0 mx-auto top-1/2 -translate-y-1/2 w-full max-w-md shadow-2xl flex flex-col h-[90vh]">

                {/* Header */}
                <div className="border-b dark:border-beta flex items-center justify-between p-4">
                    <div className="w-6" />
                    <h2 className="text-base font-semibold text-beta dark:text-light">{student?.name?.toLowerCase()}</h2>
                    <button
                        onClick={closeModal}
                        className="text-beta dark:text-light hover:text-alpha transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b dark:border-beta">
                    <button
                        onClick={() => setActiveTab('followers')}
                        className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${activeTab === 'followers' ? 'text-beta dark:text-light' : 'text-b dark:text-alpha'}`}
                    >
                        Followers ({student?.followers?.length || 0})
                        {activeTab === 'followers' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-alpha" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('following')}
                        className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${activeTab === 'following' ? 'text-beta dark:text-light' : 'text-b dark:text-alpha'}`}
                    >
                        Following ({student?.following?.length || 0})
                        {activeTab === 'following' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-alpha" />
                        )}
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-3 border-b dark:border-beta">
                    <input
                        type="text"
                        placeholder="Search"
                        className="w-full bg-light dark:bg-dark_gray text-beta dark:text-light rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-alpha"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* User List */}
                <div className="flex-1 overflow-y-auto">
                    {displayList.length === 0 ? (
                        <p className="p-4 text-center text-b dark:text-light">No users found.</p>
                    ) : (
                        displayList.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between p-3 hover:bg-alpha/10 dark:hover:bg-alpha/20 transition-colors rounded-lg"
                            >
                                <Link href={`/student/${user.id}`} className="flex items-center gap-3 flex-1 z-20">
                                    <Avatar
                                        className="w-14 h-14 overflow-hidden ring-2 ring-light dark:ring-dark_gray"
                                        image={user.image}
                                        name={user.name}
                                        lastActivity={user.last_online || null}
                                        onlineCircleClass="hidden"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-beta dark:text-light truncate">
                                            {user.username || user.name}
                                        </p>
                                    </div>
                                </Link>
                                {/* <button
                                    onClick={() => addOrRemoveFollow(user.id, user?.isFollowing)}
                                    className={`px-6 py-1.5 z-50 rounded-lg text-sm font-semibold transition-colors ${user.isFollowing
                                        ? 'bg-light dark:bg-dark text-beta dark:text-light hover:bg-alpha/20'
                                        : 'bg-alpha text-b hover:bg-alpha/80'
                                        }`}
                                >
                                    {user.isFollowing ? 'Following' : 'Follow'}
                                </button> */}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};

export default FollowModal;
