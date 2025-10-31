import React from 'react';
import { MapPin, Phone, Mail, Calendar, Monitor } from 'lucide-react';

const ProfileSidebar = ({ user, assignedComputer }) => {
  return (
    <div className="space-y-6">
      {/* About Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="p-6 border-b border-yellow-400 dark:border-yellow-500">
          <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">About</h3>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {user?.about || '—'}
          </p>
          <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            {user?.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-yellow-500" />
                <span className="text-neutral-700 dark:text-neutral-200">{user.phone}</span>
              </div>
            )}
            {user?.cin && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-yellow-500" />
                <span className="text-neutral-700 dark:text-neutral-200">{user.cin}</span>
              </div>
            )}
            {user?.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-yellow-500" />
                <span className="text-neutral-700 dark:text-neutral-200">{user.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assigned Computer */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="p-6 border-b border-yellow-400 dark:border-yellow-500">
          <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">Assigned Computer</h3>
        </div>
        <div className="p-6 space-y-4">
          {assignedComputer ? (
            <div className="space-y-2">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-yellow-100 dark:bg-yellow-800/40">
                  <Monitor className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-neutral-800 dark:text-neutral-100">{assignedComputer.reference}</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">{assignedComputer.mark} • {assignedComputer.cpu} • {assignedComputer.gpu}</p>
                </div>
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-300 space-y-1 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                {assignedComputer.start && (<p><span className="font-medium">Assigned:</span> {assignedComputer.start}</p>)}
                {assignedComputer.end && (<p><span className="font-medium">Returned:</span> {assignedComputer.end}</p>)}
              </div>
            </div>
          ) : (
            <div className="text-sm text-neutral-600 dark:text-neutral-300">No computer assigned.</div>
          )}
        </div>
      </div>

      {/* Achievements Card (optional/demo) */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="p-6 border-b border-yellow-400 dark:border-yellow-500">
          <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">Achievements</h3>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            <span className="px-4 py-2 rounded-lg text-xs font-bold text-white shadow-md bg-neutral-800 dark:bg-yellow-700">🏆 Top Performer</span>
            <span className="px-4 py-2 rounded-lg text-xs font-bold text-white shadow-md bg-neutral-800 dark:bg-yellow-700">🏆 100 Projects</span>
            <span className="px-4 py-2 rounded-lg text-xs font-bold text-white shadow-md bg-neutral-800 dark:bg-yellow-700">🏆 MVP Award</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;