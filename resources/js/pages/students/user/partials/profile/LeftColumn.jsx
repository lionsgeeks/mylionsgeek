import React, { useState } from 'react';
import { Edit2, ExternalLink, Plus, Pencil, Trash, Github, Twitter, Linkedin, Facebook, Instagram, MessageCircle, Send, Users, Briefcase } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import AboutModal from '../../../../../components/AboutModal';
import CreateSocialLinkModal from '../../../../../components/CreateSocialLinkModal';
import SocialLinksModal from '../../../../../components/SocialLinksModal';
import DeleteModal from '../../../../../components/DeleteModal';

const platformIcons = {
    instagram: Instagram,
    facebook: Facebook,
    twitter: Twitter,
    github: Github,
    linkedin: Linkedin,
    behance: ExternalLink,
    pinterest: ExternalLink,
    discord: MessageCircle,
    threads: Send,
    reddit: Users,
    portfolio: Briefcase,
};

const platforms = [
    { value: 'instagram', label: 'Instagram', domains: ['instagram.com', 'instagr.am'] },
    { value: 'facebook', label: 'Facebook', domains: ['facebook.com', 'fb.com'] },
    { value: 'twitter', label: 'Twitter', domains: ['twitter.com', 'x.com'] },
    { value: 'github', label: 'GitHub', domains: ['github.com'] },
    { value: 'linkedin', label: 'LinkedIn', domains: ['linkedin.com'] },
    { value: 'behance', label: 'Behance', domains: ['behance.net'] },
    { value: 'pinterest', label: 'Pinterest', domains: ['pinterest.com', 'pinterest.co'] },
    { value: 'discord', label: 'Discord', domains: ['discord.com', 'discord.gg'] },
    { value: 'threads', label: 'Threads', domains: ['threads.net'] },
    { value: 'reddit', label: 'Reddit', domains: ['reddit.com'] },
    { value: 'portfolio', label: 'Portfolio', domains: [] }, // Portfolio doesn't require specific domains
];

const LeftColumn = ({ user }) => {
    const [openAbout, setOpenAbout] = useState(false)
    const [openSocialModal, setOpenSocialModal] = useState(false)
    const [editingSocial, setEditingSocial] = useState(null)
    const [openAllSocials, setOpenAllSocials] = useState(false)
    const [openDeleteSocial, setOpenDeleteSocial] = useState(false)
    const [deletingSocial, setDeletingSocial] = useState(null)
    const { auth } = usePage().props
    const links = user?.social_links || []
    const visibleLinks = links.slice(0, 2)
    const canManage = auth?.user?.id == user?.id

    // Filter out platforms that are already added
    const availablePlatforms = platforms.filter(platform =>
        !links.some(link => link.title === platform.value)
    );
    return (
        <>
            <div className="lg:col-span-1 space-y-4">
                {/* About Card */}
                <div className="bg-white dark:bg-dark_gray rounded-lg shadow p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-beta dark:text-light">About</h2>
                        <button className="p-1 hover:bg-beta/5 dark:hover:bg-light/5 rounded">
                            {
                                auth?.user.id == user?.id && <Edit2 onClick={() => setOpenAbout(true)} className="w-4 h-4 text-beta/70 dark:text-light/70" />
                            }
                        </button>
                    </div>
                    <p className="text-sm break-words whitespace-pre-wrap text-beta/80 dark:text-light/80">
                        {user.about}
                    </p>
                </div>

                {/* Skills Card */}
                <div className="bg-white dark:bg-dark_gray rounded-lg shadow p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-beta dark:text-light">Badges</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">

                    </div>
                </div>

                {/* Contact Info Card */}
                <div className="bg-white dark:bg-dark_gray rounded-lg shadow p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-beta dark:text-light">Socials</h2>
                        {canManage && (
                            <button
                                onClick={() => {
                                    setEditingSocial(null);
                                    setOpenSocialModal(true);
                                }}
                                className="p-1 hover:bg-beta/5 dark:hover:bg-light/5 rounded"
                            >
                                <Plus className="w-4 h-4 text-beta/70 dark:text-light/70" />
                            </button>
                        )}
                    </div>

                    <div className="space-y-2">
                        {links.length === 0 ? (
                            <p className="text-sm text-beta/60 dark:text-light/60">
                                No links added.
                            </p>
                        ) : (
                            <>
                                {visibleLinks.map((link) => {
                                    const IconComponent = platformIcons[link.title] || ExternalLink;
                                    return (
                                        <div key={link.id} className="flex items-center justify-between gap-3 rounded-lg border border-beta/10 dark:border-light/10 p-3 hover:bg-beta/5 dark:hover:bg-light/5 transition group">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-9 h-9 rounded-lg bg-beta/5 dark:bg-light/5 flex items-center justify-center flex-shrink-0">
                                                    <IconComponent className="w-4 h-4 text-beta/70 dark:text-light/70" />
                                                </div>
                                                <div className="min-w-0">
                                                    <a
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-sm font-semibold text-beta dark:text-light hover:underline truncate block"
                                                    >
                                                        {link.title}
                                                    </a>
                                                    <a
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-xs text-beta/60 dark:text-light/60 hover:underline truncate block"
                                                    >
                                                        {link.url}
                                                    </a>
                                                </div>
                                            </div>

                                            {canManage && (
                                                <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingSocial(link);
                                                            setOpenSocialModal(true);
                                                        }}
                                                        className="text-alpha"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setDeletingSocial(link);
                                                            setOpenDeleteSocial(true);
                                                        }}
                                                        className="text-error"
                                                    >
                                                        <Trash size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}

                                {links.length > 2 && (
                                    <button
                                        type="button"
                                        className="text-sm font-semibold text-alpha hover:underline"
                                        onClick={() => setOpenAllSocials(true)}
                                    >
                                        Show all ({links.length})
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            {openAbout && <AboutModal onOpen={openAbout} onOpenChange={setOpenAbout} user={user} />}
            {openSocialModal && (
                <CreateSocialLinkModal
                    onOpen={openSocialModal}
                    onOpenChange={setOpenSocialModal}
                    initialLink={editingSocial}
                />
            )}
            {openAllSocials && (
                <SocialLinksModal
                    open={openAllSocials}
                    onOpenChange={setOpenAllSocials}
                    links={links}
                    canManage={canManage}
                    onEdit={(link) => {
                        setOpenAllSocials(false);
                        setEditingSocial(link);
                        setOpenSocialModal(true);
                    }}
                    onDelete={(link) => {
                        setDeletingSocial(link);
                        setOpenDeleteSocial(true);
                    }}
                />
            )}
            {openDeleteSocial && (
                <DeleteModal
                    open={openDeleteSocial}
                    onOpenChange={setOpenDeleteSocial}
                    title="Delete link"
                    description="This action cannot be undone. This will permanently delete this link."
                    onConfirm={() => {
                        if (!deletingSocial?.id) return;
                        return router.delete(`/users/social-links/${deletingSocial.id}`);
                    }}
                />
            )}
        </>
    );
};

export default LeftColumn;