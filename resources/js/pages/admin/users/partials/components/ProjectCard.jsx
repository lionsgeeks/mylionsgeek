import { useState } from 'react';

export default function ProjectCard({ project, onView }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className="relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300 group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <img 
                src={`/storage/${project.image}`} 
                alt={project.title}
                className="w-full h-48 object-cover"
            />
            
            {isHovered && (
                <div className="absolute inset-0 bg-black/50 bg-opacity-70 flex items-center justify-center transition-all duration-300">
                    <button 
                        onClick={() => onView(project)}
                        className="px-6 py-2 bg-[var(--color-alpha)] text-black rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
                    >
                        View Project
                    </button>
                </div>
            )}
            
            <div className="p-4 bg-white dark:bg-neutral-800 border-t border-alpha/10">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {project.title}
                </h3>
            </div>
        </div>
    );
}
