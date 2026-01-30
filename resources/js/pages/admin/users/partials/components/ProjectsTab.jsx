import { router } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Clock, ExternalLink, Eye, FolderKanban } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function ProjectsTab({ userProjects = { data: [], meta: {} }, collaborativeProjects = { data: [], meta: {} } }) {
    const portfolioData = userProjects?.data || [];
    const portfolioMeta = userProjects?.meta || { current_page: 1, last_page: 1, per_page: 10, total: 0 };

    const collabData = collaborativeProjects?.data || [];
    const collabMeta = collaborativeProjects?.meta || { current_page: 1, last_page: 1, per_page: 10, total: 0 };

    const [expandedProjectId, setExpandedProjectId] = useState(null);

    // Calculate stats
    const stats = useMemo(() => {
        const total = portfolioMeta.total + collabMeta.total;
        const ongoing = collabData.filter((p) => p.status === 'in_progress' || p.status === 'active').length;
        const completed = collabData.filter((p) => p.status === 'completed' || p.status === 'done').length;

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
                router.visit(`/students/project/${project.id}`);
            }
            // For collaborative projects, keep the expand/collapse behavior for now
            else if (type === 'collab') {
                setExpandedProjectId(expandedProjectId === project.id ? null : project.id);
            }
        };

        return (
            <div
                key={project.id || idx}
                className={`mx-auto flex w-full max-w-2xl cursor-pointer flex-col rounded-2xl border border-neutral-200 bg-white shadow-lg transition hover:shadow-xl dark:border-neutral-700 dark:bg-neutral-900`}
                onClick={handleCardClick}
            >
                {img && <img src={`/storage/${img}`} alt={title} className="max-h-50 w-full rounded-t-xl object-cover" />}
                <div className="flex flex-col gap-2 p-6">
                    <div className="mb-1 text-xl font-bold break-words text-gray-900 dark:text-white">{title}</div>
                    <div className="flex items-center gap-3 pt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        <span>{formatDate(project.created_at)}</span>
                        <span className="ml-3 inline-block rounded bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                            {project.status || 'N/A'}
                        </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                        {type === 'portfolio' && project.id && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.visit(`/students/project/${project.id}`);
                                }}
                                className="flex items-center gap-1 text-sm font-semibold text-[var(--color-alpha)] hover:underline"
                            >
                                <Eye className="h-4 w-4" />
                                View
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        )}
                        {link && (
                            <a
                                href={`/students/project/${project.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-2 font-semibold text-beta hover:underline dark:text-alpha"
                            >
                                <ExternalLink className="h-4 w-4" /> Project Link
                            </a>
                        )}
                    </div>
                </div>
                {/* Inline comments section */}
                {expandedProjectId === project.id && commentsCount > 0 && (
                    <div className="animate-fade-in rounded-b-xl border-t border-b border-neutral-100 bg-neutral-50 px-6 pt-2 pb-5 dark:border-neutral-800 dark:bg-neutral-800">
                        <div className="mb-2 text-base font-semibold text-neutral-700 dark:text-neutral-200">Comments</div>
                        <div className="flex flex-col gap-3">
                            {comments.map((comment, cidx) => (
                                <div key={cidx} className="rounded-lg bg-neutral-100 px-3 py-2 shadow-sm dark:bg-neutral-900">
                                    <div className="mb-1 text-sm font-medium text-neutral-900 dark:text-white">{comment.author || 'Unknown'}</div>
                                    <div className="text-[15px] text-neutral-700 dark:text-neutral-300">{comment.content || comment.text || ''}</div>
                                    <div className="mt-1 text-xs text-neutral-400">{formatDate(comment.created_at)}</div>
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
            <div className="mb-2 rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg backdrop-blur-sm transition-colors duration-300 dark:border-neutral-700 dark:bg-neutral-900">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Total Projects */}
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-alpha)] to-yellow-400 shadow-lg dark:from-[var(--color-alpha)] dark:to-[var(--color-alpha)]">
                            <FolderKanban className="h-7 w-7 text-[var(--color-dark)] dark:text-[var(--color-beta)]" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-[var(--color-dark)] dark:text-light">{stats.total}</div>
                            <div className="text-sm font-semibold text-[var(--color-dark_gray)] dark:text-[var(--color-light)]">Total Projects</div>
                        </div>
                    </div>

                    {/* Ongoing Projects */}
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-alpha)] to-yellow-400 shadow-lg dark:from-[var(--color-alpha)] dark:to-[var(--color-alpha)]">
                            <Clock className="h-7 w-7 text-[var(--color-dark)] dark:text-[var(--color-beta)]" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-[var(--color-dark)] dark:text-light">{stats.ongoing}</div>
                            <div className="text-sm font-semibold text-[var(--color-dark_gray)] dark:text-[var(--color-light)]">Ongoing</div>
                        </div>
                    </div>

                    {/* Completed Projects */}
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-alpha)] to-yellow-400 shadow-lg dark:from-[var(--color-alpha)] dark:to-[var(--color-alpha)]">
                            <CheckCircle2 className="h-7 w-7 text-[var(--color-dark)] dark:text-[var(--color-beta)]" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-[var(--color-dark)] dark:text-light">{stats.completed}</div>
                            <div className="text-sm font-semibold text-[var(--color-dark_gray)] dark:text-[var(--color-light)]">Completed</div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Redesigned Projects Feed (Portfolio and Collaborative) */}
            <div className={`${portfolioData.length === 0 && collabData.length === 0 ? '' : 'grid grid-cols-2 gap-8'}`}>
                {portfolioData.map((project, idx) => renderProjectCard(project, idx, 'portfolio'))}
                {collabData.map((project, idx) => renderProjectCard(project, idx, 'collab'))}
                {/* No Projects Message */}
                {portfolioData.length === 0 && collabData.length === 0 && (
                    <div className="w-full overflow-x-auto rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
                        <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">No projects found</div>
                    </div>
                )}
            </div>
        </div>
    );
}
