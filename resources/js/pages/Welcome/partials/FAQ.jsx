const Faq = () => {
    const faqs = [
        {
            q: 'How do I get access to MyLionsGeek?',
            a: 'Access is granted automatically after you pass the Jungle challenge. You’ll receive your login credentials from the LionsGeek team via email.',
        },
        {
            q: 'Can I create my own account?',
            a: 'No. Only accepted students and staff members receive accounts. If you haven’t joined LionsGeek yet, apply for the next Jungle session.',
        },
        {
            q: 'What can I do inside MyLionsGeek?',
            a: 'Students can mark attendance, access resources, and share projects. Staff can manage materials, monitor student progress, and handle studio or equipment reservations.',
        },
        {
            q: 'Who do I contact for technical issues?',
            a: 'You can reach out to the LionsGeek support team directly through the Help section inside the platform or by email at support@lionsgeek.com.',
        },
    ];
    return (
        <>
            <section className="relative overflow-hidden py-24">
                <div className="absolute inset-0 bg-transparent from-amber-500/10 via-transparent to-amber-600/10 dark:bg-gradient-to-br"></div>

                <div className="relative z-10 mx-auto w-full px-4 md:max-w-5xl">
                    <div className="mb-12 space-y-6 text-center">
                        <h2 className="text-3xl font-bold text-beta sm:text-5xl dark:text-white">Frequently Asked Questions</h2>
                        <p className="mx-auto max-w-2xl text-lg text-beta dark:text-white">
                            Everything you need to know about using MyLionsGeek — from accessing your account to managing your learning space.
                        </p>
                    </div>

                    {/* FAQ Items */}
                    <div className="space-y-6">
                        {faqs.map((faq, idx) => (
                            <div
                                key={idx}
                                className="rounded-2xl border border-neutral-700 bg-neutral-50 p-6 transition-all dark:bg-neutral-800/50 dark:hover:bg-neutral-800"
                            >
                                <h3 className="mb-2 text-xl font-semibold text-beta dark:text-white">{faq.q}</h3>
                                <p className="leading-relaxed text-beta dark:text-white">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default Faq;
