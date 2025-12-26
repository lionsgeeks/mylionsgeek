import { X, InstagramIcon, MessageCircle, Send, Users, FacebookIcon, TwitterIcon, GithubIcon, LinkedinIcon, User, ExternalLink, Briefcase } from 'lucide-react';
import { useEffect, useState } from 'react';
import { helpers } from './utils/helpers';
import { useForm, usePage } from '@inertiajs/react';
import InputError from '@/components/input-error';

const platformIcons = {
    instagram: InstagramIcon,
    facebook: FacebookIcon,
    twitter: TwitterIcon,
    github: GithubIcon,
    linkedin: LinkedinIcon,
    behance: ExternalLink,
    pinterest: User,
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

const CreateSocialLinkModal = ({ onOpen, onOpenChange, initialLink = null }) => {
    const { stopScrolling } = helpers();
    const { auth } = usePage().props;

    const isEdit = Boolean(initialLink?.id);

    const socialLinks = auth?.user?.social_links || [];

    // Filter out platforms that are already added (only for new links, not for editing)
    const availablePlatforms = initialLink 
        ? platforms 
        : platforms.filter(platform => 
            !socialLinks.some(link => link.title === platform.value && link.id !== initialLink?.id)
        );

    const [validationError, setValidationError] = useState('');

    const { data, setData, processing, errors, reset, clearErrors, post, put } = useForm({
        title: initialLink?.title || '',
        url: initialLink?.url || '',
    });

    useEffect(() => {
        stopScrolling(onOpen);
        return () => stopScrolling(false);
    }, [onOpen, stopScrolling]);

    useEffect(() => {
        if (!onOpen) return;

        clearErrors();
        setValidationError('');
        setData({
            title: initialLink?.title || '',
            url: initialLink?.url || '',
        });

        return () => {
            reset();
            clearErrors();
            setValidationError('');
        };
    }, [onOpen, initialLink?.id, initialLink?.title, initialLink?.url, clearErrors, setData, reset]);

    const validateUrl = () => {
        if (!data.title || !data.url) return false;

        const platform = platforms.find(p => p.value === data.title);
        if (!platform) return false;

        // Portfolio doesn't require domain validation
        if (platform.value === 'portfolio') {
            // Just check if it's a valid URL format
            try {
                new URL(data.url);
                setValidationError('');
                return true;
            } catch {
                setValidationError('Please enter a valid URL');
                return false;
            }
        }

        const urlLower = data.url.toLowerCase();
        const isValidDomain = platform.domains.some(domain => urlLower.includes(domain));

        if (!isValidDomain) {
            setValidationError(`URL must contain ${platform.domains.join(' or ')}`);
            return false;
        }

        setValidationError('');
        return true;
    };

    const submit = () => {
        if (!validateUrl()) return;

        if (isEdit) {
            put(`/users/social-links/${initialLink.id}`, {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                    clearErrors();
                    setValidationError('');
                },
            });
            return;
        }

        post('/users/social-links', {
            onSuccess: () => {
                onOpenChange(false);
                reset();
                clearErrors();
                setValidationError('');
            },
        });
    };

    return (
        <>
            <div onClick={() => onOpenChange(false)} className="fixed inset-0 h-full z-30 bg-black/50 dark:bg-black/70 backdrop-blur-md transition-all duration-300" />
            <div className="fixed inset-0 h-fit mx-auto w-[70%] sm:w-[520px] bg-light dark:bg-beta rounded-lg top-1/2 -translate-y-1/2 z-50 overflow-hidden flex flex-col">
                <div className="bg-light dark:bg-dark w-full rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-light dark:bg-dark border-b border-beta/20 dark:border-light/10 p-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-beta dark:text-light">
                            {isEdit ? 'Edit link' : 'Add link'}
                        </h2>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="text-beta/60 dark:text-light/60 hover:text-beta dark:hover:text-light transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-beta dark:text-light mb-2">
                                Platform*
                            </label>
                            <select
                                name="title"
                                value={data.title}
                                onChange={(e) => {
                                    setData('title', e.target.value);
                                    setValidationError('');
                                }}
                                className="w-full px-3 py-2 bg-light dark:bg-dark_gray border border-beta/30 dark:border-light/20 rounded text-beta dark:text-light placeholder:text-beta/50 dark:placeholder:text-light/50 focus:outline-none focus:border-alpha focus:ring-1 focus:ring-alpha"
                            >
                                <option value="">Select a platform</option>
                                {availablePlatforms.map(platform => (
                                    <option key={platform.value} value={platform.value}>
                                        {platform.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.title} className="mt-1" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-beta dark:text-light mb-2">
                                URL*
                            </label>
                            <input
                                type="url"
                                name="url"
                                value={data.url}
                                onChange={(e) => {
                                    setData('url', e.target.value);
                                    setValidationError('');
                                }}
                                placeholder={`https://example.com/username`}
                                className="w-full px-3 py-2 bg-light dark:bg-dark_gray border border-beta/30 dark:border-light/20 rounded text-beta dark:text-light placeholder:text-beta/50 dark:placeholder:text-light/50 focus:outline-none focus:border-alpha focus:ring-1 focus:ring-alpha"
                            />
                            <InputError message={errors.url} className="mt-1" />
                            {validationError && (
                                <p className="text-error text-xs mt-1">{validationError}</p>
                            )}
                        </div>
                    </div>

                    <div className="sticky bottom-0 bg-light dark:bg-dark border-t border-beta/20 dark:border-light/10 p-4 flex justify-end gap-3">
                        <button
                            onClick={() => onOpenChange(false)}
                            className="px-6 py-2 border border-beta/30 dark:border-light/30 text-beta dark:text-light rounded-full font-medium hover:bg-beta/5 dark:hover:bg-light/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={submit}
                            disabled={processing}
                            className="px-6 py-2 bg-alpha text-beta dark:text-dark rounded-full font-medium hover:bg-alpha/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreateSocialLinkModal;