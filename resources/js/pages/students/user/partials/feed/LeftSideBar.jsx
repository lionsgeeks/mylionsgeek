import React from 'react';
import { Calendar, Users, BookOpen, Hash } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Link } from '@inertiajs/react';


const LeftSideBar = ({ user }) => {
    ////console.log(user);
    const getField = (user) => {
        if (user?.formation?.name?.toLowerCase().includes('creator')) {
            return 'Content Creator'
        }
        return 'Web Developer'
    }

    return (
        <>
            {/* Left Sidebar - Fixed */}
            <div className="lg:col-span-3  h-fit sticky top-0 space-y-4">
                {/* Profile Card */}
                <div className="bg-white dark:bg-dark_gray rounded-lg  overflow-hidden">
                    <div className="h-16 dark:bg-light bg-dark">
                        <img src={`/storage/${user.cover}`} alt={user.name} className="w-full h-full object-cover bg" />
                    </div>
                    <div className="px-4 pb-4">
                        <div className="relative -mt-8 mb-4">
                            <Link href={'/students/' + user.id}>
                                <Avatar
                                    className="w-20 h-20 rounded-full overflow-hidden"
                                    image={user?.image}
                                    name={user?.name}
                                    lastActivity={user?.last_online || null}
                                    onlineCircleClass="hidden"
                                />
                            </Link>
                        </div>
                        <Link href={'/students/' + user.id}>
                            <h3 className="font-semibold text-gray-900 dark:text-light text-sm">
                                {user?.name}
                            </h3>
                        </Link>
                        <p className="text-xs text-dark dark:text-light mt-1">
                            {getField(user)}
                        </p>
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#2e3235]">
                            <div className="flex justify-between text-xs mb-2">
                                <span className=" text-dark dark:text-light">Profile viewers</span>
                                <span className=" text-dark dark:text-alpha font-semibold">24</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className=" text-dark dark:text-light">Post impressions</span>
                                <span className=" text-dark dark:text-alpha font-semibold">87</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="bg-white dark:bg-dark_gray shadow-background rounded-lg shadow-xl p-4 hidden lg:block">
                    <div className="space-y-3">
                        <a href="#" className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 hover:text-alpha dark:hover:text-alpha">
                            <BookOpen className="w-4 h-4" />
                            <span>Saved items</span>
                        </a>
                        <a href="#" className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 hover:text-alpha dark:hover:text-alpha">
                            <Users className="w-4 h-4" />
                            <span>Groups</span>
                        </a>
                        <a href="#" className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 hover:text-alpha dark:hover:text-alpha">
                            <Calendar className="w-4 h-4" />
                            <span>Events</span>
                        </a>
                        <a href="#" className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 hover:text-alpha dark:hover:text-alpha">
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