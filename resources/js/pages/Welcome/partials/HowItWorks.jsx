const HowItWorks = () => {
    const items = [
        {
            step: '01',
            title: 'Receive Your Access',
            desc: 'After passing the Jungle challenge, you’ll receive your MyLionsGeek login credentials directly from the LionsGeek team.',
        },
        {
            step: '02',
            title: 'Log In & Set Up',
            desc: 'Sign in with your provided credentials, update your profile, and explore your personal learning dashboard.',
        },
        {
            step: '03',
            title: 'Start Learning & Sharing',
            desc: 'Access your materials, manage your projects, and collaborate with your peers and mentors inside MyLionsGeek.',
        },
    ];
    return (
        <>
            <section
                id="how-it-works"
                className="scroll-mt-16 bg-gradient-to-b from-white to-neutral-50 py-24 transition-colors dark:from-neutral-900 dark:to-neutral-950"
            >
                <div className="mx-auto w-full px-4 md:max-w-6xl">
                    {/* Header */}
                    <div className="mb-16 space-y-4 text-center">
                        <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl dark:text-white">How MyLionsGeek Works</h2>
                        <p className="mx-auto max-w-2xl text-neutral-600 dark:text-neutral-400">
                            From your Jungle success to your personal learning space — here’s how you join and grow inside MyLionsGeek.
                        </p>
                    </div>

                    {/* Steps */}
                    <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
                        {items.map((item, idx) => (
                            <div
                                key={idx}
                                className="relative rounded-2xl border border-neutral-100 bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                            >
                                {/* Connector Line */}
                                {idx < items.length - 1 && (
                                    <div className="absolute top-12 left-full hidden h-0.5 w-full bg-gradient-to-r from-alpha to-transparent md:block"></div>
                                )}

                                {/* Step Number */}
                                <div className="mb-4 text-6xl font-extrabold text-alpha select-none">{item.step}</div>

                                {/* Title & Description */}
                                <h3 className="mb-3 text-2xl font-semibold text-neutral-900 dark:text-white">{item.title}</h3>
                                <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default HowItWorks;
