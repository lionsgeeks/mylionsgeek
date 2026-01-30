import { X } from 'lucide-react';

const ProfilePictureModal = ({ open, onOpenChange, user }) => {
    if (!open || !user) return null;

    const handleClose = (e) => {
        if (e.target === e.currentTarget) {
            onOpenChange(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={handleClose}>
                {/* Close Button */}
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                >
                    <X size={20} />
                </button>

                {/* Profile Picture */}
                <img
                    src={`/storage/img/profile/${user.image}`}
                    alt={`${user.name}'s profile picture`}
                    className="h-full max-h-[50vh] w-full max-w-3xl object-contain"
                />
            </div>
        </>
    );
};

export default ProfilePictureModal;
