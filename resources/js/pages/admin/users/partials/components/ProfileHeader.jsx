import React from 'react';
import { Github, Linkedin, Twitter, Globe } from 'lucide-react';

const ProfileHeader = ({ user }) => {
  const onlineColor = user?.is_online ? 'bg-green-500' : 'bg-neutral-500';
  const lastOnline = user?.last_online ? new Date(user.last_online).toLocaleString() : '—';

  return (
    <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
      <div className="max-w-7xl mx-auto">
        {/* Cover Photo Area */}
        <div className="relative h-96 overflow-hidden">
          {user.cover ? (
            <img
              src={user.cover.startsWith('http') ? user.cover : `/storage/img/cover/${user.cover}`}
              alt="Cover"
              className="object-cover w-full h-full"
              style={{ minHeight: 220 }}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-neutral-700 to-neutral-900" />
          )}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-blue-500 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500 blur-3xl"></div>
          </div>
        </div>
        {/* Profile Information Section */}
        <div className="px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 -mt-8 pb-4">
            {/* Profile Picture and User Details */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-40 h-40 rounded-full bg-white dark:bg-neutral-900 p-2 shadow-xl border-4 border-white dark:border-neutral-900">
                  {user.image ? (
                    <img
                      src={user.image.startsWith('http') ? user.image : `/storage/img/profile/${user.image}`}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full flex items-center justify-center text-5xl font-bold text-white bg-neutral-800 dark:bg-neutral-700">
                      {user.name?.split(' ').map(n => n[0]?.toUpperCase()).join('').substring(0, 2) || '?'}
                    </div>
                  )}
                </div>
                {/* Online badge */}
                <span className={`absolute bottom-3 right-3 w-4 h-4 rounded-full ring-2 ring-white dark:ring-neutral-900 ${onlineColor}`} />
              </div>
              {/* Name + meta */}
              <div className="pb-2">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-4xl font-bold text-neutral-800 dark:text-neutral-100">{user.name}</h1>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                  {user.formation_name && <span className="font-medium">{user.formation_name}</span>}
                  {user.status && <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-xs">{user.status}</span>}
                  <span className="text-xs">Last online: {lastOnline}</span>
                </div>
                {/* Socials (conditional) */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {user.github && (
                    <a href={user.github} target="_blank" rel="noreferrer" className="px-3 py-1 rounded-md text-xs font-semibold bg-yellow-50 dark:bg-yellow-900/10 text-neutral-800 dark:text-neutral-100 inline-flex items-center gap-1"><Github className="w-4 h-4" /> GitHub</a>
                  )}
                  {user.linkedin && (
                    <a href={user.linkedin} target="_blank" rel="noreferrer" className="px-3 py-1 rounded-md text-xs font-semibold bg-yellow-50 dark:bg-yellow-900/10 text-neutral-800 dark:text-neutral-100 inline-flex items-center gap-1"><Linkedin className="w-4 h-4" /> LinkedIn</a>
                  )}
                  {user.twitter && (
                    <a href={user.twitter} target="_blank" rel="noreferrer" className="px-3 py-1 rounded-md text-xs font-semibold bg-yellow-50 dark:bg-yellow-900/10 text-neutral-800 dark:text-neutral-100 inline-flex items-center gap-1"><Twitter className="w-4 h-4" /> Twitter</a>
                  )}
                  {user.website && (
                    <a href={user.website} target="_blank" rel="noreferrer" className="px-3 py-1 rounded-md text-xs font-semibold bg-yellow-50 dark:bg-yellow-900/10 text-neutral-800 dark:text-neutral-100 inline-flex items-center gap-1"><Globe className="w-4 h-4" /> Website</a>
                  )}
                </div>
              </div>
            </div>
            {/* Right Side - Edit Profile Only */}
            <div className="flex gap-2 pb-2">
              <button className="px-5 py-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-100 rounded-lg text-sm font-semibold transition-all flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
