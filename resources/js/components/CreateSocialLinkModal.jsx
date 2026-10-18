import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

function errorText(value) {
    if (Array.isArray(value)) {
        return value.filter((item) => typeof item === 'string' && item.trim()).join(' ');
    }

    return typeof value === 'string' ? value : '';
}

const platforms = [
    { value: 'instagram', label: 'Instagram', domains: ['instagram.com', 'instagr.am'] },
    { value: 'linkedin', label: 'LinkedIn', domains: ['linkedin.com'] },
    { value: 'portfolio', label: 'Portfolio', domains: [] },
    { value: 'behance', label: 'Behance', domains: ['behance.net'] },
    { value: 'github', label: 'GitHub', domains: ['github.com'] },
];

const CreateSocialLinkModal = ({ onOpen, onOpenChange, initialLink = null, availiblePlatfroms = [] }) => {
    const isEdit = Boolean(initialLink?.id);
    const [validationError, setValidationError] = useState('');

    const { data, setData, processing, errors, reset, clearErrors, post, put } = useForm({
        title: initialLink?.title || '',
        url: initialLink?.url || '',
    });

    useEffect(() => {
        if (!onOpen) {
            return;
        }

        clearErrors();
        setValidationError('');
        setData({
            title: initialLink?.title || '',
            url: initialLink?.url || '',
        });
    }, [onOpen, initialLink?.id]);

    const validateUrl = () => {
        if (!data.title) {
            setValidationError('Select a platform');
            return false;
        }

        if (!data.url) {
            setValidationError('Enter a URL');
            return false;
        }

        const platform = platforms.find((p) => p.value === data.title);
        if (!platform) return false;

        if (platform.value === 'portfolio') {
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
        const isValidDomain = platform.domains.some((domain) => urlLower.includes(domain));

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
            put(`/students/social-links/${initialLink.id}`, {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                    clearErrors();
                    setValidationError('');
                },
            });
            return;
        }

        post('/students/social-links', {
            onSuccess: () => {
                onOpenChange(false);
                reset();
                clearErrors();
                setValidationError('');
            },
        });
    };

    return (
        <Dialog open={Boolean(onOpen)} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit link' : 'Add link'}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="social-platform">Platform</Label>
                        <Select
                            value={data.title || undefined}
                            onValueChange={(value) => {
                                setData('title', value);
                                setValidationError('');
                            }}
                        >
                            <SelectTrigger id="social-platform" className="w-full">
                                <SelectValue placeholder="Select a platform" />
                            </SelectTrigger>
                            <SelectContent>
                                {availiblePlatfroms.map((platform) => (
                                    <SelectItem key={platform.value} value={platform.value}>
                                        {platform.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={!data.title ? validationError : errorText(errors.title)} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="social-url">URL</Label>
                        <Input
                            id="social-url"
                            type="url"
                            name="url"
                            value={data.url}
                            aria-invalid={Boolean(errorText(errors.url) || (data.title && validationError))}
                            onChange={(e) => {
                                setData('url', e.target.value);
                                setValidationError('');
                            }}
                            placeholder="https://example.com/username"
                        />
                        <InputError message={data.title ? validationError || errorText(errors.url) : errorText(errors.url)} />
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={submit} disabled={processing}>
                        {processing ? 'Saving...' : 'Save'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateSocialLinkModal;
