import { Avatar } from '@/components/ui/avatar';
import { router } from '@inertiajs/react';
import { Calendar, Camera, Edit3, Github, Globe, Linkedin, Twitter } from 'lucide-react';
import { useState } from 'react';
import EditUserModal from '../EditModal';

const ProfileHeader = ({ user, trainings, roles, stats }) => {
    const [open, setOpen] = useState(false);
    const onlineColor = user?.is_online ? 'bg-green-500' : 'bg-neutral-500';
    const lastOnline = user?.last_online ? new Date(user.last_online).toLocaleString() : 'No last activity available';
    const socials = user?.socials || {};

    const changeCover = (event, userId) => {
        const file = event.target.files[0]; // Get the first file
        if (!file) return; // If no file is selected, don't proceed

        const formData = new FormData();
        formData.append('cover', file); // Append the selected file to FormData

        // Send the POST request with the form data
        router.post(`/changeCover/${userId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Make sure the request is sent as multipart
            },
            onSuccess: () => {
                //('Cover changed successfully');
            },
            onError: (error) => {
                //('Cover not changed', error);
            },
        });
    };

    return (
        <>
          </>
    );
};

export default ProfileHeader;
