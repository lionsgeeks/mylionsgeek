import React from 'react';
import logo from '../../../../../../public/assets/images/logolionsgeek.png'
import { Link } from '@inertiajs/react';

const Footer = () => {
    return (
        <>
            <div className="border-t border-neutral-200 dark:border-neutral-800 py-12 bg-white dark:bg-neutral-900 transition-colors duration-300">
                <div className="mx-auto w-full px-4 md:max-w-7xl">

                    {/* Footer Content */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">

                        {/* Left Section */}
                        <div className="flex lg:flex-row flex-col items-center gap-3">
                            <div className="flex lg:flex-row flex-col items-center gap-2">
                                <img
                                    src={logo}
                                    alt="LionsGeek Logo"
                                    className="w-8 h-8 object-contain rounded-md p-1 dark:invert"
                                />
                                <span className="font-semibold text-lg text-neutral-900 dark:text-white tracking-tight">
                                    LionsGeek
                                </span>
                            </div>
                            <span className="text-sm text-neutral-600 dark:text-neutral-400 ml-3">
                                © {new Date().getFullYear()} LionsGeek. All rights reserved.
                            </span>
                        </div>

                        {/* Social Links */}
                        <div className="flex gap-6">
                            {[
                                { name: "Instagram", href: "https://www.instagram.com/lions_geek/" },
                                { name: "LinkedIn", href: "https://www.linkedin.com/company/lionsgeek/posts/?feedView=all" },
                                { name: "YouTube", href: "https://www.youtube.com/@lionsgeek_MA" },
                            ].map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    target='_blank'
                                    className="text-neutral-600 dark:text-neutral-400 hover:text-alpha dark:hover:text-amber-300 transition-colors duration-300 text-sm font-medium"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>


        </>
    );
};

export default Footer;