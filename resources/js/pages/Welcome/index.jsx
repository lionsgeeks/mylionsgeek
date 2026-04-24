import { useEffect, useState } from 'react';
import Faq from './partials/FAQ';
import Features from './partials/Features';
import For from './partials/For';
import Hero from './partials/Hero';
import HowItWorks from './partials/HowItWorks';
import Impact from './partials/Impact';
import Footer from './partials/layouts/Footer';
import Navbar from './partials/layouts/Navbar';

export default function LionsGeekLanding({ users, staf }) {
    console.log(users, staf);
    const [darkMode, setDarkMode] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setMobileMenuOpen(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
            {/* Dark mode gradient overlays */}
            <div className="pointer-events-none fixed inset-0 -z-10 hidden dark:block" aria-hidden="true">
                <div className="absolute -top-40 -left-40 h-[560px] w-[560px] rounded-full bg-amber-500/20 blur-3xl" />
                <div className="absolute top-1/4 left-1/3 h-[560px] w-[560px] rounded-full bg-alpha/15 blur-3xl" />
                <div className="absolute right-[-10%] bottom-[-10%] h-[680px] w-[680px] rounded-full bg-amber-500/25 blur-3xl" />
            </div>

            {/* Header */}
            <Navbar
                scrollToSection={scrollToSection}
                setDarkMode={setDarkMode}
                darkMode={darkMode}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            <main>
                {/* Hero Section */}
                <Hero users={users} staf={staf} />

                {/* Features Section */}
                <Features />

                {/* How It Works Section */}
                <HowItWorks />

                {/* For Students & Staff Section */}
                <For />

                {/* Stats/Impact Section */}
                <Impact users={users} />

                {/* CTA Section */}
                <Faq />
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
