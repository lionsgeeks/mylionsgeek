import React from 'react';
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
            <div 
                className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                onClick={handleClose}
            >
                {/* Close Button */}
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Profile Picture */}
                <img
                    src={`/storage/img/profile/${user.image}`}
                    alt={`${user.name}'s profile picture`}
                    className="max-w-full max-h-full object-contain"
                />
            </div>
        </>
    );
};

export default ProfilePictureModal;
