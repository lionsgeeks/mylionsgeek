import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { helpers } from './utils/helpers';
import { useForm } from '@inertiajs/react';

export default function AboutModal({ onOpen, onOpenChange, user }) {
    const { stopScrolling, updateAbout } = helpers()
    const { data, setData, post, processing, errors } = useForm({
        about: user?.about || '',
    });
    const [charCount, setCharCount] = useState(data.about.length);

    useEffect(() => {
        stopScrolling(onOpen)
        return () => stopScrolling(false);
    }, [onOpen]);
    const maxChars = 500;

    const handleAboutChange = (e) => {
        const text = e.target.value;
        setData('about', text);
        setCharCount(text.length);
    };

    return (
        <>
            <div onClick={() => onOpenChange(false)} className="fixed inset-0 h-full z-30 bg-black/50 dark:bg-black/70 backdrop-blur-md transition-all duration-300">
            </div>
            <div className="fixed inset-0 h-fit mx-auto w-[70%] bg-light dark:bg-beta rounded-lg top-1/2 -translate-y-1/2 z-50 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-light dark:bg-beta border-b border-gray-300 dark:border-dark_gray px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-beta dark:text-light">Edit about</h2>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="text-gray-600 dark:text-gray-400 hover:text-beta dark:hover:text-light transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6 flex-1 overflow-y-auto bg-light dark:bg-beta">
                    {/* Helper Text */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        You can write about your years of experience, industry, or skills. People also talk about their achievements or previous job experiences.
                    </p>

                    {/* About Textarea */}
                    <div className="mb-2">
                        <textarea
                            value={data.about}
                            onChange={handleAboutChange}
                            className="w-full p-3 border border-gray-300 dark:border-dark_gray rounded-md outline-none focus:border-alpha focus:ring-1 focus:ring-alpha text-sm text-beta dark:text-light bg-white dark:bg-dark resize-none"
                            rows="10"
                            placeholder="Write about yourself..."
                        />
                        {errors.about && (
                            <p className="text-error text-xs">
                                {errors.about}
                            </p>
                        )}
                    </div>

                    {/* Character Count */}
                    <div className="text-right text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {charCount}/{maxChars}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-light dark:bg-beta border-t border-gray-300 dark:border-dark_gray px-6 py-4 flex justify-end">
                    <button
                        onClick={() => updateAbout(user?.id, data.about, onOpenChange)}
                        className="px-6 py-2 bg-alpha text-beta rounded-full hover:bg-alpha/90 transition font-medium"
                    >
                        Save
                    </button>
                </div>
            </div>
        </>
    );
}