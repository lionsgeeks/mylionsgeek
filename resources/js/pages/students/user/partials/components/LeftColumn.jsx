import React from 'react';
import { Edit2, ExternalLink } from 'lucide-react';

const LeftColumn = ({ user }) => {
    return (
        <>
            <div className="lg:col-span-1 space-y-4">
                {/* About Card */}
                <div className="bg-white dark:bg-beta rounded-lg shadow p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-beta dark:text-light">About</h2>
                        <button className="p-1 hover:bg-beta/5 dark:hover:bg-light/5 rounded">
                            <Edit2 className="w-4 h-4 text-beta/70 dark:text-light/70" />
                        </button>
                    </div>
                    <p className="text-sm text-beta/80 dark:text-light/80 leading-relaxed">
                        {user.about}
                    </p>
                </div>

                {/* Skills Card */}
                <div className="bg-white dark:bg-beta rounded-lg shadow p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-beta dark:text-light">Badges</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">

                    </div>
                </div>

                {/* Contact Info Card */}
                <div className="bg-white dark:bg-beta rounded-lg shadow p-4">
                    <h2 className="text-lg font-semibold text-beta dark:text-light mb-3">Contact Info</h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <ExternalLink className="w-4 h-4 text-beta/70 dark:text-light/70" />
                            <a href="#" className="text-sm text-alpha hover:underline">
                                mohamedcamara.com
                            </a>
                        </div>
                        <div className="flex items-center gap-3">
                            <ExternalLink className="w-4 h-4 text-beta/70 dark:text-light/70" />
                            <a href="#" className="text-sm text-alpha hover:underline">
                                github.com/mohamedcamara
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LeftColumn;