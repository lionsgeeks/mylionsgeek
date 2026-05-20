import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { router, usePage } from '@inertiajs/react';
import { Award, Briefcase, Download, Edit2, ExternalLink, Eye, Github, Instagram, Linkedin, Pencil, Plus, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import AboutModal from '../../../../../components/AboutModal';
import CreateSocialLinkModal from '../../../../../components/CreateSocialLinkModal';
import DeleteModal from '../../../../../components/DeleteModal';
import SocialLinksModal from '../../../../../components/SocialLinksModal';

const platformIcons = {
    instagram: Instagram,
    linkedin: Linkedin,
    behance: ExternalLink,
    github: Github,
    portfolio: Briefcase,
};

const platforms = [
    { value: 'instagram', label: 'Instagram', domains: ['instagram.com', 'instagr.am'] },
    { value: 'linkedin', label: 'LinkedIn', domains: ['linkedin.com'] },
    { value: 'portfolio', label: 'Portfolio', domains: [] }, // Portfolio doesn't require specific domains
    { value: 'behance', label: 'Behance', domains: ['behance.net'] },
    { value: 'github', label: 'GitHub', domains: ['github.com'] },
];

const LeftColumn = ({ user }) => {
    //console.log(user?.social_links);

    const [openAbout, setOpenAbout] = useState(false);
    const [openSocialModal, setOpenSocialModal] = useState(false);
    const [editingSocial, setEditingSocial] = useState(null);
    const [openAllSocials, setOpenAllSocials] = useState(false);
    const [openDeleteSocial, setOpenDeleteSocial] = useState(false);
    const [deletingSocial, setDeletingSocial] = useState(null);
    const [draggedItem, setDraggedItem] = useState(null);
    const [socialLinks, setSocialLinks] = useState(user?.social_links || []);
    const [certPreviewOpen, setCertPreviewOpen] = useState(false);
    const { auth } = usePage().props;
    // const visibleLinks = socialLinks.slice(0, 2)
    const canManage = auth?.user?.id == user?.id;
    const isCertified = user?.status === 'Certified';
    const certificatePdfUrl = user?.certificate_pdf_url ?? null;
    const showCertificateCard = isCertified && Boolean(certificatePdfUrl);

    // Check if user is a coding user
    const isCodingUser = user?.formation?.toLowerCase().includes('developpement') || user?.formation?.toLowerCase().includes('coding');

    // Sync socialLinks with user data when it changes
    useEffect(() => {
        setSocialLinks(user?.social_links || []);
    }, [user?.social_links]);

    // Filter out platforms that are already added and filter GitHub for coding users
    const availablePlatforms = platforms.filter((platform) => {
        // For GitHub, only show to coding users
        if (platform.value === 'github' && !isCodingUser) {
            return false;
        }
        // Filter out platforms that are already added
        return !socialLinks.some((link) => link.title === platform.value);
    });

    // Drag and drop handlers
    const handleDragStart = (e, index) => {
        setDraggedItem(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();

        if (draggedItem === null) return;

        const draggedLink = socialLinks[draggedItem];
        const newLinks = [...socialLinks];

        // Remove the dragged item
        newLinks.splice(draggedItem, 1);

        // Insert at the new position
        newLinks.splice(dropIndex, 0, draggedLink);

        setSocialLinks(newLinks);
        setDraggedItem(null);

        // Update the order on the server
        updateSocialLinksOrder(newLinks);
    };

    const updateSocialLinksOrder = (links) => {
        fetch('/students/social-links/reorder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({
                links: links.map((link) => link.id),
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to reorder social links');
                }
                return response.json();
            })
            .then((data) => {
                //console.log('Social links reordered successfully');
            })
            .catch((error) => {
                console.error('Failed to reorder social links:', error);
                // Revert to original order on error
                setSocialLinks(user?.social_links || []);
            });
    };

    return (
        <>
            <div className="space-y-4 lg:col-span-1">
                {/* About Card */}
                <div className="rounded-lg bg-white p-4 shadow dark:bg-dark_gray">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-beta dark:text-light">About</h2>
                        <button className="rounded p-1 hover:bg-beta/5 dark:hover:bg-light/5">
                            {auth?.user.id == user?.id && (
                                <Edit2 onClick={() => setOpenAbout(true)} className="h-4 w-4 text-beta/70 dark:text-light/70" />
                            )}
                        </button>
                    </div>
                    <p className="text-sm break-words whitespace-pre-wrap text-beta/80 dark:text-light/80">{user.about}</p>
                </div>

                {/* Skills Card */}
                <div className="rounded-lg bg-white p-4 shadow dark:bg-dark_gray">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-beta dark:text-light">Badges</h2>
                    </div>
                    <div className="flex flex-wrap gap-2"></div>
                </div>

                {showCertificateCard && (
                    <div className="rounded-lg bg-white p-4 shadow dark:bg-dark_gray">
                        <div className="mb-3 flex items-center gap-2">
                            <Award className="h-5 w-5 text-alpha" />
                            <h2 className="text-lg font-semibold text-beta dark:text-light">Certification</h2>
                        </div>
                        <p className="mb-3 text-xs text-beta/60 dark:text-light/60">
                            LionsGeek training certificate
                            {user.certified_at ? ` · ${user.certified_at}` : ''}
                        </p>
                        <div className="overflow-hidden rounded-lg border border-beta/10 bg-white dark:border-light/10">
                            <object data={certificatePdfUrl} type="application/pdf" className="h-36 w-full">
                                <div className="flex h-36 items-center justify-center p-3 text-center text-xs text-beta/60 dark:text-light/60">
                                    PDF preview unavailable in this browser.
                                </div>
                            </object>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-1.5 border-beta/20 text-beta dark:border-light/20 dark:text-light"
                                onClick={() => setCertPreviewOpen(true)}
                            >
                                <Eye className="h-4 w-4" />
                                Preview
                            </Button>
                            {canManage && (
                                <Button
                                    type="button"
                                    size="sm"
                                    className="gap-1.5 border border-alpha bg-alpha text-black hover:bg-alpha/90"
                                    asChild
                                >
                                    <a href="/students/certificate/download">
                                        <Download className="h-4 w-4" />
                                        Download
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Contact Info Card */}
                <div className="rounded-lg bg-white p-4 shadow dark:bg-dark_gray">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-beta dark:text-light">Socials</h2>
                        {canManage && (
                            <button
                                onClick={() => {
                                    setEditingSocial(null);
                                    setOpenSocialModal(true);
                                }}
                                className="rounded p-1 hover:bg-beta/5 dark:hover:bg-light/5"
                            >
                                <Plus className="h-4 w-4 text-beta/70 dark:text-light/70" />
                            </button>
                        )}
                    </div>

                    <div className="space-y-2">
                        {socialLinks.length === 0 ? (
                            <p className="text-sm text-beta/60 dark:text-light/60">No links added.</p>
                        ) : (
                            <>
                                {socialLinks.map((link, index) => {
                                    const IconComponent = platformIcons[link.title] || ExternalLink;
                                    return (
                                        <div
                                            key={link.id}
                                            draggable={canManage}
                                            onDragStart={(e) => handleDragStart(e, index)}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, index)}
                                            className={`group flex items-center justify-between gap-3 rounded-lg border border-beta/10 p-3 transition hover:bg-beta/5 dark:border-light/10 dark:hover:bg-light/5 ${
                                                canManage ? 'cursor-move' : ''
                                            } ${draggedItem === index ? 'opacity-50' : ''}`}
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-beta/5 dark:bg-light/5">
                                                    <IconComponent className="h-4 w-4 text-beta/70 dark:text-light/70" />
                                                </div>
                                                <div className="min-w-0">
                                                    <a
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="block truncate text-sm font-semibold text-beta hover:underline dark:text-light"
                                                    >
                                                        {link.title}
                                                    </a>
                                                    <a
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="block truncate text-xs text-beta/60 hover:underline dark:text-light/60"
                                                    >
                                                        {link.url}
                                                    </a>
                                                </div>
                                            </div>

                                            {canManage && (
                                                <div className="flex flex-shrink-0 items-center gap-2 opacity-0 transition group-hover:opacity-100">
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
                                    );
                                })}

                                {/* {socialLinks.length > 2 && (
                                    <button
                                        type="button"
                                        className="text-sm font-semibold text-alpha hover:underline"
                                        onClick={() => setOpenAllSocials(true)}
                                    >
                                        Show all ({socialLinks.length})
                                    </button>
                                )} */}
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
                    availiblePlatfroms={availablePlatforms}
                />
            )}
            {openAllSocials && (
                <SocialLinksModal
                    open={openAllSocials}
                    onOpenChange={setOpenAllSocials}
                    links={socialLinks}
                    canManage={canManage}
                    onOrderChange={(newOrder) => {
                        setSocialLinks(newOrder);
                    }}
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
                        return router.delete(`/students/social-links/${deletingSocial.id}`);
                    }}
                />
            )}
            {showCertificateCard && (
                <Dialog open={certPreviewOpen} onOpenChange={setCertPreviewOpen}>
                    <DialogContent className="max-h-[90vh] w-[95vw] max-w-3xl overflow-hidden border-beta/15 bg-light p-0 dark:border-light/10 dark:bg-dark">
                        <DialogHeader className="border-b border-beta/10 px-6 py-4 dark:border-light/10">
                            <DialogTitle className="flex items-center gap-2 text-beta dark:text-light">
                                <Award className="h-5 w-5 text-alpha" />
                                Certificate
                            </DialogTitle>
                            <DialogDescription className="text-beta/60 dark:text-light/60">
                                {user.name}
                                {user.certified_at ? ` · Certified ${user.certified_at}` : ''}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="overflow-hidden bg-white px-4 pb-4">
                            <object data={certificatePdfUrl} type="application/pdf" className="h-[min(70vh,600px)] w-full rounded-lg border border-beta/10">
                                <div className="rounded-lg border border-beta/10 p-6 text-center text-sm text-beta/70 dark:border-light/10 dark:text-light/70">
                                    PDF preview is not supported in this browser.{' '}
                                    <a
                                        href={certificatePdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-semibold text-alpha hover:underline"
                                    >
                                        Open certificate PDF
                                    </a>
                                </div>
                            </object>
                        </div>
                        <div className="flex justify-end gap-2 border-t border-beta/10 px-6 py-4 dark:border-light/10">
                            <Button
                                type="button"
                                variant="outline"
                                className="border-beta/20 text-beta dark:border-light/20 dark:text-light"
                                asChild
                            >
                                <a href={certificatePdfUrl} target="_blank" rel="noopener noreferrer">
                                    Open in new tab
                                </a>
                            </Button>
                            {canManage && (
                                <Button type="button" className="gap-1.5 border border-alpha bg-alpha text-black hover:bg-alpha/90" asChild>
                                    <a href="/students/certificate/download">
                                        <Download className="h-4 w-4" />
                                        Download
                                    </a>
                                </Button>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};

export default LeftColumn;
