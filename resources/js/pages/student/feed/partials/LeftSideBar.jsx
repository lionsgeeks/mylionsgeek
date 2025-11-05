import React from 'react';
import { Calendar, Users, BookOpen, Hash } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';


const LeftSideBar = ({ user }) => {
    console.log(user);
    
    return (
        <>
            {/* Left Sidebar - Fixed */}
            <div className="lg:col-span-3 space-y-4">
                {/* Profile Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="h-16 bg-gradient-to-r from-blue-600 to-blue-400"></div>
                    <div className="px-4 pb-4">
                        <div className="relative -mt-8 mb-4">
                            <Avatar
                                className="w-16 h-16 rounded-full overflow-hidden "
                                image={user?.image}
                                name={user?.name}
                                lastActivity={user?.last_online || null}
                                onlineCircleClass="hidden"
                            />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {user?.name}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {user?.formation?.name}
                        </p>
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between text-xs mb-2">
                                <span className="text-gray-600 dark:text-gray-400">Profile viewers</span>
                                <span className="text-blue-600 dark:text-blue-400 font-semibold">24</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-600 dark:text-gray-400">Post impressions</span>
                                <span className="text-blue-600 dark:text-blue-400 font-semibold">87</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hidden lg:block">
                    <div className="space-y-3">
                        <a href="#" className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                            <BookOpen className="w-4 h-4" />
                            <span>Saved items</span>
                        </a>
                        <a href="#" className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                            <Users className="w-4 h-4" />
                            <span>Groups</span>
                        </a>
                        <a href="#" className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                            <Calendar className="w-4 h-4" />
                            <span>Events</span>
                        </a>
                        <a href="#" className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                            <Hash className="w-4 h-4" />
                            <span>Hashtags</span>
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LeftSideBar;