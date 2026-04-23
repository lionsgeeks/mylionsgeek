import PostCommentItem from './PostCommentItem';

export default function PostCommentsThread({
    listWrapperClassName,
    loading,
    comments,
    commentsEndRef,
    isFacebookEmbed,
    currentUserId,
    takeToUserProfile,
    timeAgo,
    openUpdatedCommentId,
    onStartEdit,
    onRequestDelete,
    onSaveEdit,
    editedComment,
    setEditedComment,
    editedCommentImagePreview,
    editedRemoveImage,
    compressingEditedImage,
    onEditedFileInputChange,
    onRemoveEditedPreview,
    onMarkRemoveExistingImage,
    expandedCommentIds,
    onToggleExpandComment,
    onOpenCommentImage,
    onToggleLike,
    onOpenCommentLikes,
}) {
    const shellClassName = isFacebookEmbed
        ? `${listWrapperClassName} custom-scrollbar`.trim()
        : 'flex-1 space-y-3 overflow-y-auto px-6 py-4 custom-scrollbar';

    return (
        <div className={shellClassName}>
            {loading ? (
                <p className="py-6 text-center text-gray-500 dark:text-gray-400">Loading comments...</p>
            ) : comments.length === 0 ? (
                <p className="py-6 text-center text-gray-500 dark:text-gray-400">No comments yet</p>
            ) : (
                comments.map((c) => (
                    <PostCommentItem
                        key={c.id}
                        c={c}
                        isFacebookEmbed={isFacebookEmbed}
                        currentUserId={currentUserId}
                        takeToUserProfile={takeToUserProfile}
                        timeAgo={timeAgo}
                        openUpdatedCommentId={openUpdatedCommentId}
                        onStartEdit={onStartEdit}
                        onRequestDelete={onRequestDelete}
                        onSaveEdit={onSaveEdit}
                        editedComment={editedComment}
                        setEditedComment={setEditedComment}
                        editedCommentImagePreview={editedCommentImagePreview}
                        editedRemoveImage={editedRemoveImage}
                        compressingEditedImage={compressingEditedImage}
                        onEditedFileInputChange={onEditedFileInputChange}
                        onRemoveEditedPreview={onRemoveEditedPreview}
                        onMarkRemoveExistingImage={onMarkRemoveExistingImage}
                        expandedCommentIds={expandedCommentIds}
                        onToggleExpandComment={onToggleExpandComment}
                        onOpenCommentImage={onOpenCommentImage}
                        onToggleLike={onToggleLike}
                        onOpenCommentLikes={onOpenCommentLikes}
                    />
                ))
            )}
            <div ref={commentsEndRef} />
        </div>
    );
}
