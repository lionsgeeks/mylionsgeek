import React, { useEffect, useState } from 'react';
import { X, UserPlus, UserCheck } from 'lucide-react';
import { helpers } from './utils/helpers';

const FollowModal = ({ openChange, onOpenChange, following, followers }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('followers');
    const { stopScrolling } = helpers()
    useEffect(() => {
        stopScrolling(true)
    }, [])
    console.log(followers);
    console.log(following);






    // const [followers, setFollowers] = useState([
    //     { id: 1, username: 'sarah_jones', name: 'Sarah Jones', avatar: 'https://i.pravatar.cc/150?img=1', isFollowing: true },
    //     { id: 2, username: 'mike_wilson', name: 'Mike Wilson', avatar: 'https://i.pravatar.cc/150?img=2', isFollowing: false },
    //     { id: 3, username: 'emma_davis', name: 'Emma Davis', avatar: 'https://i.pravatar.cc/150?img=5', isFollowing: true },
    //     { id: 4, username: 'john_smith', name: 'John Smith', avatar: 'https://i.pravatar.cc/150?img=3', isFollowing: false },
    //     { id: 5, username: 'lisa_brown', name: 'Lisa Brown', avatar: 'https://i.pravatar.cc/150?img=9', isFollowing: true },
    //     { id: 6, username: 'alex_martin', name: 'Alex Martin', avatar: 'https://i.pravatar.cc/150?img=7', isFollowing: false },
    //     { id: 7, username: 'rachel_lee', name: 'Rachel Lee', avatar: 'https://i.pravatar.cc/150?img=10', isFollowing: true },
    //     { id: 8, username: 'chris_taylor', name: 'Chris Taylor', avatar: 'https://i.pravatar.cc/150?img=8', isFollowing: false },
    // ]);

    // const [following] = useState([
    //     { id: 1, username: 'sarah_jones', name: 'Sarah Jones', avatar: 'https://i.pravatar.cc/150?img=1', isFollowing: true },
    //     { id: 3, username: 'emma_davis', name: 'Emma Davis', avatar: 'https://i.pravatar.cc/150?img=5', isFollowing: true },
    //     { id: 5, username: 'lisa_brown', name: 'Lisa Brown', avatar: 'https://i.pravatar.cc/150?img=9', isFollowing: true },
    // ]);

    // const toggleFollow = (userId) => {
    //     setFollowers(followers.map(user =>
    //         user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user
    //     ));
    // };

    // const displayList = activeTab === 'followers' ? followers : following;

    // if (!isOpen) return null;

    // return (
    //     <>

    //         <div onClick={() => onOpenChange(false)} className="fixed inset-0 h-full z-30 bg-[var(--color-dark)]/50 dark:bg-[var(--color-beta)]/60 backdrop-blur-md transition-all duration-300"
    //         >
    //         </div>

    //         <div className="bg-white z-50 fixed inset-0 mx-auto top-1/2 -translate-y-1/2 rounded-2xl w-full max-w-md shadow-2xl flex flex-col h-[90vh]">
    //             {/* Header */}
    //             <div className="border-b border-gray-200 flex items-center justify-between p-4">
    //                 <div className="w-6"></div>
    //                 <h2 className="text-base font-semibold">john_doe</h2>
    //                 <button
    //                     onClick={() => setIsOpen(false)}
    //                     className="text-gray-500 hover:text-gray-700"
    //                 >
    //                     <X size={24} onClick={() => onOpenChange(false)} />
    //                 </button>
    //             </div>

    //             {/* Tabs */}
    //             <div className="flex border-b border-gray-200">
    //                 <button
    //                     onClick={() => setActiveTab('followers')}
    //                     className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${activeTab === 'followers' ? 'text-gray-900' : 'text-gray-400'
    //                         }`}
    //                 >
    //                     274 Followers
    //                     {activeTab === 'followers' && (
    //                         <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
    //                     )}
    //                 </button>
    //                 <button
    //                     onClick={() => setActiveTab('following')}
    //                     className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${activeTab === 'following' ? 'text-gray-900' : 'text-gray-400'
    //                         }`}
    //                 >
    //                     198 Following
    //                     {activeTab === 'following' && (
    //                         <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
    //                     )}
    //                 </button>
    //             </div>

    //             {/* Search Bar */}
    //             <div className="p-3 border-b border-gray-200">
    //                 <input
    //                     type="text"
    //                     placeholder="Search"
    //                     className="w-full bg-gray-100 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
    //                 />
    //             </div>

    //             {/* User List */}
    //             <div className="flex-1 overflow-y-auto">
    //                 {displayList.map((user) => (
    //                     <div
    //                         key={user.id}
    //                         className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
    //                     >
    //                         <div className="flex items-center gap-3 flex-1">
    //                             <img
    //                                 src={user.avatar}
    //                                 alt={user.username}
    //                                 className="w-11 h-11 rounded-full object-cover"
    //                             />
    //                             <div className="flex-1 min-w-0">
    //                                 <p className="text-sm font-semibold text-gray-900 truncate">
    //                                     {user.username}
    //                                 </p>
    //                                 <p className="text-sm text-gray-500 truncate">{user.name}</p>
    //                             </div>
    //                         </div>

    //                         {activeTab === 'followers' && (
    //                             <button
    //                                 onClick={() => toggleFollow(user.id)}
    //                                 className={`px-6 py-1.5 rounded-lg text-sm font-semibold transition-colors ${user.isFollowing
    //                                     ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
    //                                     : 'bg-blue-500 text-white hover:bg-blue-600'
    //                                     }`}
    //                             >
    //                                 {user.isFollowing ? 'Following' : 'Follow'}
    //                             </button>
    //                         )}

    //                         {activeTab === 'following' && (
    //                             <button
    //                                 className="px-6 py-1.5 rounded-lg text-sm font-semibold bg-gray-200 text-gray-900 hover:bg-gray-300 transition-colors"
    //                             >
    //                                 Following
    //                             </button>
    //                         )}
    //                     </div>
    //                 ))}
    //             </div>
    //         </div>
    //     </>

    // );
};

export default FollowModal;