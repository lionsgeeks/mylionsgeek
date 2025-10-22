import { BarChart3, Bell, BookOpen, Calendar, FolderOpen, LayoutDashboard, MessageSquare, Shield, Users, Zap } from 'lucide-react';
import React from 'react';

const Features = () => {
    const features =
        [
            {
                icon: LayoutDashboard,
                title: 'Personal Dashboard',
                desc: 'A personalized space for each student to track progress, access resources, and manage learning activities.'
            },
            {
                icon: BookOpen,
                title: 'Learning Materials',
                desc: 'Access curated courses, tutorials, and project files for both Full-Stack Development and Media Creation tracks.'
            },
            {
                icon: FolderOpen,
                title: 'Project Showcase',
                desc: 'Upload and share your projects, explore others’ work, and get peer or mentor feedback in a creative environment.'
            },
            {
                icon: Users,
                title: 'Community & Collaboration',
                desc: 'Connect with fellow learners, join group discussions, and collaborate on real-world team projects.'
            },
            {
                icon: MessageSquare,
                title: 'Communication Hub',
                desc: 'Stay connected through built-in messaging, announcements, and group chats with mentors and classmates.'
            },
            {
                icon: BarChart3,
                title: 'Progress & Analytics',
                desc: 'Monitor your learning journey with visual dashboards showing course completion, skill growth, and achievements.'
            }


        ]
    return (
        <>
            <section id="features" className="py-24 bg-neutral-50 dark:bg-neutral-900/50 scroll-mt-16">
                <div className="mx-auto w-full px-4 md:max-w-7xl">
                    <div className="text-center space-y-4 mb-16">
                        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-800 px-4 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400">
                            <Zap className="w-3 h-3 text-amber-400" />
                            Powerful Features
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white">Everything you need in one place</h2>
                        <p className="max-w-2xl mx-auto text-neutral-600 dark:text-neutral-400">Streamline your educational operations with our comprehensive platform designed for modern learning environments.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <div key={idx} className="group p-6 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 hover:border-amber-400 dark:hover:border-amber-400 transition-all hover:shadow-xl hover:scale-105">
                                <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center mb-4 group-hover:bg-amber-400 transition-colors">
                                    <feature.icon color={'#000'} className="w-6 h-6 text-amber-600 dark:text-amber-400 transition-colors" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-white">{feature.title}</h3>
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