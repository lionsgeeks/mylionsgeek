import React, { useState } from 'react';

const tabs = [
  'attendance',
  'projects',
  'posts',
  'reservations',
  'training',
];

const ProfileMainContent = ({ sidebar, tabs: tabComponents }) => {
  const [selectedTab, setSelectedTab] = useState('attendance'); // Set attendance as default
  return (
    <div className="bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
          {/* Render actual sidebar */}
          <div className="space-y-6">{sidebar}</div>
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              {/* Tab Navigation */}
              <div className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
                <div className="w-full grid grid-cols-6 h-auto p-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSelectedTab(tab)}
                      className={`capitalize py-3 px-2 text-xs font-semibold rounded-lg transition-all ${selectedTab === tab
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
              <div className="p-6">
                {tabComponents && tabComponents[selectedTab]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileMainContent;
