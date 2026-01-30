import { Avatar } from '@/components/ui/avatar';
import { Link } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { helpers } from './utils/helpers';

const FollowModal = ({ openChange, onOpenChange, student }) => {
    const [activeTab, setActiveTab] = useState(openChange[1]);
    const [searchTerm, setSearchTerm] = useState('');
    const { stopScrolling, addOrRemoveFollow } = helpers();

    useEffect(() => {
        stopScrolling(openChange[0]);
        return () => stopScrolling(false);
    }, [openChange[0]]);

    const closeModal = () => {
        onOpenChange([false, 'followers']);
    };

    const rawList = activeTab === 'followers' ? student?.followers || [] : student?.following || [];

    const displayList = rawList.filter(
        (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())),
    );

    if (!openChange[0]) return null;

    return (
        <>
            {/* Overlay */}
            <div onClick={closeModal} className="bg-b/50 fixed inset-0 z-30 h-full backdrop-blur-md transition-all duration-300 dark:bg-beta/60" />

            {/* Modal */}
            <div className="fixed inset-0 top-1/2 z-50 mx-auto flex h-[90vh] w-full max-w-md -translate-y-1/2 flex-col rounded-2xl bg-light shadow-2xl dark:bg-dark">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-4 dark:border-beta">
                    <div className="w-6" />
                    <h2 className="text-base font-semibold text-beta dark:text-light">{student?.name?.toLowerCase()}</h2>
                    <button onClick={closeModal} className="text-beta transition-colors hover:text-alpha dark:text-light">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b dark:border-beta">
                    <button
                        onClick={() => setActiveTab('followers')}
                        className={`relative flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'followers' ? 'text-beta dark:text-light' : 'text-beta dark:text-alpha'}`}
                    >
                        Followers ({student?.followers?.length || 0})
                        {activeTab === 'followers' && <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-alpha" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('following')}
                        className={`relative flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'following' ? 'text-beta dark:text-light' : 'text-b dark:text-alpha'}`}
                    >
                        Following ({student?.following?.length || 0})
                        {activeTab === 'following' && <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-alpha" />}
                    </button>
                </div>

                {/* Search Bar */}
                <div className="border-b p-3 dark:border-beta">
                    <input
                        type="text"
                        placeholder="Search"
                        className="w-full rounded-lg bg-light px-4 py-2 text-sm text-beta focus:ring-1 focus:ring-alpha focus:outline-none dark:bg-dark_gray dark:text-light"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* User List */}
                <div className="flex-1 overflow-y-auto">
                    {displayList.length === 0 ? (
                        <p className="text-b p-4 text-center dark:text-light">No users found.</p>
                    ) : (
                        displayList.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-alpha/10 dark:hover:bg-alpha/20"
                            >
                                <Link href={`/students/${user.id}`} className="z-20 flex flex-1 items-center gap-3">
                                    <Avatar
                                        className="h-14 w-14 overflow-hidden ring-2 ring-light dark:ring-dark_gray"
                                        image={user.image}
                                        name={user.name}
                                        lastActivity={user.last_online || null}
                                        onlineCircleClass="hidden"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-beta dark:text-light">{user.username || user.name}</p>
                                    </div>
                                </Link>
                                {/* <button
                                    onClick={() => //console.log(student?.isFollowing)}
                                    className={`px-6 py-1.5 z-50 rounded-lg text-sm font-semibold transition-colors ${student.isFollowing
                                        ? 'bg-light dark:bg-dark text-beta dark:text-light hover:bg-alpha/20'
                                        : 'bg-alpha text-b hover:bg-alpha/80'
                                        }`}
                                >
                                    {student.isFollowing ? 'Following' : 'Follow'}
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
