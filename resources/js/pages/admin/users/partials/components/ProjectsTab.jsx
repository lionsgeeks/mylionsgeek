import React, { useMemo } from "react";
import { FolderKanban, Clock, CheckCircle2, ExternalLink } from 'lucide-react';
import TablePagination from "@/components/TablePagination";

export default function ProjectsTab({ 
  userProjects = { data: [], meta: {} }, 
  collaborativeProjects = { data: [], meta: {} } 
}) {
  const portfolioData = userProjects?.data || [];
  const portfolioMeta = userProjects?.meta || { current_page: 1, last_page: 1, per_page: 10, total: 0 };
  
  const collabData = collaborativeProjects?.data || [];
  const collabMeta = collaborativeProjects?.meta || { current_page: 1, last_page: 1, per_page: 10, total: 0 };

  // Calculate stats
  const stats = useMemo(() => {
    const total = portfolioMeta.total + collabMeta.total;
    const ongoing = collabData.filter(p => p.status === 'in_progress' || p.status === 'active').length;
    const completed = collabData.filter(p => p.status === 'completed' || p.status === 'done').length;
    
    return { total, ongoing, completed };
  }, [portfolioMeta.total, collabMeta.total, collabData]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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
              <div className="text-3xl font-bold text-[var(--color-dark)] dark:text-[var(--color-alpha)]">
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
              <div className="text-3xl font-bold text-[var(--color-dark)] dark:text-[var(--color-alpha)]">
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
              <div className="text-3xl font-bold text-[var(--color-good)] dark:text-[var(--color-good)]">
                {stats.completed}
              </div>
              <div className="text-sm font-semibold text-[var(--color-dark_gray)] dark:text-[var(--color-light)]">
                Completed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Projects Section */}
      {portfolioData.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">Portfolio Projects</h3>
          <div className="w-full overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
            <table className="min-w-full text-xs md:text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="p-3 text-left font-semibold">Project Title</th>
                  <th className="p-3 text-left font-semibold">Created</th>
                  <th className="p-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {portfolioData.map((project, index) => (
                  <tr key={project.id || index} className="hover:bg-neutral-50 dark:hover:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-800">
                    <td className="p-3 font-medium">{project.title || 'Untitled Project'}</td>
                    <td className="p-3">{formatDate(project.created_at)}</td>
                    <td className="p-3 flex gap-2">
                      {project.url && (
                        <a 
                          href={project.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-semibold hover:bg-blue-200 dark:hover:bg-blue-700 transition flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <TablePagination
              currentPage={portfolioMeta.current_page || 1}
              lastPage={portfolioMeta.last_page || 1}
              pageParam="userProjects_page"
            />
          </div>
        </div>
      )}

      {/* Collaborative Projects Section */}
      {collabData.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">Collaborative Projects</h3>
          <div className="w-full overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
            <table className="min-w-full text-xs md:text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="p-3 text-left font-semibold">Project Name</th>
                  <th className="p-3 text-left font-semibold">Created</th>
                  <th className="p-3 text-left font-semibold">Status</th>
                  <th className="p-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {collabData.map((project, index) => (
                  <tr key={project.id || index} className="hover:bg-neutral-50 dark:hover:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-800">
                    <td className="p-3 font-medium">{project.name || 'Untitled Project'}</td>
                    <td className="p-3">{formatDate(project.created_at)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        project.status === 'completed' || project.status === 'done' 
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : project.status === 'in_progress' || project.status === 'active'
                          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                      }`}>
                        {project.status || 'N/A'}
                      </span>
                    </td>
                    <td className="p-3 flex gap-2">
                      <button className="px-3 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-semibold hover:bg-blue-200 dark:hover:bg-blue-700 transition">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <TablePagination
              currentPage={collabMeta.current_page || 1}
              lastPage={collabMeta.last_page || 1}
              pageParam="collaborativeProjects_page"
            />
          </div>
        </div>
      )}

      {/* No Projects Message */}
      {portfolioData.length === 0 && collabData.length === 0 && (
        <div className="w-full overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
          <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
            No projects found
          </div>
        </div>
      )}
    </div>
  );
}
