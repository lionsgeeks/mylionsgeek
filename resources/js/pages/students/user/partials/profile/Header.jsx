import React, { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { MapPin, Briefcase, Calendar, Edit2, Camera, MoreHorizontal, MessageCircle, Instagram, Linkedin, ExternalLink, Github, User, PenTool } from 'lucide-react';
import { Link, router, usePage } from '@inertiajs/react';
import EditUserModal from '../../../../admin/users/partials/EditModal';
import { helpers } from '../../../../../components/utils/helpers';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Rolegard from '../../../../../components/rolegard';
import FollowModal from '../../../../../components/FollowModal';
import ProfilePictureModal from '../../../../../components/ProfilePictureModal';

const Header = ({ user, userFunctionality }) => {
    const [openEdit, setOpenEdit] = useState(false);
    const [openFollowModal, setOpenFollowModal] = useState([]);
    const [openProfilePicture, setOpenProfilePicture] = useState(false);
    const { auth } = usePage().props;
    const { addOrRemoveFollow } = helpers();

    const handleProfilePictureClick = () => {
        // Only show modal for other users' profiles, not own profile
        if (auth.user?.id !== user?.id && user?.image) {
            setOpenProfilePicture(true);
        }
    };

    // Filter social links based on user formation and allowed platforms
    const allowedPlatforms = ['instagram', 'linkedin', 'portfolio', 'behance'];
    
    // Add GitHub only for coding users
    const isCodingUser = user?.formation?.toLowerCase().includes('developpement') || 
                         user?.formation?.toLowerCase().includes('coding');
    
    if (isCodingUser) {
        allowedPlatforms.push('github');
    }

    const filteredSocialLinks = (user?.social_links || []).filter(link => 
        allowedPlatforms.includes(link.title)
    );

    const getSocialIcon = (platform) => {
        switch (platform) {
            case 'instagram':
                return Instagram;
            case 'linkedin':
                return Linkedin;
            case 'portfolio':
                return User;
            case 'behance':
                return PenTool;
            case 'github':
                return Github;
            default:
                return ExternalLink;
        }
    };

    const handleMessageClick = () => {
        // 7al chat w 3tiw conversation dyal had user
        window.dispatchEvent(new CustomEvent('open-chat', {
            detail: { userId: user?.id }
        }));

        // 7al chat dialog
        const chatButton = document.querySelector('[aria-label="Chat"]');
        if (chatButton) {
            chatButton.click();
        }
    };

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
            <div className="bg-white dark:bg-dark_gray rounded-lg shadow overflow-hidden mb-4">
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

                {/* Social Links - Directly Under Cover */}
                {filteredSocialLinks.length > 0 && (
                    <div className="lg:flex hidden justify-end px-6 pt-4 pb-2">
                        <div className="flex gap-2 flex-wrap">
                            {filteredSocialLinks.map((link) => {
                                const Icon = getSocialIcon(link.title);
                                return (
                                    <a
                                        key={link.id}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-8 h-8 text-beta dark:text-light hover:text-alpha dark:hover:text-alpha transition-colors"
                                        title={link.title.charAt(0).toUpperCase() + link.title.slice(1)}
                                    >
                                        <Icon size={20} />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Profile Info */}
                <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                    {/* Avatar */}
                    <div className="lg:-mt-20 -mt-16 mb-5 relative w-fit group mx-auto lg:mx-0">
                        <div 
                            className={`${auth.user?.id !== user?.id && user?.image ? 'cursor-pointer' : ''}`}
                            onClick={handleProfilePictureClick}
                        >
                            <Avatar
                                className="w-32 h-32 sm:w-32 sm:h-32 lg:w-40 lg:h-40 border-4 border-white dark:border-dark"
                                image={user?.image}
                                name={user?.name}
                                lastActivity={user?.online || null}
                                onlineCircleClass="hidden"
                                edit={auth.user?.id == user?.id}
                            />
                        </div>

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

                    {/* Name and Title - Facebook Style */}
                    <div className="text-center sm:text-left lg:hidden">
                        <h1 className="text-2xl sm:text-2xl lg:text-2xl font-bold text-beta dark:text-light">{user?.name}</h1>
                        <p className="text-base text-beta/80 dark:text-light/80 mt-1">
                            {userFunctionality(user)}
                        </p>

                        {/* Mobile Stats - Facebook Style */}
                        <div className="flex justify-center sm:justify-start gap-6 mt-4 text-sm">
                            <div className='cursor-pointer' onClick={() => setOpenFollowModal([true, 'followers'])}  >
                                <span className="font-semibold text-beta dark:text-light">{user?.followers?.length}</span>
                                <span className="text-beta/70 dark:text-light/70 ml-1">Followers</span>
                            </div>
                            <div className='cursor-pointer' onClick={() => setOpenFollowModal([true, 'following'])}>
                                <span className="font-semibold text-beta dark:text-light">{user?.following?.length}</span>
                                <span className="text-beta/70 dark:text-light/70 ml-1">Following</span>
                            </div>
                        </div>

                        {/* Mobile Action Buttons - Facebook Style */}
                        <div className="flex flex-col sm:flex-row justify-center sm:justify-start gap-2 mt-4">
                            {auth.user?.id == user?.id && (
                                <button
                                    onClick={() => setOpenEdit(true)}
                                    className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-alpha text-beta rounded-lg hover:bg-alpha/90 transition-colors w-full sm:w-auto"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    <span className="text-sm font-medium">Edit Profile</span>
                                </button>
                            )}
                            {auth.user?.id != user?.id && (
                                <>
                                    <button
                                        onClick={() => addOrRemoveFollow(user?.id, user?.isFollowing)}
                                        className={`cursor-pointer flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors w-full sm:w-auto ${user?.isFollowing ? 'bg-dark text-light dark:text-beta dark:bg-alpha hover:bg-dark/90' : 'bg-alpha text-beta hover:bg-alpha/90'
                                            }`}
                                    >
                                        <span className="text-sm font-medium">{user?.isFollowing ? 'Unfollow' : 'Follow'}</span>
                                    </button>
                                    {/* {user?.isFollowing && (
                                        <button
                                            onClick={handleMessageClick}
                                            className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                            <span className="text-sm font-medium">Message</span>
                                        </button>
                                    )} */}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Desktop Layout - Original */}
                    <div className="hidden lg:block">
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
                                    <div className='cursor-pointer' onClick={() => setOpenFollowModal([true, 'followers'])}  >
                                        <span className="font-semibold text-beta dark:text-light">{user?.followers?.length}</span>
                                        <span className="text-beta/70 dark:text-light/70 ml-1">Followers</span>
                                    </div>
                                    <div className='cursor-pointer' onClick={() => setOpenFollowModal([true, 'following'])}>
                                        <span className="font-semibold text-beta dark:text-light">{user?.following?.length}</span>
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
                                    <>
                                        <button
                                            onClick={() => addOrRemoveFollow(user?.id, user?.isFollowing)}
                                            className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${user?.isFollowing ? 'bg-dark text-light dark:text-beta dark:bg-alpha hover:bg-dark/90' : 'bg-alpha text-beta hover:bg-alpha/90'
                                                }`}
                                        >
                                            <span className="text-sm font-medium">{user?.isFollowing ? 'Unfollow' : 'Follow'}</span>
                                        </button>
                                        {/* {user?.isFollowing && (
                                            <button
                                                onClick={handleMessageClick}
                                                className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                                <span className="text-sm font-medium">Message</span>
                                            </button>
                                        )} */}
                                    </>
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
                                                <Link href={"/admin/users/" + user.id} className="text-sm ">
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
            </div>
            {openEdit && (
                <>
                    {console.log('Header - user data passed to EditModal:', user)}
                    <EditUserModal 
                        open={openEdit} 
                        editedUser={user} 
                        onClose={() => setOpenEdit(false)} 
                        status={['studying', 'unemployed', 'internship', 'freelancing', 'working']} 
                        roles={['student', 'admin', 'coach', 'studio_responsable']} 
                        trainings={[]} 
                    />
                </>
            )}
            {openFollowModal[0] && <FollowModal student={user} onOpenChange={setOpenFollowModal} openChange={openFollowModal} />}
            <ProfilePictureModal 
                open={openProfilePicture} 
                onOpenChange={setOpenProfilePicture} 
                user={user} 
            />
        </>
    );
};

export default Header;
