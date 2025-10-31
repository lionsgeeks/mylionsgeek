import React from 'react';
import AppLayout from '@/layouts/app-layout';
import ProfileHeader from './partials/components/ProfileHeader';
import ProfileStatsGrid from './partials/components/ProfileState';
import ProfileSidebar from './partials/components/ProfileSideBar';
import ProfileMainContent from './partials/components/ProfileMainContent';
import AttendanceTab from './partials/components/ActivityTab';
import ProjectsTab from './partials/components/ProjectsTab';
import PostsTab from './partials/components/PostsTab';
import ReservationsTab from './partials/components/ReservationsTab';
import TrainingTab from './partials/components/TrainingTab';

export default function AdminUserProfile({ user, assignedComputer, ...props }) {
  return (
      <AppLayout>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <ProfileHeader user={user} />
        <div className="bg-neutral-50 dark:bg-neutral-950">
            <div className="max-w-7xl mx-auto px-6">
            <ProfileStatsGrid user={user} />
            <ProfileMainContent
              sidebar={<ProfileSidebar user={user} assignedComputer={assignedComputer} />}
              tabs={{
                attendance: <AttendanceTab />, 
                projects: <ProjectsTab />, 
                posts: <PostsTab />, 
                reservations: <ReservationsTab />, 
                training: <TrainingTab />
              }}
                                />
                              </div>
                            </div>
                          </div>
      </AppLayout>
  );
}