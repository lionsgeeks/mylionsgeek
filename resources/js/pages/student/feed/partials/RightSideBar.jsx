import React from 'react';
import { TrendingUp } from 'lucide-react';


const RightSideBar = () => {
    return (
        <>
            {/* Right Sidebar - Fixed */}
            <div className="lg:col-span-3 space-y-4 sticky top-0 h-fit">
                {/* News Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">LinkedIn News</h3>
                        <TrendingUp className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="space-y-3">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
                                Tech Industry Updates
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">2d ago • 1,234 readers</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
                                Web Development Trends
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">5d ago • 890 readers</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
                                Job Market Insights
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">1w ago • 2,456 readers</p>
                        </div>
                    </div>
                </div>

                {/* Suggestions */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hidden lg:block">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">
                        Add to your feed
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                                DT
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Dr. Tech Insights</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Technology & Innovation</p>
                                <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium hover:border-gray-900 dark:hover:border-gray-400 transition-colors">
                                    + Follow
                                </button>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                                WD
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Web Dev Daily</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Web Development Tips</p>
                                <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium hover:border-gray-900 dark:hover:border-gray-400 transition-colors">
                                    + Follow
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RightSideBar;