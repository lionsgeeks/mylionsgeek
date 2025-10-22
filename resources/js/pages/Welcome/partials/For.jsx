import { BookOpen, CheckCircle, Users } from 'lucide-react';
import React from 'react';

const For = () => {
    const students = [
        'Access learning materials and resources for your program',
        'Mark your attendance directly from your personal dashboard',
        'Upload and share your creative or development projects',
        'Collaborate with peers and mentors through dedicated spaces',
        'Track your progress and stay updated with announcements'
    ];

    const staff = [
        'Manage students and oversee their progress efficiently',
        'Organize and monitor studio and equipment reservations',
        'Track and validate student attendance records',
        'Upload and update course materials and resources',
        'Coordinate team operations and manage shared assets like cameras or studios'
    ];

    return (
        <>
            <section id="benefits" className="py-24 bg-neutral-50 dark:bg-neutral-900/50 scroll-mt-16">
                <div className="mx-auto w-full px-4 md:max-w-7xl">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="p-8 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 rounded-3xl border border-amber-200 dark:border-amber-800">
                            <div className="w-14 h-14 rounded-2xl bg-amber-400 flex items-center justify-center mb-6">
                                <BookOpen className="w-7 h-7 text-black" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-white">For Students</h3>
                            <ul className="space-y-3">
                                {students.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-neutral-700 dark:text-neutral-300">
                                        <CheckCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-8 bg-gradient-to-br from-neutral-50 to-neutral-100/50 dark:from-neutral-900/30 dark:to-neutral-800/20 rounded-3xl border border-neutral-200 dark:border-neutral-700">
                            <div className="w-14 h-14 rounded-2xl bg-neutral-900 dark:bg-white flex items-center justify-center mb-6">
                                <Users className="w-7 h-7 text-white dark:text-black" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-white">For Staff</h3>
                            <ul className="space-y-3">
                                {staff.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-neutral-700 dark:text-neutral-300">
                                        <CheckCircle className="w-5 h-5 text-neutral-600 dark:text-neutral-400 mt-0.5 flex-shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default For;