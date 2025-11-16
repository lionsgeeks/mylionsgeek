import React, { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { MapPin, Briefcase, Calendar, Edit2, Camera, MoreHorizontal } from 'lucide-react';
import { Link, router, usePage } from '@inertiajs/react';
import EditUserModal from '../../../../admin/users/partials/EditModal';
import { helpers } from '../../../../../components/utils/helpers';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Rolegard from '@/components/Rolegard'; // Assuming this is the path for Rolegard

const Header = ({ user, userFunctionality }) => {
    const [openEdit, setOpenEdit] = useState(false);
    const { auth } = usePage().props;
    const { addOrRemoveFollow } = helpers();

    const changeCover = (event, userId) => {
        const file = event.target.files[0]; // Get the first file
        if (!file) return; // If no file is selected, don't proceed

        const formData = new FormData();
        formData.append('cover', file); // Append the selected file to FormData

        // Send the POST request with the form data
        router.post(`/users/changeCover/${userId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',  // Make sure the request is sent as multipart
            },
            onSuccess: () => {
                //('Cover changed successfully');
            },
            onError: (error) => {
                //('Cover not changed', error);
            }
        });
    };

    const changeProfileImage = (event, userId) => {
        const file = event.target.files[0]; // Get the first file
        if (!file) return; // If no file is selected, don't proceed

        const formData = new FormData();
        formData.append('image', file); // Append the selected file to FormData

        // Send the POST request with the form data
        router.post(`/student/users/changeProfileImage/${userId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',  // Make sure the request is sent as multipart
            },
            onSuccess: () => {
                //('Cover changed successfully');
                console.log('Image changed successfully');
            },
            onError: (error) => {
                //('Cover not changed', error);
                console.log('Image change error: ' + error);
            }
        });
    };

    return (
        <>
            <div className="bg-white dark:bg-beta rounded-lg shadow overflow-hidden mb-4">
                {/* Cover Photo */}
                <div className="relative h-64 md:h-80 overflow-hidden">
                    <img
                        src={`/storage/${user?.cover}`}
                        alt="Cover"
                        className="object-cover w-full h-full"
                    />
                    {/* Mesh gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                    {/* Change Cover Icon */}
                    {auth.user.id == user.id && (
                        <label
                            className="absolute top-5 right-5 flex items-center justify-center w-12 h-12 bg-dark_gray rounded-full"
                            aria-label="Change cover image"
                        >
                            <Camera size={24} className="text-white cursor-pointer" />
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => changeCover(e, user?.id)}
                            />
                        </label>
                    )}
                </div>

                {/* Profile Info */}
                <div className="px-6 pb-6">
                    {/* Avatar */}
                    <div className="-mt-16 mb-4 relative w-fit group">
                        <Avatar
                            className="w-32 h-32"
                            image={user?.image}
                            name={user?.name}
                            lastActivity={user?.online || null}
                            onlineCircleClass="hidden"
                            edit={true}
                        />

                        {/* CAMERA ICON */}
                        {auth.user.id == user.id && (
                            <button
                                className="opacity-0 group-hover:opacity-100 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-dark_gray p-2 rounded-full shadow-lg transition-opacity duration-200 hover:bg-light dark:hover:bg-beta"
                            >
                                <Camera className="w-5 h-5 text-beta dark:text-light" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => changeProfileImage(e, user?.id)}
                                />
                            </button>
                        )}
                    </div>

                    {/* Name and Title */}
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-beta dark:text-light">{user?.name}</h1>
                            <p className="text-base text-beta/80 dark:text-light/80 mt-1">
                                {userFunctionality(user)}
                            </p>

                            {/* Location and Details */}
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-beta/70 dark:text-light/70">
                                {user?.adress && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{user?.adress}</span>
                                    </div>
                                )}
                                {user?.status && (
                                    <div className="flex items-center gap-1">
                                        <Briefcase className="w-4 h-4" />
                                        <span>{user?.status}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{user?.created_at}</span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex gap-4 mt-4 text-sm">
                                <div>
                                    <span className="font-semibold text-beta dark:text-light">{user?.followers}</span>
                                    <span className="text-beta/70 dark:text-light/70 ml-1">Followers</span>
                                </div>
                                <div>
                                    <span className="font-semibold text-beta dark:text-light">{user?.following}</span>
                                    <span className="text-beta/70 dark:text-light/70 ml-1">Following</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-5">
                            {auth.user?.id == user?.id && (
                                <button
                                    onClick={() => setOpenEdit(true)}
                                    className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-alpha text-beta rounded-lg hover:bg-alpha/90 transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    <span className="text-sm font-medium">Edit Profile</span>
                                </button>
                            )}
                            {auth.user?.id != user?.id && (
                                <button
                                    onClick={() => addOrRemoveFollow(user?.id, user?.is_Following)}
                                    className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${user?.id_Following ? 'bg-dark/5 text-light hover:bg-dark/20' : 'bg-alpha text-beta hover:bg-alpha/90'
                                        }`}
                                >
                                    <span className="text-sm font-medium">{user?.is_Following ? 'Unfollow' : 'Follow'}</span>
                                </button>
                            )}

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <MoreHorizontal className="w-5 h-5 text-beta dark:text-light" />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-light dark:bg-dark border-none shadow-lg rounded-lg">
                                        <div className="flex flex-col text-foreground items-start p-4 gap-5">
                                            {auth.user?.id == user?.id && (
                                                <Rolegard authorized={['admin', "student"]}>
                                                    <button
                                                        onClick={() => setOpenEdit(true)}
                                                        className="text-sm "
                                                    >
                                                        Edit Profile
                                                    </button>
                                                </Rolegard>
                                            )}
                                            <Rolegard authorized={['admin']}>
                                                <Link href={"/admin/users/"+user.id} className="text-sm ">
                                                    View as Admin
                                                </Link>
                                            </Rolegard>
                                            <button className="text-sm text-error ">
                                                Block User
                                            </button>
                                            <button className="text-sm text-red-500 hover:text-red-700">
                                                Report User
                                            </button>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                        </div>
                    </div>
                </div>
            </div>
            {openEdit && <EditUserModal open={openEdit} editedUser={user} onClose={() => setOpenEdit(false)} />}
        </>
    );
};

export default Header;
