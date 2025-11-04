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

export default function AdminUserProfile({
  user,
  assignedComputer,
  userProjects,
  collaborativeProjects,
  posts,
  reservations,
  trainings,
  absences,
  discipline,
  stats,
  roles,
}) {
  return (
    <AppLayout>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <ProfileHeader user={user} trainings={trainings} roles={roles} stats={stats} />
        <div className="bg-neutral-50 dark:bg-neutral-950">
          <div className="max-w-7xl mx-auto px-6">
            <ProfileStatsGrid user={user} />
            <ProfileMainContent
              sidebar={<ProfileSidebar user={user} assignedComputer={assignedComputer} />}
              tabs={{
                posts: <PostsTab posts={posts} user={user} />,
                attendance: <AttendanceTab absences={absences} discipline={discipline} />,
                projects: <ProjectsTab userProjects={userProjects} collaborativeProjects={collaborativeProjects} />,
                reservations: <ReservationsTab reservations={reservations} />,
                training: <TrainingTab trainings={trainings} />
              }}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}