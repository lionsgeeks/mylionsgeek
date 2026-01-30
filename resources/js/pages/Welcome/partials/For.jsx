import { BookOpen, CheckCircle, Users } from 'lucide-react';

const For = () => {
    const students = [
        'Access learning materials and resources for your program',
        'Mark your attendance directly from your personal dashboard',
        'Upload and share your creative or development projects',
        'Collaborate with peers and mentors through dedicated spaces',
        'Track your progress and stay updated with announcements',
    ];

    const staff = [
        'Manage students and oversee their progress efficiently',
        'Organize and monitor studio and equipment reservations',
        'Track and validate student attendance records',
        'Upload and update course materials and resources',
        'Coordinate team operations and manage shared assets like cameras or studios',
    ];

    return (
        <>
            <section id="benefits" className="scroll-mt-16 bg-neutral-50 py-24 dark:bg-neutral-900/50">
                <div className="mx-auto w-full px-4 md:max-w-7xl">
                    <div className="grid gap-12 md:grid-cols-2">
                        <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50 p-8 dark:border-amber-800 dark:from-amber-950/30 dark:to-amber-900/20">
                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-alpha">
                                <BookOpen className="h-7 w-7 text-black" />
                            </div>
                            <h3 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-white">For Students</h3>
                            <ul className="space-y-3">
                                {students.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-neutral-700 dark:text-neutral-300">
                                        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-alpha" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="rounded-3xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-neutral-100/50 p-8 dark:border-neutral-700 dark:from-neutral-900/30 dark:to-neutral-800/20">
                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 dark:bg-white">
                                <Users className="h-7 w-7 text-white dark:text-black" />
                            </div>
                            <h3 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-white">For Staff</h3>
                            <ul className="space-y-3">
                                {staff.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-neutral-700 dark:text-neutral-300">
                                        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-neutral-600 dark:text-neutral-400" />
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
