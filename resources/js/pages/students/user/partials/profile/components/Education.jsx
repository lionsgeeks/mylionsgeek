import { usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import CreateEducationModal from '../../../../../../components/CreateEducationModal';

const Education = ({ user }) => {
    const { auth } = usePage().props
    const [openModal, setOpenModal] = useState(false)
    return (
        <>
            <div className="bg-white dark:bg-beta rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-beta dark:text-light">Education</h2>
                    {auth.user.id == user.id &&
                        <button onClick={() => setOpenModal(true)} className="p-1 hover:bg-beta/5 dark:hover:bg-light/5 rounded">
                            <Plus className="w-4 h-4 text-beta/70 dark:text-light/70" />
                        </button>}
                </div>

                <div className="flex gap-3">
                    <div className="w-12 h-12 rounded bg-alpha flex items-center justify-center text-beta font-bold flex-shrink-0">
                        UM
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-beta dark:text-light">Bachelor's Degree in Computer Science</h3>
                        <p className="text-sm text-beta/70 dark:text-light/70">University of Morocco</p>
                        <p className="text-xs text-beta/60 dark:text-light/60 mt-1">2019 - 2022</p>
                        <p className="text-sm text-beta/80 dark:text-light/80 mt-2">
                            Focused on web development, software engineering, and database management.
                            Graduated with honors.
                        </p>
                    </div>
                </div>
            </div>
            {openModal && <CreateEducationModal onOpen={openModal} onOpenChange={setOpenModal} />}
        </>
    );
};

export default Education;