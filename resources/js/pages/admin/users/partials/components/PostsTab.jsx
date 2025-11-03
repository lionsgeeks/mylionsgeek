import React from "react";
import { FileText, User, Calendar, ExternalLink, Heart, MessageCircle } from "lucide-react";
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

      {/* Redesigned Social Feed - Full width */}
      <div className="flex flex-col gap-8">
        {postsData.length === 0 ? (
          <div className="w-full overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
            <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
              No posts/notes found
            </div>
          </div>
        ) : (
          postsData.map((post, idx) => (
            <div key={post.id || idx} className="rounded-2xl bg-white dark:bg-neutral-900 shadow-lg border border-neutral-200 dark:border-neutral-700 w-full mx-auto max-w-2xl flex flex-col">
              {/* Image section (if any) */}
              {post.image && (
                <img src={post.image} alt="Post attachment" className="w-full object-cover max-h-96 rounded-t-xl" />
              )}
              {/* Post Content */}
              <div className="p-6 flex flex-col gap-2">
                <div className="text-xl font-medium text-gray-900 dark:text-white mb-1 break-words">
                  {post.note}
                </div>
                {post.link && (
                  <a href={post.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-700 font-semibold hover:underline mt-1">
                    <ExternalLink className="w-4 h-4" />
                    Post Link
                  </a>
                )}
                <div className="flex gap-4 items-center text-sm text-neutral-500 dark:text-neutral-400 pt-1">
                  <User className="w-4 h-4" />
                  <span className="mr-3">{post.author || 'Unknown'}</span>
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(post.created_at)}</span>
                </div>
              </div>
              {/* Post Actions Bar */}
              <div className="flex items-center justify-between px-6 pb-5 pt-1 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 rounded-b-xl">
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-1 text-pink-500 hover:text-pink-600 font-semibold text-sm group transition">
                    <Heart className="w-5 h-5 group-hover:scale-110 duration-150" fill="none" strokeWidth={2}/>
                    <span>{typeof post.likes_count === "number" ? post.likes_count : 0}</span>
                  </button>
                  <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-sm group transition">
                    <MessageCircle className="w-5 h-5 group-hover:scale-110 duration-150" strokeWidth={2}/>
                    <span>{typeof post.comments_count === "number" ? post.comments_count : 0}</span>
                  </button>
                </div>
                <span className="text-xs text-neutral-400">ID: {post.id}</span>
              </div>
            </div>
          ))
        )}
      </div>
      <TablePagination
        currentPage={meta.current_page || 1}
        lastPage={meta.last_page || 1}
        pageParam="posts_page"
      />
    </div>
  );
}
