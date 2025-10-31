import React from 'react';
import { Trophy, Code, MessageCircle, Briefcase } from 'lucide-react';

const ProfileStatsGrid = ({ user }) => {
  // Fallback/example props: fallback to ?/- if value not present
  const globalRank = user?.global_rank ?? '?';
  const globalRankPercent = user?.global_rank_percent ?? '—';
  const codingHours = user?.coding_hours ?? '-';
  const projects = user?.projects_count ?? '-';
  const posts = user?.posts_count ?? '-';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
      {/* Global Rank Card */}
      <div className="bg-neutral-900 rounded-xl shadow-lg p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-yellow-700">
          <Trophy className="w-7 h-7 text-yellow-400" />
        </div>
        <div>
          <div className="text-3xl font-bold text-yellow-400">#{globalRank}</div>
          <div className="text-md font-medium text-white">Global Rank</div>
          <div className="text-xs text-green-400 mt-1">{globalRankPercent !== '—' ? `Top ${globalRankPercent}%` : ''}</div>
        </div>
      </div>
      {/* Coding Hours Card */}
      <div className="bg-neutral-900 rounded-xl shadow-lg p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-yellow-700">
          <Code className="w-7 h-7 text-yellow-400" />
        </div>
        <div>
          <div className="text-3xl font-bold text-yellow-400">{codingHours}h</div>
          <div className="text-md font-medium text-white">Coding Hours</div>
        </div>
      </div>
      {/* Posts Card */}
      <div className="bg-neutral-900 rounded-xl shadow-lg p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-800">
          <MessageCircle className="w-7 h-7 text-green-400" />
        </div>
        <div>
          <div className="text-3xl font-bold text-green-400">{posts}</div>
          <div className="text-md font-medium text-white">Posts</div>
        </div>
      </div>
      {/* Projects Card */}
      <div className="bg-neutral-900 rounded-xl shadow-lg p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-800">
          <Briefcase className="w-7 h-7 text-blue-400" />
        </div>
        <div>
          <div className="text-3xl font-bold text-blue-400">{projects}</div>
          <div className="text-md font-medium text-white">Projects</div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStatsGrid;
