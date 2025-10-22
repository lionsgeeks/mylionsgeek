import React from 'react';

const Faq = () => {
    const faqs = [
        {
            q: 'How do I get access to MyLionsGeek?',
            a: 'Access is granted automatically after you pass the Jungle challenge. You’ll receive your login credentials from the LionsGeek team via email.'
        },
        {
            q: 'Can I create my own account?',
            a: 'No. Only accepted students and staff members receive accounts. If you haven’t joined LionsGeek yet, apply for the next Jungle session.'
        },
        {
            q: 'What can I do inside MyLionsGeek?',
            a: 'Students can mark attendance, access resources, and share projects. Staff can manage materials, monitor student progress, and handle studio or equipment reservations.'
        },
        {
            q: 'Who do I contact for technical issues?',
            a: 'You can reach out to the LionsGeek support team directly through the Help section inside the platform or by email at support@lionsgeek.com.'
        }
    ]
    return (
        <>
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 dark:bg-gradient-to-br from-amber-500/10 bg-transparent  via-transparent to-amber-600/10"></div>

                <div className="mx-auto w-full px-4 md:max-w-5xl relative z-10">
                    <div className="text-center space-y-6 mb-12">
                        <h2 className="text-3xl sm:text-5xl font-bold dark:text-white text-beta ">Frequently Asked Questions</h2>
                        <p className="text-lg dark:text-white text-beta max-w-2xl mx-auto">
                            Everything you need to know about using MyLionsGeek — from accessing your account to managing your learning space.
                        </p>
                    </div>

                    {/* FAQ Items */}
                    <div className="space-y-6">
                        {faqs.map((faq, idx) => (
                            <div
                                key={idx}
                                className="p-6 dark:bg-neutral-800/50 bg-neutral-50 border border-neutral-700 rounded-2xl dark:hover:bg-neutral-800 transition-all"
                            >
                                <h3 className="text-xl font-semibold dark:text-white text-beta mb-2">{faq.q}</h3>
                                <p className="dark:text-white text-beta leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default Faq;