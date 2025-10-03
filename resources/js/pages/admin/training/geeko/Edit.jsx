import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Save, X, Upload, ArrowLeft } from 'lucide-react';

export default function EditGeeko({ formation, geeko }) {
    const [previewImage, setPreviewImage] = useState(
        geeko.cover_image ? `/storage/${geeko.cover_image}` : null
    );

    const { data, setData, put, processing, errors } = useForm({
        title: geeko.title || '',
        description: geeko.description || '',
        time_limit: geeko.time_limit || 20,
        show_correct_answers: geeko.show_correct_answers ?? true,
        cover_image: null,
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('cover_image', file);
            const reader = new FileReader();
            reader.onload = (e) => setPreviewImage(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/training/${formation.id}/geeko/${geeko.id}`);
    };

    const goBack = () => {
        router.visit(`/training/${formation.id}/geeko/${geeko.id}`);
    };

    return (
        <AppLayout>
            <Head title={`Edit ${geeko.title} - ${formation.name}`} />

            <div className="min-h-screen p-6 bg-light dark:bg-dark">
                {/* Header */}
                <div className="mb-8">
                    <button 
                        onClick={goBack}
                        className="flex items-center space-x-2 text-alpha hover:text-alpha/80 font-semibold mb-4"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to {geeko.title}</span>
                    </button>
                    
                    <h1 className="text-4xl font-extrabold text-dark dark:text-light">
                        Edit Geeko
                    </h1>
                    <p className="mt-2 text-dark/70 dark:text-light/70">
                        Update your Geeko game settings
                    </p>
                </div>

                {/* Form */}
                <div className="max-w-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="bg-light dark:bg-dark border border-alpha/20 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-dark dark:text-light mb-6">Basic Information</h2>
                            
                            {/* Title */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-dark dark:text-light mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="w-full border border-alpha/30 rounded-lg px-4 py-3 bg-light dark:bg-dark text-dark dark:text-light focus:border-alpha focus:ring-2 focus:ring-alpha/20"
                                    placeholder="Enter a catchy title for your Geeko game"
                                    required
                                />
                                {errors.title && (
                                    <p className="text-error text-sm mt-1">{errors.title}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-dark dark:text-light mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={3}
                                    className="w-full border border-alpha/30 rounded-lg px-4 py-3 bg-light dark:bg-dark text-dark dark:text-light focus:border-alpha focus:ring-2 focus:ring-alpha/20"
                                    placeholder="Describe what this game is about (optional)"
                                />
                                {errors.description && (
                                    <p className="text-error text-sm mt-1">{errors.description}</p>
                                )}
                            </div>

                            {/* Cover Image */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-dark dark:text-light mb-2">
                                    Cover Image
                                </label>
                                <div className="border-2 border-dashed border-alpha/30 rounded-lg p-6 text-center hover:border-alpha/50 transition-colors">
                                    {previewImage ? (
                                        <div className="relative">
                                            <img 
                                                src={previewImage} 
                                                alt="Preview" 
                                                className="w-full h-48 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPreviewImage(null);
                                                    setData('cover_image', null);
                                                }}
                                                className="absolute top-2 right-2 bg-error text-light p-1 rounded-full hover:bg-error/80"
                                            >
                                                <X size={16} />
                                            </button>
                                            <div className="absolute bottom-2 left-2 right-2">
                                                <label className="cursor-pointer bg-dark/70 text-light px-3 py-1 rounded-lg text-sm hover:bg-dark/80 transition-colors">
                                                    Change Image
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <Upload className="mx-auto h-12 w-12 text-alpha/60 mb-4" />
                                            <label className="cursor-pointer">
                                                <span className="text-alpha font-semibold">Click to upload</span>
                                                <span className="text-dark/70 dark:text-light/70"> or drag and drop</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                />
                                            </label>
                                            <p className="text-xs text-dark/60 dark:text-light/60 mt-2">
                                                PNG, JPG, GIF up to 2MB
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {errors.cover_image && (
                                    <p className="text-error text-sm mt-1">{errors.cover_image}</p>
                                )}
                            </div>
                        </div>

                        {/* Game Settings */}
                        <div className="bg-light dark:bg-dark border border-alpha/20 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-dark dark:text-light mb-6">Game Settings</h2>
                            
                            {/* Time Limit */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-dark dark:text-light mb-2">
                                    Time Limit per Question (seconds) *
                                </label>
                                <input
                                    type="number"
                                    min="5"
                                    max="300"
                                    value={data.time_limit}
                                    onChange={(e) => setData('time_limit', parseInt(e.target.value))}
                                    className="w-full border border-alpha/30 rounded-lg px-4 py-3 bg-light dark:bg-dark text-dark dark:text-light focus:border-alpha focus:ring-2 focus:ring-alpha/20"
                                    required
                                />
                                <p className="text-xs text-dark/60 dark:text-light/60 mt-1">
                                    Students will have this many seconds to answer each question
                                </p>
                                {errors.time_limit && (
                                    <p className="text-error text-sm mt-1">{errors.time_limit}</p>
                                )}
                            </div>

                            {/* Show Correct Answers */}
                            <div className="mb-4">
                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={data.show_correct_answers}
                                        onChange={(e) => setData('show_correct_answers', e.target.checked)}
                                        className="w-5 h-5 text-alpha border-alpha/30 rounded focus:ring-alpha/20"
                                    />
                                    <div>
                                        <span className="text-sm font-semibold text-dark dark:text-light">
                                            Show correct answers after each question
                                        </span>
                                        <p className="text-xs text-dark/60 dark:text-light/60">
                                            Students will see the correct answer after submitting their response
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-between pt-6">
                            <button
                                type="button"
                                onClick={goBack}
                                className="flex items-center space-x-2 px-6 py-3 border border-alpha/30 rounded-lg hover:bg-alpha/10 transition-colors"
                            >
                                <X size={16} />
                                <span>Cancel</span>
                            </button>
                            
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center space-x-2 bg-alpha text-dark px-6 py-3 rounded-lg hover:bg-alpha/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                            >
                                <Save size={16} />
                                <span>{processing ? 'Saving...' : 'Save Changes'}</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Current Status */}
                <div className="mt-8 max-w-2xl">
                    <div className="bg-alpha/10 border border-alpha/20 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-dark dark:text-light mb-4">
                            Current Status
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-2xl mb-2">
                                    {geeko.status === 'ready' ? '✅' : '📝'}
                                </div>
                                <div className="text-sm font-semibold text-dark dark:text-light">
                                    {geeko.status === 'ready' ? 'Ready to Play' : 'Draft Mode'}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl mb-2">📝</div>
                                <div className="text-sm font-semibold text-dark dark:text-light">
                                    {geeko.questions?.length || 0} Questions
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl mb-2">🎮</div>
                                <div className="text-sm font-semibold text-dark dark:text-light">
                                    {geeko.sessions?.length || 0} Sessions Played
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Warning */}
                {geeko.status === 'ready' && (
                    <div className="mt-6 max-w-2xl">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                            <div className="flex items-start space-x-3">
                                <div className="text-yellow-500 text-lg">⚠️</div>
                                <div>
                                    <h4 className="text-yellow-800 font-semibold mb-1">
                                        Note about editing ready games
                                    </h4>
                                    <p className="text-yellow-700 text-sm">
                                        This Geeko is currently marked as "Ready" and can be played by students. 
                                        Changes you make here will apply to future game sessions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
