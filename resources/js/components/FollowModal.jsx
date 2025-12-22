import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { helpers } from './utils/helpers';
import { Avatar } from '@/components/ui/avatar';
import { Link } from '@inertiajs/react';

const FollowModal = ({ openChange, onOpenChange, student }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('student?.followers');
    const { stopScrolling, addOrRemoveFollow } = helpers()
    useEffect(() => {
        stopScrolling(openChange[0])
    }, [])
    console.log(student?.following);

    // const toggleFollow = (studentId) => {
    //     setstudent?.followers(student?.followers.map(student =>
    //         student.id === studentId ? { ...student, following: !student.following } : student
    //     ));
    // };

    const displayList = activeTab === 'student?.followers' ? student?.followers : student?.following;

    if (!isOpen) return null;

    return (
        <>

            <div onClick={() => onOpenChange(false)} className="fixed inset-0 h-full z-30 bg-[var(--color-dark)]/50 dark:bg-[var(--color-beta)]/60 backdrop-blur-md transition-all duration-300"
            >
            </div>

            <div className="bg-white z-50 fixed inset-0 mx-auto top-1/2 -translate-y-1/2 rounded-2xl w-full max-w-md shadow-2xl flex flex-col h-[90vh]">
                {/* Header */}
                <div className="border-b border-gray-200 flex items-center justify-between p-4">
                    <div className="w-6"></div>
                    <h2 className="text-base font-semibold">{student?.name.toLowerCase()}</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X size={24} onClick={() => {
                            onOpenChange([false, 'hello'])
                            console.log(openChange);
                        }} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('student?.followers')}
                        className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${activeTab === 'student?.followers' ? 'text-gray-900' : 'text-gray-400'
                            }`}
                    >
                        {student?.followers?.length}
                        {activeTab === 'student?.followers' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('student?.following')}
                        className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${activeTab === 'student?.following' ? 'text-gray-900' : 'text-gray-400'
                            }`}
                    >
                        {student?.following?.length}
                        {activeTab === 'student?.following' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
                        )}
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-3 border-b border-gray-200">
                    <input
                        type="text"
                        placeholder="Search"
                        className="w-full bg-gray-100 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                    />
                </div>

                {/* student List */}
                <div className="flex-1 overflow-y-auto">
                    {displayList.map((user) => (
                        <div
                            key={user.id}
                            className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                        >
                            <Link href={`/user/${user?.id}`} className="flex items-center gap-3 flex-1 z-20">
                                <Avatar
                                    className="w-14 h-14 overflow-hidden ring-2 ring-[var(--color-light)] dark:ring-[var(--color-dark_gray)]"
                                    image={user?.image}
                                    name={user?.name}
                                    lastActivity={user?.last_online || null}
                                    onlineCircleClass="hidden"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {user.username}
                                    </p>
                                    <p className="text-sm text-gray-500 truncate">{user.name}</p>
                                </div>
                            </Link>

                            {activeTab === 'student?.followers' && (
                                <button
                                    onClick={() => addOrRemoveFollow(user?.id, user?.following)}
                                    className={`px-6 py-1.5 z-50 rounded-lg text-sm font-semibold transition-colors ${user.following
                                        ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                        }`}
                                >
                                    {user?.following ? 'student?.following' : 'Follow'}
                                </button>
                            )}

                            {activeTab === 'student?.following' && (
                                <button
                                    className="px-6 py-1.5 rounded-lg text-sm font-semibold bg-gray-200 text-gray-900 hover:bg-gray-300 transition-colors"
                                >
                                    following
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div >
        </>

    );
};

export default FollowModal;