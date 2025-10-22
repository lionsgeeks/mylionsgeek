import { Award, Calendar, Clock, Users } from 'lucide-react';
import React from 'react';

const Impact = () => {
    const items = [
        { icon: Users, value: '2,500+', label: 'Active Users' },
        { icon: Calendar, value: '15k+', label: 'Sessions Scheduled' },
        { icon: Award, value: '98%', label: 'Satisfaction Rate' },
        { icon: Clock, value: '24/7', label: 'Platform Uptime' }
    ]
    return (
        <>
            <section id="impact" className="py-24 scroll-mt-16">
                <div className="mx-auto w-full px-4 md:max-w-7xl">
                    <div className="text-center space-y-4 mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white">Making an impact</h2>
                        <p className="max-w-2xl mx-auto text-neutral-600 dark:text-neutral-400">Numbers that speak to our commitment to excellence in digital education.</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {items.map((stat, idx) => (
                            <div key={idx} className="text-center p-6 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 hover:border-amber-400 dark:hover:border-amber-400 transition-all hover:scale-105">
                                <stat.icon className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                                <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">{stat.value}</div>
                                <div className="text-sm text-neutral-600 dark:text-neutral-400">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default Impact;