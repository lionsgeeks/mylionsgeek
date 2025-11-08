import React from 'react';
import { MapPin, Phone, Mail, Calendar, Monitor, IdCard } from 'lucide-react';

const ProfileSidebar = ({ user, assignedComputer }) => {
  return (
    <div className="space-y-6">
      {/* About Card */}
      <div className="bg-white dark:bg-neutral-950/40 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="p-6 border-b border-yellow-400 dark:border-yellow-500">
          <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">About</h3>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {user?.about && user.about.trim() !== '' ? user.about : 'No about information available.'}
          </p>
          <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-yellow-500" />
              <span className="text-neutral-700 dark:text-neutral-200">{user?.phone && user.phone.trim() !== '' ? user.phone : 'No phone number provided'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <IdCard className="w-4 h-4 text-yellow-500" />
              <span className="text-neutral-700 dark:text-neutral-200">{user?.cin && user.cin.trim() !== '' ? user.cin : 'No CIN available'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-yellow-500" />
              <span className="text-neutral-700 dark:text-neutral-200">{user?.email && user.email.trim() !== '' ? user.email : 'No email available'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Computer */}
      {assignedComputer &&
        <div className="bg-white dark:bg-neutral-950/40 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <div className="p-6 border-b border-yellow-400 dark:border-yellow-500">
            <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">Assigned Computer</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-yellow-100 dark:bg-yellow-800/40">
                  <Monitor className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-neutral-800 dark:text-neutral-100">{assignedComputer.reference}</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">{assignedComputer.mark || '—'} • {assignedComputer.cpu || '—'} • {assignedComputer.gpu || '—'}</p>
                </div>
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-300 space-y-1 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <p><span className="font-medium">Assigned:</span> {assignedComputer.start || '—'}</p>
                {assignedComputer.end && (<p><span className="font-medium">Returned:</span> {assignedComputer.end}</p>)}
              </div>
            </div>

          </div>
        </div>}
    </div>
  );
};

export default ProfileSidebar;