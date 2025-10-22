import React from 'react';

const HowItWorks = () => {
    const items = [
        {
            step: '01',
            title: 'Receive Your Access',
            desc: 'After passing the Jungle challenge, you’ll receive your MyLionsGeek login credentials directly from the LionsGeek team.'
        },
        {
            step: '02',
            title: 'Log In & Set Up',
            desc: 'Sign in with your provided credentials, update your profile, and explore your personal learning dashboard.'
        },
        {
            step: '03',
            title: 'Start Learning & Sharing',
            desc: 'Access your materials, manage your projects, and collaborate with your peers and mentors inside MyLionsGeek.'
        }
    ]
    return (
        <>
            <section id="how-it-works" className="py-24 scroll-mt-16 bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 transition-colors">
                <div className="mx-auto w-full px-4 md:max-w-6xl">
                    {/* Header */}
                    <div className="text-center space-y-4 mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white">
                            How MyLionsGeek Works
                        </h2>
                        <p className="max-w-2xl mx-auto text-neutral-600 dark:text-neutral-400">
                            From your Jungle success to your personal learning space — here’s how you join and grow inside MyLionsGeek.
                        </p>
                    </div>

                    {/* Steps */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {items.map((item, idx) => (
                            <div
                                key={idx}
                                className="relative bg-white dark:bg-neutral-900 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 border border-neutral-100 dark:border-neutral-800"
                            >
                                {/* Connector Line */}
                                {idx < items.length - 1 && (
                                    <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-alpha to-transparent"></div>
                                )}

                                {/* Step Number */}
                                <div className="text-6xl font-extrabold text-alpha mb-4 select-none">
                                    {item.step}
                                </div>

                                {/* Title & Description */}
                                <h3 className="text-2xl font-semibold mb-3 text-neutral-900 dark:text-white">
                                    {item.title}
                                </h3>
                                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </>
    );
};

export default HowItWorks;