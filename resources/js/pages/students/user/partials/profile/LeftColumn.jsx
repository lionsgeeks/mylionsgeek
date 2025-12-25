import React, { useState } from 'react';
import { Edit2, ExternalLink } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { helpers } from '../../../../../components/utils/helpers';
import AboutModal from '../../../../../components/AboutModal';

const LeftColumn = ({ user }) => {
    const [openAbout, setOpenAbout] = useState(false)
    const { auth } = usePage().props
    return (
        <>
            <div className="lg:col-span-1 space-y-4">
                {/* About Card */}
                <div className="bg-white dark:bg-dark_gray rounded-lg shadow p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-beta dark:text-light">About</h2>
                        <button className="p-1 hover:bg-beta/5 dark:hover:bg-light/5 rounded">
                            {
                                auth?.user.id == user?.id && <Edit2 onClick={() => setOpenAbout(true)} className="w-4 h-4 text-beta/70 dark:text-light/70" />
                            }
                        </button>
                    </div>
                    <p className="text-sm break-words whitespace-pre-wrap text-beta/80 dark:text-light/80">
                        {user.about}
                    </p>
                </div>

                {/* Skills Card */}
                <div className="bg-white dark:bg-dark_gray rounded-lg shadow p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-beta dark:text-light">Badges</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">

                    </div>
                </div>

                {/* Contact Info Card */}
                <div className="bg-white dark:bg-dark_gray rounded-lg shadow p-4">
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
            {openAbout && <AboutModal onOpen={openAbout} onOpenChange={setOpenAbout} user={user} />}
        </>
    );
};

export default LeftColumn;