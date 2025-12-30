import React, { useMemo } from "react";
import { FolderKanban, Clock, CheckCircle2, ExternalLink, Heart, MessageCircle, Eye, ArrowRight } from 'lucide-react';
import TablePagination from "@/components/TablePagination";
import { Link, router } from "@inertiajs/react";
import { useState } from 'react';

export default function ProjectsTab({ userProjects = { data: [], meta: {} }, collaborativeProjects = { data: [], meta: {} } }) {
  const portfolioData = userProjects?.data || [];
  const portfolioMeta = userProjects?.meta || { current_page: 1, last_page: 1, per_page: 10, total: 0 };

  const collabData = collaborativeProjects?.data || [];
  const collabMeta = collaborativeProjects?.meta || { current_page: 1, last_page: 1, per_page: 10, total: 0 };

  const [expandedProjectId, setExpandedProjectId] = useState(null);

  // Calculate stats
  const stats = useMemo(() => {
    const total = portfolioMeta.total + collabMeta.total;
    const ongoing = collabData.filter(p => p.status === 'in_progress' || p.status === 'active').length;
    const completed = collabData.filter(p => p.status === 'completed' || p.status === 'done').length;

    return { total, ongoing, completed };
  }, [portfolioMeta.total, collabMeta.total, collabData]);

  // Placeholder fetch - assume all notes are pulled in future update
  const getCommentsForProject = (project) => {
    return project.comments || [];
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Render project card function
  const renderProjectCard = (project, idx, type = 'portfolio') => {
    // Use project.image for portfolio, project.photo for collaborative
    const img = project.image || project.photo;
    const title = project.title || project.name;
    const link = project.url || project.link;
    const comments = getCommentsForProject(project);
    const commentsCount = Array.isArray(comments) ? comments.length : 0;

    // Handle click - redirect to project details for student projects
    const handleCardClick = (e) => {
      // Don't navigate if clicking on links
      if (e.target.closest('a')) {
        return;
      }

      // For portfolio (student) projects, redirect to details page
      if (type === 'portfolio' && project.id) {
        router.visit(`/student/project/${project.id}`);
      }
      // For collaborative projects, keep the expand/collapse behavior for now
      else if (type === 'collab') {
        setExpandedProjectId(expandedProjectId === project.id ? null : project.id);
      }
    };

    return (
      <div
        key={project.id || idx}
        className={`rounded-2xl bg-white dark:bg-neutral-900 shadow-lg border border-neutral-200 dark:border-neutral-700 w-full mx-auto max-w-2xl flex flex-col cursor-pointer transition hover:shadow-xl`}
        onClick={handleCardClick}
      >
        {img && <img src={`/storage/${img}`} alt={title} className="w-full object-cover max-h-50 rounded-t-xl" />}
        <div className="p-6 flex flex-col gap-2">
          <div className="text-xl font-bold text-gray-900 dark:text-white mb-1 break-words">{title}</div>
          <div className="flex gap-3 items-center text-sm text-neutral-500 dark:text-neutral-400 pt-1">
            <span>{formatDate(project.created_at)}</span>
            <span className="inline-block px-2 py-1 ml-3 rounded text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">{project.status || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            {type === 'portfolio' && project.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.visit(`/student/project/${project.id}`);
                }}
                className="flex items-center gap-1 text-[var(--color-alpha)] hover:underline font-semibold text-sm"
              >
                <Eye className="w-4 h-4" />
                View
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {link && (
              <a
                href={`/student/project/${project.id}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 dark:text-alpha text-beta font-semibold hover:underline"
              >
                <ExternalLink className="w-4 h-4" /> Project Link
              </a>
            )}
          </div>
        </div>
        {/* Inline comments section */}
        {expandedProjectId === project.id && commentsCount > 0 && (
          <div className="px-6 pb-5 pt-2 border-t border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 rounded-b-xl animate-fade-in">
            <div className="text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-2">Comments</div>
            <div className="flex flex-col gap-3">
              {comments.map((comment, cidx) => (
                <div key={cidx} className="bg-neutral-100 dark:bg-neutral-900 rounded-lg px-3 py-2 shadow-sm">
                  <div className="text-sm text-neutral-900 dark:text-white font-medium mb-1">{comment.author || 'Unknown'}</div>
                  <div className="text-neutral-700 dark:text-neutral-300 text-[15px]">{comment.content || comment.text || ''}</div>
                  <div className="text-xs text-neutral-400 mt-1">{formatDate(comment.created_at)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* If no comments, show nothing extra */}
      </div>
    );
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Stats Card */}
      <div className="rounded-2xl shadow-lg p-6 mb-2 backdrop-blur-sm transition-colors duration-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Projects */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-[var(--color-alpha)] to-yellow-400 dark:from-[var(--color-alpha)] dark:to-[var(--color-alpha)]">
              <FolderKanban className="w-7 h-7 text-[var(--color-dark)] dark:text-[var(--color-beta)]" />
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--color-dark)] dark:text-light">
                {stats.total}
              </div>
              <div className="text-sm font-semibold text-[var(--color-dark_gray)] dark:text-[var(--color-light)]">
                Total Projects
              </div>
            </div>
          </div>

          {/* Ongoing Projects */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-[var(--color-alpha)] to-yellow-400 dark:from-[var(--color-alpha)] dark:to-[var(--color-alpha)]">
              <Clock className="w-7 h-7 text-[var(--color-dark)] dark:text-[var(--color-beta)]" />
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--color-dark)] dark:text-light">
                {stats.ongoing}
              </div>
              <div className="text-sm font-semibold text-[var(--color-dark_gray)] dark:text-[var(--color-light)]">
                Ongoing
              </div>
            </div>
          </div>

          {/* Completed Projects */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-[var(--color-alpha)] to-yellow-400 dark:from-[var(--color-alpha)] dark:to-[var(--color-alpha)]">
              <CheckCircle2 className="w-7 h-7 text-[var(--color-dark)] dark:text-[var(--color-beta)]" />
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--color-dark)] dark:text-light">
                {stats.completed}
              </div>
              <div className="text-sm font-semibold text-[var(--color-dark_gray)] dark:text-[var(--color-light)]">
                Completed
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Redesigned Projects Feed (Portfolio and Collaborative) */}
      <div className={`${portfolioData.length === 0 && collabData.length === 0 ? "" : "grid grid-cols-2 gap-8" }`}>
        {portfolioData.map((project, idx) => renderProjectCard(project, idx, 'portfolio'))}
        {collabData.map((project, idx) => renderProjectCard(project, idx, 'collab'))}
        {/* No Projects Message */}
        {portfolioData.length === 0 && collabData.length === 0 && (
          <div className="w-full overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
            <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
              No projects found
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
