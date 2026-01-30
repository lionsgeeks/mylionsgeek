import { Award, Calendar, Clock, Users } from 'lucide-react';

const Impact = () => {
    const items = [
        { icon: Users, value: '2,500+', label: 'Active Users' },
        { icon: Calendar, value: '15k+', label: 'Sessions Scheduled' },
        { icon: Award, value: '98%', label: 'Satisfaction Rate' },
        { icon: Clock, value: '24/7', label: 'Platform Uptime' },
    ];
    return (
        <>
            <section id="impact" className="scroll-mt-16 py-24">
                <div className="mx-auto w-full px-4 md:max-w-7xl">
                    <div className="mb-16 space-y-4 text-center">
                        <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl dark:text-white">Making an impact</h2>
                        <p className="mx-auto max-w-2xl text-neutral-600 dark:text-neutral-400">
                            Numbers that speak to our commitment to excellence in digital education.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                        {items.map((stat, idx) => (
                            <div
                                key={idx}
                                className="rounded-2xl border border-neutral-200 bg-white p-6 text-center transition-all hover:scale-105 hover:border-alpha dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-alpha"
                            >
                                <stat.icon className="mx-auto mb-3 h-8 w-8 text-alpha" />
                                <div className="mb-1 text-3xl font-bold text-neutral-900 dark:text-white">{stat.value}</div>
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
