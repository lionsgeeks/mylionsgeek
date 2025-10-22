import { CheckCircle } from 'lucide-react';
import React from 'react';
import HeroImg from '../../../../../public/assets/images/landing-page.svg';
import { Link } from '@inertiajs/react';

const Hero = () => {
    return (
        <>
            <section id="home" className="relative overflow-hidden scroll-mt-16">
                <div className="mx-auto grid min-h-[80vh] w-full items-center gap-12 px-4 py-20 md:max-w-7xl md:grid-cols-2">
                    <div className="relative z-10 space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-800 px-4 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400">
                            <span className="inline-block w-2 h-2 rounded-full bg-alpha animate-pulse" />
                            Platform Management Made Simple
                        </div>
                        <h1 className="text-4xl font-bold leading-tight sm:text-6xl bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-700 dark:from-white dark:via-neutral-200 dark:to-neutral-400 bg-clip-text text-transparent">
                            Manage Students & Staff Seamlessly
                        </h1>
                        <p className="max-w-xl text-lg text-neutral-600 dark:text-neutral-400">
                            The all-in-one platform for LionsGeek's digital learning ecosystem. Schedule classes, track progress, manage resources, and collaborate effortlessly.
                        </p>
                        <ul className="grid max-w-lg grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                            <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-alpha" />
                                Real-time scheduling
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-alpha" />
                                Attendance tracking
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-alpha" />
                                Performance analytics
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-alpha" />
                                Instant notifications
                            </li>
                        </ul>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <Link href={'/login'}>
                                <button className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium bg-alpha text-black border-2 border-transparent transition-all hover:bg-[#2f343a] hover:text-white">
                                    Get Started
                                </button>
                            </Link>
                        </div>
                        <div className="grid grid-cols-3 gap-6 pt-8 border-t border-neutral-200 dark:border-neutral-800">
                            <div>
                                <div className="text-3xl font-bold text-neutral-900 dark:text-white">2.5k+</div>
                                <div className="text-sm text-neutral-600 dark:text-neutral-400">Active Students</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-neutral-900 dark:text-white">150+</div>
                                <div className="text-sm text-neutral-600 dark:text-neutral-400">Staff Members</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-neutral-900 dark:text-white">98%</div>
                                <div className="text-sm text-neutral-600 dark:text-neutral-400">Satisfaction</div>
                            </div>
                        </div>
                    </div>
                    <div className="relative z-10 flex items-center justify-center">
                        <div className="relative w-full max-w-lg">
                            <div className="absolute inset-0 bg-gradient-to-br from-alpha/20 to-amber-600/20 rounded-3xl blur-3xl"></div>
                            <img
                                src={HeroImg}
                                alt="Platform Dashboard"
                                className="relative rounded-2xl shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Hero;