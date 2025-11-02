import React from "react";
import { FileText, User, Calendar } from "lucide-react";
import TablePagination from "@/components/TablePagination";

export default function PostsTab({ posts = { data: [], meta: {} } }) {
  
  const postsData = posts?.data || [];
  const meta = posts?.meta || { current_page: 1, last_page: 1, per_page: 10, total: 0 };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Truncate text helper
  const truncateText = (text, maxLength = 50) => {
    if (!text) return 'N/A';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Stats Card - Matching Projects Tab Style */}
      <div className="rounded-2xl shadow-lg p-6 mb-2 backdrop-blur-sm transition-colors duration-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {/* Total Posts */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-[var(--color-alpha)] to-yellow-400 dark:from-[var(--color-alpha)] dark:to-[var(--color-alpha)]">
              <FileText className="w-7 h-7 text-[var(--color-dark)] dark:text-[var(--color-beta)]" />
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--color-dark)] dark:text-[var(--color-alpha)]">
                {meta.total || 0}
              </div>
              <div className="text-sm font-semibold text-[var(--color-dark_gray)] dark:text-[var(--color-light)]">
                Total Posts/Notes
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Posts Table */}
      <div className="w-full overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
        {postsData.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
            No posts/notes found
          </div>
        ) : (
          <>
            <table className="min-w-full text-xs md:text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="p-3 text-left font-semibold">Content</th>
                  <th className="p-3 text-left font-semibold">Author</th>
                  <th className="p-3 text-left font-semibold">Date</th>
                  <th className="p-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {postsData.map((post, index) => (
                  <tr key={post.id || index} className="hover:bg-neutral-50 dark:hover:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-800">
                    <td className="p-3 font-medium max-w-md">
                      <div className="truncate" title={post.note}>
                        {truncateText(post.note, 80)}
                      </div>
                    </td>
                    <td className="p-3 flex items-center gap-2">
                      <User className="w-4 h-4 text-neutral-500" />
                      <span>{post.author || 'Unknown'}</span>
                    </td>
                    <td className="p-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-neutral-500" />
                      <span>{formatDate(post.created_at)}</span>
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
            
            {/* Pagination */}
            <TablePagination
              currentPage={meta.current_page || 1}
              lastPage={meta.last_page || 1}
              pageParam="posts_page"
            />
          </>
        )}
      </div>
    </div>
  );
}
