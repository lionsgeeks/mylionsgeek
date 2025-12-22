import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { helpers } from './utils/helpers';

export default function AboutModal({ onOpen, onOpenChange, user }) {
    const [about, setAbout] = useState(`I'm a passionate web developer focused on crafting clean, performant, and user-friendly web applications. With hands-on experience in modern front-end development, I specialize in HTML5, CSS3, JavaScript (ES6+), Bootstrap, and Tailwind CSS, along with Sass for scalable styling. I'm also proficient in Bash scripting for automation and Framer Motion for building smooth, interactive UI animations in React.js.

🏆 I thrive on turning ideas into responsive digital experiences and continuously seek opportunities to deepen my full-stack development knowledge. My goal is to transition into a Software Development Engineer role where I can contribute to meaningful, real-world projects while evolving with emerging technologies.`);
    const [charCount, setCharCount] = useState(about.length);
    const { stopScrolling, updateAbout } = helpers()

    useEffect(() => {
        stopScrolling(onOpen)
        return () => stopScrolling(false);
    }, [onOpen]);
    const maxChars = 2600;

    const handleAboutChange = (e) => {
        const text = e.target.value;
        setAbout(text);
        setCharCount(text.length);
    };

    return (
        <>
            <div onClick={() => onOpenChange(false)} className="fixed inset-0 h-full z-30 bg-black/50 backdrop-blur-md transition-all duration-300">
            </div>
            <div className="fixed inset-0 h-fit mx-auto w-[70%] bg-white rounded-lg top-1/2 -translate-y-1/2 z-50 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Edit about</h2>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="text-gray-500 hover:text-gray-700 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6 flex-1 overflow-y-auto">
                    {/* Helper Text */}
                    <p className="text-sm text-gray-600 mb-4">
                        You can write about your years of experience, industry, or skills. People also talk about their achievements or previous job experiences.
                    </p>

                    {/* About Textarea */}
                    <div className="mb-2">
                        <textarea
                            value={about}
                            onChange={handleAboutChange}
                            className="w-full p-3 border border-gray-300 rounded-md outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-gray-900 resize-none"
                            rows="10"
                            placeholder="Write about yourself..."
                        />
                    </div>

                    {/* Character Count */}
                    <div className="text-right text-sm text-gray-600 mb-4">
                        {charCount}/{maxChars}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
                    <button
                        onClick={() => updateAbout(user?.id, about , onOpenChange)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition font-medium"
                    >
                        Save
                    </button>
                </div>
            </div>
        </>
    );
}