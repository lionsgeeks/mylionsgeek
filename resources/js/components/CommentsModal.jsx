import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Avatar } from "@/components/ui/avatar";
import { Link, usePage } from "@inertiajs/react";
import { timeAgo } from '../lib/utils'
import DeleteModal from "./DeleteModal";

function CommentsModal({ postId, open, onClose, onCommentAdded, onCommentRemoved }) {
  //(postId);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [deletedCommentId, setDeletedCommentId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const commentsEndRef = useRef(null);
  const { auth } = usePage().props;

  // ✅ Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  // ✅ Fetch comments when modal opens
  useEffect(() => {
    if (open && postId) {
      setLoading(true);
      axios
        .get(`/posts/comments/${postId}`)
        .then((res) => {
          setComments(res.data.comments || []);
          setTimeout(
            () => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }),
            80
          );
        })
        .catch((err) => console.error("Failed to fetch comments:", err))
        .finally(() => setLoading(false));
    } else {
      // Reset when closed
      setComments([]);
      setNewComment("");
      setLoading(false);
    }
  }, [open, postId]);

  // ✅ Handle new comment submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);

    try {
      const res = await axios.post(`/posts/comments/${postId}`, {
        comment: newComment.trim(),
      });

      // Add new comment locally
      setComments((prev) => [...prev, res.data]);
      setNewComment("");

      // Notify parent (PostCard) to increment count
      if (typeof onCommentAdded === "function") {
        onCommentAdded(postId);
      }

      // Scroll to the new comment
      setTimeout(
        () => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        120
      );
    } catch (error) {
      console.error("Failed to add comment:", error);
      alert("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Handle comment deletion (optional)
  const handleDeleteComment = async (commentId) => {
    console.log(commentId);

    try {
      await axios.delete(`/posts/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));

      // Notify parent to decrement count
      if (typeof onCommentRemoved === "function") {
        onCommentRemoved(postId);
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert("Failed to delete comment");
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />

        {/* Modal container */}
        <div className="relative w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border border-alpha/30 dark:border-alpha/20 bg-white dark:bg-[#1b1d20] transition-all duration-300 flex flex-col max-h-[88vh] animate-in fade-in slide-in-from-bottom-4">

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close comments"
            className="absolute right-4 top-4 text-2xl text-alpha font-black opacity-80 hover:opacity-100 p-1 rounded-full transition focus:outline-none focus:ring-2 focus:ring-alpha/50 z-10"
          >
            ×
          </button>

          {/* Header */}
          <div className="px-6 pt-6 pb-3 border-b border-alpha/30 dark:border-alpha/30 bg-gradient-to-r from-alpha/10 to-alpha/20 text-center">
            <h2 className="text-lg sm:text-xl font-bold text-alpha tracking-wide uppercase">
              Comments
            </h2>
          </div>

          {/* Comments list */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-alpha/30 dark:scrollbar-thumb-alpha/20 scrollbar-track-transparent">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-alpha/30 border-t-alpha rounded-full animate-spin" />
                  <p className="text-sm text-alpha">Loading comments...</p>
                </div>
              </div>
            ) : comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-14 h-14 rounded-full bg-alpha/10 flex items-center justify-center mb-3">
                  <svg
                    className="w-7 h-7 text-alpha/70"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 italic">
                  No comments yet.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  Be the first to start the discussion!
                </p>
              </div>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2">
                  <Link href={`/admin/users/${c.user_id}`}>
                    <Avatar
                      className="w-11 h-11 flex-shrink-0"
                      image={c.user_image}
                      name={c.user_name}
                      width="w-11"
                      height="h-11"
                      lastActivity={c.user_lastActivity || null}
                      onlineCircleClass="hidden"
                    />
                  </Link>
                  <div className="flex-1 px-3 py-2.5 rounded-2xl border border-alpha/20 bg-neutral-50 dark:bg-dark shadow-sm hover:shadow-md transition duration-200">
                    <div className="flex items-center justify-between mb-1">
                      <Link
                        href={`/admin/users/${c.user_id}`}
                        className="font-bold text-white dark:text-yellow-300 text-sm truncate"
                      >
                        {c.user_name || "User"}
                      </Link>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {timeAgo(c.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-800 dark:text-neutral-100 leading-snug break-words">
                      {c.comment}
                    </p>

                    {/* Optional delete button (if user owns comment) */}
                    {auth.user.id === c.user_id && (
                      <button
                        onClick={() => {
                          setDeletedCommentId(c.id)
                          setOpenDelete(true)
                        }}
                        className="text-xs text-red-500 mt-1 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={commentsEndRef} />
          </div>

          {/* Comment input */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-alpha/20 bg-neutral-100/60 dark:bg-[#1b1d20] px-5 py-4 flex items-end gap-3"
          >
            <Avatar
              className="w-11 h-11 flex-shrink-0"
              image={auth.user.image}
              name={auth.name}
              width="w-11"
              height="h-11"
            />

            <div className="flex-1 flex gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={submitting}
                maxLength={2000}
                className="flex-1 px-4 py-2.5 rounded-full border border-alpha/40 focus:ring-2 focus:ring-alpha focus:border-alpha transition bg-white dark:bg-dark text-neutral-800 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm shadow-sm"
              />
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="bg-alpha text-black hover:bg-yellow-300 transition-all duration-200 px-5 font-semibold rounded-full shadow-md hover:shadow-lg py-2.5 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-alpha/50 active:scale-95"
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  "Send"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      {openDelete && <DeleteModal open={openDelete} onOpenChange={setOpenDelete} onConfirm={() => handleDeleteComment(deletedCommentId)} description="This action cannot be undone. This will permanently delete this Comment." title="Delete Comment" />}
    </>
  );
}

export default CommentsModal;
