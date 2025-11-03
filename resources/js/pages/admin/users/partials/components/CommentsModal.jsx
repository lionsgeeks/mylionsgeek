import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useInitials } from '@/hooks/use-initials';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePage } from "@inertiajs/react";

function CommentsModal({ postId, open, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const commentsEndRef = useRef(null);
  const getInitials = useInitials();
  const { auth } = usePage().props

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = originalOverflow; };
    }
  }, [open]);

  useEffect(() => {
    if (open && postId) {
      setLoading(true);
      axios.get(`/admin/users/post/${postId}/comments`)
        .then(res => {
          setComments(res.data.comments);
          setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
        })
        .finally(() => setLoading(false));
    } else {
      setComments([]);
      setNewComment("");
      setLoading(false);
    }
  }, [open, postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`/admin/users/post/${postId}/comments`, {
        comment: newComment.trim(),
      });
      setComments(prev => [...prev, res.data]);
      setNewComment("");
      setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 120);
    } catch {
      alert("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Modal overlay */}
      <div className="absolute inset-0 bg-black/50 transition-opacity backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl border-2 border-alpha bg-light dark:bg-dark_gray animate-slide-in-right transition-all duration-300 flex flex-col max-h-[88vh]">
        {/* Close button */}
        <button onClick={onClose} aria-label="Close comments" className="absolute right-3 top-3 text-2xl text-beta dark:text-alpha font-black opacity-80 hover:opacity-100 p-1 rounded-full transition bg-alpha/10 dark:bg-alpha/20 focus:outline-none focus:ring focus:ring-alpha z-10">
          ×
        </button>
        <div className="flex flex-col h-full px-3 pt-5 pb-4">
          <h2 className="text-lg sm:text-xl font-bold text-beta dark:text-alpha text-center pb-2 mb-2 border-b border-alpha/20 dark:border-alpha/30 tracking-wide uppercase">Comments</h2>
          <div className="flex-1 min-h-[110px] max-h-[60vh] sm:max-h-[70vh] overflow-y-auto custom-scrollbar pr-1 mb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
            {loading ? (
              <div className="text-center text-beta dark:text-alpha">Loading...</div>
            ) : comments.length === 0 ? (
              <div className="text-center text-gray-400 dark:text-gray-500 italic">No comments yet. Start the discussion!</div>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-3 mb-4 fade-in">
                  <Avatar className="w-12 h-12 overflow-hidden relative z-50">
                    {c.user_image ? (
                      <AvatarImage src={`/storage/img/profile/${c.user_image}`} alt={c.user_name} />
                    ) : (
                      <AvatarFallback className="w-12 h-12 overflow-hidden">{getInitials(c.user_name)}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 px-3 py-2 rounded-2xl shadow-sm border border-alpha/20 bg-light dark:bg-[#23272b]" style={{ color: 'var(--color-beta)', background: undefined }}>
                    <div className="flex items-center mb-1 gap-2">
                      <span className="font-bold text-beta dark:text-alpha text-xs sm:text-sm">{c.user_name || 'User'}</span>
                      <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-beta dark:text-white leading-snug">{c.comment}</div>
                  </div>
                </div>
              ))
            )}
            <div ref={commentsEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2 mt-auto border-t border-alpha/20 dark:border-alpha/40 pt-3">
            <Avatar className="w-12 h-12 overflow-hidden relative z-50">
              {auth.user.image ? (
                <AvatarImage src={`/storage/img/profile/${auth.user.image}`} alt={auth.user.name} />
              ) : (
                <AvatarFallback className="w-12 h-12 overflow-hidden">{getInitials(auth.user.name)}</AvatarFallback>
              )}
            </Avatar>
            <input
              className="flex-1 px-3 py-2 rounded-full border border-alpha/40 focus:ring-2 focus:ring-alpha focus:border-alpha transition bg-white dark:bg-[#23272b] text-beta dark:text-alpha placeholder-gray-400 dark:placeholder-gray-400 text-sm shadow"
              type="text"
              autoFocus
              placeholder="Write a comment..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              disabled={submitting}
              maxLength={2000}
              style={{ background: 'var(--color-light, #fafafa)', color: undefined }}
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="bg-alpha text-beta hover:bg-beta hover:text-alpha transition px-5 font-bold rounded-full shadow py-2 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring focus:ring-alpha"
              style={{ minWidth: 68 }}
            >
              {submitting ? '...' : 'Send'}
            </button>
          </form>
        </div>
        {/* <style>{`
          .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #36393f; }
          .dark .custom-scrollbar { scrollbar-color: #36393f #23272b; }
          .dark .custom-scrollbar::-webkit-scrollbar-track { background: #23272b; }
          .dark .fade-in { animation: fade-in-dark 0.5s; }
          .dark .bg-light { background-color: #23272b!important; }
          .dark .text-beta { color: #ffc801!important; }
          .dark .border-alpha { border-color: #ffc80120!important; }
          @keyframes fade-in-dark {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style> */}
      </div>
    </div>
  );
}

export default CommentsModal;
