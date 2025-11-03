import React from 'react';
import { Trophy, Code, MessageCircle, Briefcase } from 'lucide-react';

const ProfileStatsGrid = ({ user }) => {
  // Fallback/example props: fallback to ?/- if value not present
  const globalRank = user?.global_rank ?? '0';
  const codingHours = user?.coding_hours ?? '0';
  const projects = user?.projects_count ?? '0';
  const posts = user?.posts_count ?? '0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 transition-colors duration-300">
      {/* Global Rank Card */}
      <div className="bg-[var(--color-light)] dark:bg-[var(--color-dark_gray)] rounded-xl shadow-xl p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[var(--color-alpha)]">
          <Trophy className="w-7 h-7 text-[var(--color-dark)] dark:text-[var(--color-beta)]" />
        </div>
        <div>
          <div className="text-3xl font-bold text-[var(--color-alpha)]">#{globalRank}</div>
          <div className="text-md font-medium text-[var(--color-dark_gray)] dark:text-[var(--color-light)]">Global Rank</div>
        </div>
      </div>

      {/* Coding Hours Card */}
      <div className="bg-[var(--color-light)] dark:bg-[var(--color-dark_gray)] rounded-xl shadow-xl p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[var(--color-alpha)]">
          <Code className="w-7 h-7 text-[var(--color-dark)] dark:text-[var(--color-beta)]" />
        </div>
        <div>
          <div className="text-3xl font-bold text-[var(--color-alpha)]">{codingHours}h</div>
          <div className="text-md font-medium text-[var(--color-dark_gray)] dark:text-[var(--color-light)]">Coding Hours</div>
        </div>
      </div>

      {/* Posts Card */}
      <div className="bg-[var(--color-light)] dark:bg-[var(--color-dark_gray)] rounded-xl shadow-xl p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[var(--color-alpha)]">
          <MessageCircle className="w-7 h-7 text-[var(--color-dark)] dark:text-[var(--color-beta)]" />
        </div>
        <div>
          <div className="text-3xl font-bold text-[var(--color-alpha)]">{posts}</div>
          <div className="text-md font-medium text-[var(--color-dark_gray)] dark:text-[var(--color-light)]">Posts</div>
        </div>
      </div>

      {/* Projects Card */}
      <div className="bg-[var(--color-light)] dark:bg-[var(--color-dark_gray)] rounded-xl shadow-xl p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[var(--color-alpha)]">
          <Briefcase className="w-7 h-7 text-[var(--color-dark)] dark:text-[var(--color-beta)]" />
        </div>
        <div>
          <div className="text-3xl font-bold text-[var(--color-alpha)]">{projects}</div>
          <div className="text-md font-medium text-[var(--color-dark_gray)] dark:text-[var(--color-light)]">Projects</div>
        </div>
      </div>
    </div>

  );
};

export default ProfileStatsGrid;
