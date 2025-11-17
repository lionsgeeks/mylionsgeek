import React from 'react';
import { Plus } from 'lucide-react';

const RightColumn = ({ user }) => {
    return (
        <>
            <div className="lg:col-span-2 space-y-4">
                {/* Experience Card */}
                <div className="bg-white dark:bg-beta rounded-lg shadow p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-beta dark:text-light">Experience</h2>
                        <button className="p-1 hover:bg-beta/5 dark:hover:bg-light/5 rounded">
                            <Plus className="w-4 h-4 text-beta/70 dark:text-light/70" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Experience Item 1 */}
                        <div className="flex gap-3">
                            <div className="w-12 h-12 rounded bg-alpha flex items-center justify-center text-beta font-bold flex-shrink-0">
                                FL
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-beta dark:text-light">Freelance Web Developer</h3>
                                <p className="text-sm text-beta/70 dark:text-light/70">Self-employed</p>
                                <p className="text-xs text-beta/60 dark:text-light/60 mt-1">Jan 2023 - Present · 1 yr 10 mos</p>
                                <p className="text-sm text-beta/80 dark:text-light/80 mt-2">
                                    Building custom web applications for clients using React, Node.js, and modern web technologies.
                                    Delivered 15+ projects ranging from e-commerce platforms to business management systems.
                                </p>
                            </div>
                        </div>

                        {/* Experience Item 2 */}
                        <div className="flex gap-3 pt-4 border-t-2 border-beta/10 dark:border-light/10">
                            <div className="w-12 h-12 rounded bg-good flex items-center justify-center text-white font-bold flex-shrink-0">
                                IT
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-beta dark:text-light">Intern Developer</h3>
                                <p className="text-sm text-beta/70 dark:text-light/70">Tech Solutions Inc.</p>
                                <p className="text-xs text-beta/60 dark:text-light/60 mt-1">Jun 2022 - Dec 2022 · 7 mos</p>
                                <p className="text-sm text-beta/80 dark:text-light/80 mt-2">
                                    Assisted in developing web applications and learned best practices in software development.
                                    Worked with senior developers on real-world projects.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Education Card */}
                <div className="bg-white dark:bg-beta rounded-lg shadow p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-beta dark:text-light">Education</h2>
                        <button className="p-1 hover:bg-beta/5 dark:hover:bg-light/5 rounded">
                            <Plus className="w-4 h-4 text-beta/70 dark:text-light/70" />
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <div className="w-12 h-12 rounded bg-alpha flex items-center justify-center text-beta font-bold flex-shrink-0">
                            UM
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-beta dark:text-light">Bachelor's Degree in Computer Science</h3>
                            <p className="text-sm text-beta/70 dark:text-light/70">University of Morocco</p>
                            <p className="text-xs text-beta/60 dark:text-light/60 mt-1">2019 - 2022</p>
                            <p className="text-sm text-beta/80 dark:text-light/80 mt-2">
                                Focused on web development, software engineering, and database management.
                                Graduated with honors.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Projects Card */}
                <div className="bg-white dark:bg-beta rounded-lg shadow p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-beta dark:text-light">Featured Projects</h2>
                        <button className="p-1 hover:bg-beta/5 dark:hover:bg-light/5 rounded">
                            <Plus className="w-4 h-4 text-beta/70 dark:text-light/70" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Project 1 */}
                        <div className="border-2 border-beta/20 dark:border-light/20 rounded-lg p-3 hover:border-alpha dark:hover:border-alpha transition-colors">
                            <h3 className="font-semibold text-beta dark:text-light">E-Commerce Platform</h3>
                            <p className="text-sm text-beta/80 dark:text-light/80 mt-1">
                                Full-stack e-commerce solution with payment integration, cart management, and admin dashboard.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <span className="px-2 py-1 bg-beta/10 dark:bg-light/10 text-beta dark:text-light rounded text-xs">React</span>
                                <span className="px-2 py-1 bg-beta/10 dark:bg-light/10 text-beta dark:text-light rounded text-xs">Node.js</span>
                                <span className="px-2 py-1 bg-beta/10 dark:bg-light/10 text-beta dark:text-light rounded text-xs">MongoDB</span>
                            </div>
                        </div>

                        {/* Project 2 */}
                        <div className="border-2 border-beta/20 dark:border-light/20 rounded-lg p-3 hover:border-alpha dark:hover:border-alpha transition-colors">
                            <h3 className="font-semibold text-beta dark:text-light">Task Management App</h3>
                            <p className="text-sm text-beta/80 dark:text-light/80 mt-1">
                                Modern task management application with real-time updates and team collaboration features.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <span className="px-2 py-1 bg-beta/10 dark:bg-light/10 text-beta dark:text-light rounded text-xs">React</span>
                                <span className="px-2 py-1 bg-beta/10 dark:bg-light/10 text-beta dark:text-light rounded text-xs">Firebase</span>
                                <span className="px-2 py-1 bg-beta/10 dark:bg-light/10 text-beta dark:text-light rounded text-xs">Tailwind</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RightColumn;