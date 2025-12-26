import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Avatar } from "@/components/ui/avatar";
import { Link, usePage } from "@inertiajs/react";
import { timeAgo } from '../../lib/utils'
import DeleteModal from "../DeleteModal";
import { CheckIcon, Pencil, Trash, Paperclip, ThumbsUp } from "lucide-react";
import imageCompression from 'browser-image-compression';
import { subscribeToChannel } from '../../lib/ablyManager'

function CommentsModal({ postId, open, onClose, onCommentAdded, onCommentRemoved, takeToUserProfile }) {
  //(postId);


  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newCommentImage, setNewCommentImage] = useState(null);
  const [newCommentImagePreview, setNewCommentImagePreview] = useState(null);
  const [compressingImage, setCompressingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openUpdatedComment, setOpenUpdatedComment] = useState(null);
  const [editedComment, setEditedComment] = useState('');
  const [editedCommentImage, setEditedCommentImage] = useState(null);
  const [editedCommentImagePreview, setEditedCommentImagePreview] = useState(null);
  const [editedRemoveImage, setEditedRemoveImage] = useState(false);
  const [compressingEditedImage, setCompressingEditedImage] = useState(false);
  const [deletedCommentId, setDeletedCommentId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [openImageUrl, setOpenImageUrl] = useState(null);
  const [expandedCommentIds, setExpandedCommentIds] = useState([]);
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

  const toggleCommentLike = async (commentId) => {
    try {
      const res = await axios.post(`/posts/comments/${commentId}/like`);
      const { likes_count, liked } = res?.data || {};
      setComments((prev) =>
        prev.map((c) => c.id === commentId ? {
          ...c,
          likes_count: typeof likes_count === 'number' ? likes_count : c.likes_count,
          liked: typeof liked === 'boolean' ? liked : c.liked,
        } : c)
      );
    } catch (error) {
      console.error('Failed to toggle comment like:', error);
    }
  };

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
      setNewCommentImage(null);
      setNewCommentImagePreview(null);
      setOpenImageUrl(null);
      setExpandedCommentIds([]);
      setOpenUpdatedComment(null);
      setEditedComment('');
      setEditedCommentImage(null);
      setEditedCommentImagePreview(null);
      setEditedRemoveImage(false);
      setLoading(false);
    }
  }, [open, postId]);

  useEffect(() => {
    if (!open || !postId) return;

    let mounted = true;
    let unsubscribeLike = null;
    let unsubscribeCreated = null;
    let unsubscribeUpdated = null;
    let unsubscribeDeleted = null;
    let interval = null;

    const setup = async () => {
      const channelName = `feed:post:${postId}`;

      unsubscribeLike = await subscribeToChannel(channelName, 'comment-like-updated', (data) => {
        if (!mounted || !data) return;
        const commentId = Number(data.comment_id);
        if (!commentId) return;

        setComments((prev) =>
          prev.map((c) => c.id === commentId ? {
            ...c,
            likes_count: typeof data.likes_count === 'number' ? data.likes_count : c.likes_count,
          } : c)
        );
      });

      unsubscribeCreated = await subscribeToChannel(channelName, 'comment-created', (data) => {
        if (!mounted || !data) return;
        setComments((prev) => {
          const exists = prev.some((c) => Number(c.id) === Number(data.id));
          if (exists) return prev;
          return [...prev, data];
        });
        setTimeout(
          () => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }),
          120
        );
      });

      unsubscribeUpdated = await subscribeToChannel(channelName, 'comment-updated', (data) => {
        if (!mounted || !data) return;
        const id = Number(data.id);
        if (!id) return;
        setComments((prev) =>
          prev.map((c) => c.id === id ? {
            ...c,
            comment: typeof data.comment === 'string' ? data.comment : c.comment,
            comment_image: typeof data.comment_image !== 'undefined' ? data.comment_image : c.comment_image,
          } : c)
        );
      });

      unsubscribeDeleted = await subscribeToChannel(channelName, 'comment-deleted', (data) => {
        if (!mounted || !data) return;
        const id = Number(data.comment_id);
        if (!id) return;
        setComments((prev) => prev.filter((c) => c.id !== id));
      });

      const anySubscribed = !!(unsubscribeLike || unsubscribeCreated || unsubscribeUpdated || unsubscribeDeleted);
      if (!anySubscribed) {
        interval = window.setInterval(async () => {
          try {
            const res = await axios.get(`/posts/comments/${postId}/stats`);
            if (!mounted) return;
            const stats = res?.data?.stats || {};

            setComments((prev) =>
              prev.map((c) => {
                const s = stats?.[String(c.id)];
                if (!s) return c;
                return {
                  ...c,
                  likes_count: typeof s.likes_count === 'number' ? s.likes_count : c.likes_count,
                  liked: typeof s.liked === 'boolean' ? s.liked : c.liked,
                };
              })
            );
          } catch {
            // ignore polling errors
          }
        }, 5000);
      }
    };

    setup();

    return () => {
      mounted = false;
      if (typeof unsubscribeLike === 'function') unsubscribeLike();
      if (typeof unsubscribeCreated === 'function') unsubscribeCreated();
      if (typeof unsubscribeUpdated === 'function') unsubscribeUpdated();
      if (typeof unsubscribeDeleted === 'function') unsubscribeDeleted();
      if (interval) window.clearInterval(interval);
    };
  }, [open, postId]);

  useEffect(() => {
    if (!newCommentImage) {
      setNewCommentImagePreview(null);
      return;
    }

    const url = URL.createObjectURL(newCommentImage);
    setNewCommentImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [newCommentImage]);

  // ✅ Handle new comment submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() && !newCommentImage) return;
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('comment', newComment.trim() || '');
      if (newCommentImage) {
        formData.append('image', newCommentImage);
      }

      const res = await axios.post(`/posts/comments/${postId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Add new comment locally
      setComments((prev) => [...prev, res.data]);
      setNewComment("");
      setNewCommentImage(null);
      setNewCommentImagePreview(null);

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
      // //alert("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Handle comment deletion
  const handleDeleteComment = async (commentId) => {

    try {
      await axios.delete(`/posts/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));

      // Notify parent to decrement count
      if (typeof onCommentRemoved === "function") {
        onCommentRemoved(postId);
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
      //alert("Failed to delete comment");
    }
  };

  //Handle comment update (optional)
  const handleUpdatedComment = async (commentId) => {
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('comment', editedComment);

      if (editedRemoveImage) {
        formData.append('remove_image', '1');
      }
      if (editedCommentImage) {
        formData.append('image', editedCommentImage);
      }

      const res = await axios.post(`/posts/comments/${commentId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updated = res?.data;

      setComments((prevComments) =>
        prevComments.map((comment) => comment.id === commentId ? {
          ...comment,
          comment: updated?.comment ?? editedComment,
          comment_image: updated?.comment_image ?? comment.comment_image,
          likes_count: typeof updated?.likes_count === 'number' ? updated.likes_count : comment.likes_count,
          liked: typeof updated?.liked === 'boolean' ? updated.liked : comment.liked,
        } : comment)
      );

      setOpenUpdatedComment(null);
      setEditedComment('');
      setEditedCommentImage(null);
      setEditedCommentImagePreview(null);
      setEditedRemoveImage(false);
      //alert('success')
    } catch (error) {
      console.error("failed to update : ", error);
      //alert('failed to update comment')

    }
  }

  if (!open) return null;

  return (
    <>
      {openImageUrl && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          onClick={() => setOpenImageUrl(null)}
          role="button"
          tabIndex={-1}
        >
          <div className="absolute inset-0 bg-black/80" />
          <div className="relative max-w-[95vw] max-h-[90vh]">
            <img
              src={openImageUrl}
              alt="Comment"
              className="max-w-[95vw] max-h-[90vh] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              className="absolute -top-3 -right-3 bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                setOpenImageUrl(null);
              }}
              aria-label="Close image"
            >
              ×
            </button>
          </div>
        </div>
      )}

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
          <div className="px-6 pt-6 pb-3 border-b border-alpha/30 dark:border-alpha/30 bg-gradient-to-r from-alpha/10 to-alpha/20 ">
            <h2 className="text-lg sm:text-base font-bold text-alpha tracking-wide uppercase">
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
                <div key={c.id} className="flex gap-3 rounded-2xl border border-alpha/20 bg-neutral-50 dark:bg-dark px-4 py-2 group animate-in fade-in slide-in-from-left-2">
                  <Link href={takeToUserProfile(c)}>
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

                  <div className="flex-1 px-3 py-2.5 w-[70%]  shadow-sm hover:shadow-md transition duration-200">
                    <div className="flex justify-between mb-1">
                      <div className="flex flex-col pb-2">
                        <Link
                          href={takeToUserProfile(c)}
                          className="font-bold text-white dark:text-yellow-300 text-sm truncate"
                        >
                          {c.user_name || "User"}
                        </Link>
                        <span className="text-[0.7rem] text-gray-500 dark:text-gray-400">
                          {timeAgo(c.created_at)}
                        </span>
                      </div>
                      {auth.user.id === c.user_id && (
                        <>
                          {openUpdatedComment !== c.id && (
                            <>
                              <div className=" gap-3 hidden  group-hover:flex items-start pt-1">
                                <button
                                  onClick={() => {
                                    setOpenUpdatedComment(c.id);
                                    setEditedComment(c.comment);
                                    setEditedRemoveImage(false);
                                    setEditedCommentImage(null);
                                    setEditedCommentImagePreview(c.comment_image ? `/storage/img/comments/${c.comment_image}` : null);
                                  }}
                                  className="text-alpha cursor-pointer"
                                >
                                  <Pencil size={15} />
                                </button>
                                <button
                                  onClick={() => {
                                    setDeletedCommentId(c.id);
                                    setOpenDelete(true);
                                  }}
                                  className="text-error cursor-pointer"
                                >
                                  <Trash size={15} />
                                </button>
                              </div>
                            </>
                          )}

                          {openUpdatedComment === c.id && (
                            <button
                              onClick={() => {
                                handleUpdatedComment(c.id, editedComment); // optional
                              }}
                              className="text-alpha cursor-pointer"
                            >
                              <CheckIcon size={20} />
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {/* ✅ Edit only the selected comment */}
                    {openUpdatedComment === c.id ? (
                      <div className="w-full space-y-2">
                        <textarea
                          className="text-sm text-neutral-800 outline-2 dark:text-neutral-100 leading-snug break-words whitespace-pre-wrap w-full resize-none bg-white dark:bg-dark/50 border border-alpha/20 rounded-lg p-2 min-h-[80px]"
                          value={editedComment}
                          onChange={(e) => setEditedComment(e.target.value)}
                          autoFocus
                        />

                        {editedCommentImagePreview && !editedRemoveImage && (
                          <div className="relative">
                            <img
                              src={editedCommentImagePreview}
                              alt="Selected"
                              className="max-h-48 w-full rounded-xl object-cover border border-alpha/20"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setEditedRemoveImage(true);
                                setEditedCommentImage(null);
                                setEditedCommentImagePreview(null);
                              }}
                              className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center"
                              aria-label="Remove image"
                            >
                              ×
                            </button>
                          </div>
                        )}

                        <div className="flex gap-2 items-center">
                          <label className="px-3 py-2 rounded-lg border border-alpha/30 bg-white dark:bg-dark text-sm cursor-pointer select-none">
                            <span className="inline-flex items-center gap-2">
                              <Paperclip size={16} />
                            </span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/jpg,image/webp"
                              className="hidden"
                              disabled={compressingEditedImage}
                              onChange={async (e) => {
                                const file = e.target.files?.[0] ?? null;
                                if (!file) {
                                  setEditedCommentImage(null);
                                  return;
                                }

                                setCompressingEditedImage(true);
                                try {
                                  const compressed = await imageCompression(file, {
                                    maxSizeMB: 1,
                                    maxWidthOrHeight: 1500,
                                    useWebWorker: true,
                                  });
                                  setEditedCommentImage(compressed);
                                  setEditedCommentImagePreview(URL.createObjectURL(compressed));
                                  setEditedRemoveImage(false);
                                } catch {
                                  setEditedCommentImage(file);
                                  setEditedCommentImagePreview(URL.createObjectURL(file));
                                  setEditedRemoveImage(false);
                                } finally {
                                  setCompressingEditedImage(false);
                                }
                              }}
                            />
                          </label>

                          {c.comment_image && !editedRemoveImage && (
                            <button
                              type="button"
                              className="text-xs font-semibold text-error hover:underline"
                              onClick={() => {
                                setEditedRemoveImage(true);
                                setEditedCommentImage(null);
                                setEditedCommentImagePreview(null);
                              }}
                            >
                              Remove image
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        {(() => {
                          const text = c.comment || '';
                          const limit = 150;
                          const isLong = text.length > limit;
                          const isExpanded = expandedCommentIds.includes(c.id);
                          const displayText = isLong && !isExpanded ? `${text.slice(0, limit)}...` : text;

                          return (
                            <div className="w-full">
                              <p className="text-sm text-neutral-800 dark:text-neutral-100 leading-snug break-words whitespace-pre-wrap w-full">
                                {displayText}
                              </p>
                              {isLong && (
                                <button
                                  type="button"
                                  className="mt-1 text-xs font-semibold text-alpha hover:underline"
                                  onClick={() => {
                                    setExpandedCommentIds((prev) => {
                                      const has = prev.includes(c.id);
                                      if (has) return prev.filter((id) => id !== c.id);
                                      return [...prev, c.id];
                                    });
                                  }}
                                >
                                  {isExpanded ? 'See less' : 'See more'}
                                </button>
                              )}
                            </div>
                          );
                        })()}
                        {c.comment_image && (
                          <div className="mt-2">
                            <button
                              type="button"
                              className="block"
                              onClick={() => setOpenImageUrl(`/storage/img/comments/${c.comment_image}`)}
                            >
                              <img
                                src={`/storage/img/comments/${c.comment_image}`}
                                alt="Comment"
                                className="max-h-64 w-full sm:max-w-[320px] rounded-2xl object-cover border border-alpha/20 cursor-zoom-in"
                                loading="lazy"
                              />
                            </button>
                          </div>
                        )}

                        <div className="mt-2 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleCommentLike(c.id)}
                            className={
                              `inline-flex items-center gap-2 text-xs font-semibold ` +
                              (c.liked ? 'text-alpha' : 'text-neutral-500 dark:text-neutral-300')
                            }
                          >
                            <ThumbsUp size={14} />
                            Like
                          </button>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            {Number(c.likes_count || 0)}
                          </span>
                        </div>
                      </>
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
              onlineCircleClass='hidden'
            />

            <div className="flex-1 flex flex-col gap-2">
              {newCommentImagePreview && (
                <div className="relative">
                  <img
                    src={newCommentImagePreview}
                    alt="Selected"
                    className="max-h-48 w-full rounded-xl object-cover border border-alpha/20"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setNewCommentImage(null);
                      setNewCommentImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={submitting}
                    maxLength={2000}
                    className="w-full px-4 py-2.5 rounded-lg border border-alpha/40 focus:ring-2 focus:ring-alpha focus:border-alpha/40 transition bg-white dark:bg-dark text-neutral-800 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm shadow-sm focus:outline-0"
                  />
                </div>

                <label className="px-3 py-2.5 rounded-lg border border-alpha/30 bg-white dark:bg-dark text-sm cursor-pointer select-none">
                  <span className="inline-flex items-center gap-2">
                    <Paperclip size={16} />
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    disabled={submitting || compressingImage}
                    onChange={async (e) => {
                      const file = e.target.files?.[0] ?? null;
                      if (!file) {
                        setNewCommentImage(null);
                        return;
                      }

                      setCompressingImage(true);
                      try {
                        const compressed = await imageCompression(file, {
                          maxSizeMB: 1,
                          maxWidthOrHeight: 1500,
                          useWebWorker: true,
                        });
                        setNewCommentImage(compressed);
                      } catch {
                        // fallback to original file
                        setNewCommentImage(file);
                      } finally {
                        setCompressingImage(false);
                      }
                    }}
                  />
                </label>

                <button
                  type="submit"
                  disabled={submitting || compressingImage || (!newComment.trim() && !newCommentImage)}
                  className="bg-alpha text-black hover:bg-yellow-300 transition-all duration-200 px-5 font-semibold rounded-lg shadow-md hover:shadow-lg py-2.5 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-alpha/50 active:scale-95"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : compressingImage ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    "Send"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>


      {openDelete && <DeleteModal open={openDelete} onOpenChange={setOpenDelete} onConfirm={() => handleDeleteComment(deletedCommentId)} description="This action cannot be undone. This will permanently delete this Comment." title="Delete Comment" />}
    </>
  );
}

export default CommentsModal;
