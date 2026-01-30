import { useState } from 'react';

const tabs = ['posts', 'attendance', 'projects', 'reservations', 'training'];

const ProfileMainContent = ({ sidebar, tabs: tabComponents }) => {
    const [selectedTab, setSelectedTab] = useState('posts'); // Set attendance as default
    return (
        <div className="bg-neutral-50 dark:bg-dark">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid grid-cols-1 gap-6 pb-12 lg:grid-cols-3">
                    {/* Render actual sidebar */}
                    <div className="space-y-6">{sidebar}</div>
                    {/* Main Content Area */}
                    <div className="lg:col-span-2">
                        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
                            {/* Tab Navigation */}
                            <div className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900">
                                <div className="grid h-auto w-full grid-cols-6 p-2">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setSelectedTab(tab)}
                                            className={`rounded-lg px-2 py-3 text-xs font-semibold capitalize transition-all ${
                                                selectedTab === tab
                                                    ? 'bg-yellow-400 text-neutral-800 shadow-md dark:bg-yellow-500 dark:text-neutral-900'
                                                    : 'bg-transparent text-neutral-500 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                                            }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* Tab Content */}
                            <div className="p-6">{tabComponents && tabComponents[selectedTab]}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileMainContent;
