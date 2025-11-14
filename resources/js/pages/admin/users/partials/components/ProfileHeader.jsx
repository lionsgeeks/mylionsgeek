import React, { useState } from 'react';
import { Github, Linkedin, Twitter, Globe, Edit3, Calendar, ImagePlus } from 'lucide-react';
import { useInitials } from '@/hooks/use-initials';
import { Avatar, } from '@/components/ui/avatar';
import EditUserModal from '../EditModal';
import { Camera } from 'lucide-react'; // Icon for changing the cover image
import { router } from '@inertiajs/react';

const ProfileHeader = ({ user, trainings, roles, stats }) => {
  const [open, setOpen] = useState(false)
  const onlineColor = user?.is_online ? 'bg-green-500' : 'bg-neutral-500';
  const lastOnline = user?.last_online ? new Date(user.last_online).toLocaleString() : 'No last activity available';
  const socials = user?.socials || {};


  const changeCover = (event, userId) => {
    const file = event.target.files[0]; // Get the first file
    if (!file) return; // If no file is selected, don't proceed

    const formData = new FormData();
    formData.append('cover', file); // Append the selected file to FormData

    // Send the POST request with the form data
    router.post(`/users/changeCover/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',  // Make sure the request is sent as multipart
      },
      onSuccess: () => {
        //('Cover changed successfully');
      },
      onError: (error) => {
        //('Cover not changed', error);
      }
    });
  };

  return (
    <>
      <div className="bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
        <div className="max-w-6xl mx-auto">
          {/* Cover Photo with Overlay Pattern */}
          <div className="relative h-64 md:h-80 overflow-hidden">
            <img
              src={`/storage/${user.cover}`}
              alt="Cover"
              className="object-cover w-full h-full"
            />
            {/* Mesh gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Change Cover Icon */}
            <label
              className="absolute top-5 right-5 flex items-center justify-center w-12 h-12 bg-dark_gray rounded-full"
              aria-label="Change cover image"
            >
              <Camera size={24} className="text-white cursor-pointer" />
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => changeCover(e, user.id)}
              />
            </label>
          </div>

          {/* Profile Content */}
          <div className="px-6 md:px-8 pb-8">
            <div className="relative -mt-20 md:-mt-10">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                {/* Profile Picture */}
                <div className="relative border-5 border-dark_gray flex-shrink-0 w-36 h-36 md:w-44 md:h-44 rounded-full bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden">
                  <Avatar
                    className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden ring-4 ring-alpha/20"
                    image={user.image}
                    name={user?.name}
                    lastActivity={user?.last_online || null}
                    onlineCircleClass="hidden" // hide the built-in circle since we’re using a custom one
                  />

                  {/* Custom status indicator with pulse */}
                  {/* <span className="absolute bottom-2 right-2 flex items-center justify-center z-20">
                    <span
                      className={`absolute w-5 h-5 ${onlineColor} rounded-full animate-ping opacity-75`}
                    />
                    <span
                      className={`relative w-5 h-5 ${onlineColor} rounded-full ring-4 ring-white dark:ring-neutral-900`}
                    />
                  </span> */}
                </div>


                {/* User Info */}
                <div className="flex-1 flex flex-col justify-end space-y-4">
                  {/* Name and Training */}
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">
                      {user.name || '—'}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300">
                        {user.formation_name || 'No training assigned'}
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-alpha text-black">
                        {user.status || 'No status'}
                      </span>
                    </div>
                  </div>

                  {/* Bottom row: Last seen & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Last online */}
                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <Calendar className="w-4 h-4" />
                      <span>Last online: {lastOnline}</span>
                    </div>

                    {/* Social links & Edit button */}
                    <div className="flex items-center gap-3">
                      {/* Social icons */}
                      <div className="flex items-center gap-2">
                        {socials.github && (
                          <a
                            href={socials.github}
                            target="_blank"
                            rel="noreferrer"
                            className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-300 transition-all hover:scale-110"
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                        {socials.linkedin && (
                          <a
                            href={socials.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-300 transition-all hover:scale-110"
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                        {socials.twitter && (
                          <a
                            href={socials.twitter}
                            target="_blank"
                            rel="noreferrer"
                            className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-300 transition-all hover:scale-110"
                          >
                            <Twitter className="w-4 h-4" />
                          </a>
                        )}
                        {socials.website && (
                          <a
                            href={socials.website}
                            target="_blank"
                            rel="noreferrer"
                            className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-300 transition-all hover:scale-110"
                          >
                            <Globe className="w-4 h-4" />
                          </a>
                        )}
                      </div>

                      {/* Divider */}
                      {(socials.github || socials.linkedin || socials.twitter || socials.website) && (
                        <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-700" />
                      )}

                      {/* Edit button */}
                      <button onClick={() => setOpen(true)} className="px-4 py-2 bg-alpha text-beta rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl">
                        <Edit3 className="w-4 h-4" />
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EditUserModal
        open={!!open}
        onClose={() => setOpen(false)}
        editedUser={user}
        roles={roles}
        status={stats}
        trainings={trainings}
      />
    </>
  );
};

export default ProfileHeader;
