import { BarChart3, BookOpen, FolderOpen, LayoutDashboard, MessageSquare, Users, Zap } from 'lucide-react';

const Features = () => {
    const features = [
        {
            icon: LayoutDashboard,
            title: 'Personal Dashboard',
            desc: 'A personalized space for each student to track progress, access resources, and manage learning activities.',
        },
        {
            icon: BookOpen,
            title: 'Learning Materials',
            desc: 'Access curated courses, tutorials, and project files for both Full-Stack Development and Media Creation tracks.',
        },
        {
            icon: FolderOpen,
            title: 'Project Showcase',
            desc: 'Upload and share your projects, explore others’ work, and get peer or mentor feedback in a creative environment.',
        },
        {
            icon: Users,
            title: 'Community & Collaboration',
            desc: 'Connect with fellow learners, join group discussions, and collaborate on real-world team projects.',
        },
        {
            icon: MessageSquare,
            title: 'Communication Hub',
            desc: 'Stay connected through built-in messaging, announcements, and group chats with mentors and classmates.',
        },
        {
            icon: BarChart3,
            title: 'Progress & Analytics',
            desc: 'Monitor your learning journey with visual dashboards showing course completion, skill growth, and achievements.',
        },
    ];
    return (
        <>
            <section id="features" className="scroll-mt-16 bg-neutral-50 py-24 dark:bg-neutral-900/50">
                <div className="mx-auto w-full px-4 md:max-w-7xl">
                    <div className="mb-16 space-y-4 text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-1.5 text-xs font-medium text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
                            <Zap className="h-3 w-3 text-alpha" />
                            Powerful Features
                        </div>
                        <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl dark:text-white">Everything you need in one place</h2>
                        <p className="mx-auto max-w-2xl text-neutral-600 dark:text-neutral-400">
                            Streamline your educational operations with our comprehensive platform designed for modern learning environments.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, idx) => (
                            <div
                                key={idx}
                                className="group rounded-2xl border border-neutral-200 bg-white p-6 transition-all hover:scale-105 hover:border-alpha hover:shadow-xl dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-alpha"
                            >
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-alpha/10 transition-colors group-hover:bg-alpha">
                                    <feature.icon color={'#000'} className="h-6 w-6 text-amber-600 transition-colors dark:text-alpha" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">{feature.title}</h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default Features;
