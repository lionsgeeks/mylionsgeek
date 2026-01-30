import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { router, useForm } from '@inertiajs/react';
import { ImageIcon, PlusCircle, X } from 'lucide-react';
import { useState } from 'react';

export default function ModelsModal() {
    const [open, setOpen] = useState(false);
    const [badge1Preview, setBadge1Preview] = useState(null);
    const [badge2Preview, setBadge2Preview] = useState(null);
    const [badge3Preview, setBadge3Preview] = useState(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        description: '',
        badge1: null,
        badge2: null,
        badge3: null,
    });

    const handleOpenChange = (newOpen) => {
        if (!newOpen) {
            reset();
            setBadge1Preview(null);
            setBadge2Preview(null);
            setBadge3Preview(null);
        }
        setOpen(newOpen);
    };

    const handleBadgeChange = (badgeNumber, file) => {
        if (file) {
            setData(`badge${badgeNumber}`, file);
            const reader = new FileReader();
            reader.onloadend = () => {
                if (badgeNumber === 1) setBadge1Preview(reader.result);
                if (badgeNumber === 2) setBadge2Preview(reader.result);
                if (badgeNumber === 3) setBadge3Preview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeBadge = (badgeNumber) => {
        setData(`badge${badgeNumber}`, null);
        if (badgeNumber === 1) setBadge1Preview(null);
        if (badgeNumber === 2) setBadge2Preview(null);
        if (badgeNumber === 3) setBadge3Preview(null);
    };

    function handleSubmit(e) {
        e.preventDefault();

        post('/admin/models', {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setBadge1Preview(null);
                setBadge2Preview(null);
                setBadge3Preview(null);
                setOpen(false);
                router.reload({ only: ['models'], preserveState: false });
            },
            onError: (errors) => {
                console.error('Form errors:', errors);
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--color-alpha)] bg-[var(--color-alpha)] px-4 py-2 text-sm font-medium text-black hover:bg-transparent hover:text-[var(--color-alpha)]">
                    <PlusCircle size={20} />
                    Add Model
                </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto border border-alpha/20 bg-light text-dark sm:max-w-2xl dark:bg-dark dark:text-light">
                <DialogHeader>
                    <DialogTitle>Add New Model</DialogTitle>
                    <DialogDescription>Fill the form below to create a new model with badges.</DialogDescription>
                </DialogHeader>

                <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <Label htmlFor="name">Model Name *</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Enter model name"
                            required
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Enter model description (optional)"
                            rows={4}
                        />
                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                    </div>

                    {/* Badge 1 */}
                    <div>
                        <Label htmlFor="badge1">Badge 1</Label>
                        <div className="mt-2">
                            {badge1Preview ? (
                                <div className="relative inline-block">
                                    <img
                                        src={badge1Preview}
                                        alt="Badge 1 preview"
                                        className="h-32 w-32 rounded-lg border-2 border-yellow-200 object-cover dark:border-yellow-600/30"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeBadge(1)}
                                        className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-yellow-200 transition-colors hover:bg-yellow-50 dark:border-yellow-600/30 dark:hover:bg-yellow-900/20">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <ImageIcon className="mb-2 h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="font-semibold">Click to upload</span> badge image
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF or WEBP (MAX. 2MB)</p>
                                    </div>
                                    <input
                                        id="badge1"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleBadgeChange(1, e.target.files[0])}
                                    />
                                </label>
                            )}
                        </div>
                        {errors.badge1 && <p className="mt-1 text-sm text-red-600">{errors.badge1}</p>}
                    </div>

                    {/* Badge 2 */}
                    <div>
                        <Label htmlFor="badge2">Badge 2</Label>
                        <div className="mt-2">
                            {badge2Preview ? (
                                <div className="relative inline-block">
                                    <img
                                        src={badge2Preview}
                                        alt="Badge 2 preview"
                                        className="h-32 w-32 rounded-lg border-2 border-yellow-200 object-cover dark:border-yellow-600/30"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeBadge(2)}
                                        className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-yellow-200 transition-colors hover:bg-yellow-50 dark:border-yellow-600/30 dark:hover:bg-yellow-900/20">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <ImageIcon className="mb-2 h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="font-semibold">Click to upload</span> badge image
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF or WEBP (MAX. 2MB)</p>
                                    </div>
                                    <input
                                        id="badge2"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleBadgeChange(2, e.target.files[0])}
                                    />
                                </label>
                            )}
                        </div>
                        {errors.badge2 && <p className="mt-1 text-sm text-red-600">{errors.badge2}</p>}
                    </div>

                    {/* Badge 3 */}
                    <div>
                        <Label htmlFor="badge3">Badge 3</Label>
                        <div className="mt-2">
                            {badge3Preview ? (
                                <div className="relative inline-block">
                                    <img
                                        src={badge3Preview}
                                        alt="Badge 3 preview"
                                        className="h-32 w-32 rounded-lg border-2 border-yellow-200 object-cover dark:border-yellow-600/30"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeBadge(3)}
                                        className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-yellow-200 transition-colors hover:bg-yellow-50 dark:border-yellow-600/30 dark:hover:bg-yellow-900/20">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <ImageIcon className="mb-2 h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="font-semibold">Click to upload</span> badge image
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF or WEBP (MAX. 2MB)</p>
                                    </div>
                                    <input
                                        id="badge3"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleBadgeChange(3, e.target.files[0])}
                                    />
                                </label>
                            )}
                        </div>
                        {errors.badge3 && <p className="mt-1 text-sm text-red-600">{errors.badge3}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} className="cursor-pointer">
                            Cancel
                        </Button>
                        <Button type="submit" className="cursor-pointer bg-yellow-600 hover:bg-yellow-700" disabled={processing}>
                            {processing ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
