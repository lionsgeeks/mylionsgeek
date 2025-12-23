import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import ExperienceModal from '../../../../../../components/ExperienceModal';

const Experience = () => {
    const [openModal, setOpenModal] = useState()
    return (
        <>
            <div className="bg-white dark:bg-beta rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-beta dark:text-light">Experience</h2>
                    <button onClick={() => setOpenModal(true)} className="p-1 hover:bg-beta/5 dark:hover:bg-light/5 rounded">
                        <Plus className="w-4 h-4 text-beta/70 dark:text-light/70" />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Experience Item 1 */}
                    <div className="flex gap-3">
                        <div className="w-12 h-12 rounded bg-alpha flex items-center justify-center text-beta font-bold flex-shrink-0">
                            FL
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-beta dark:text-light">Freelance Web Developer</h3>
                            <p className="text-sm text-beta/70 dark:text-light/70">Self-employed</p>
                            <p className="text-xs text-beta/60 dark:text-light/60 mt-1">Jan 2023 - Present · 1 yr 10 mos</p>
                            <p className="text-sm text-beta/80 dark:text-light/80 mt-2">
                                Building custom web applications for clients using React, Node.js, and modern web technologies.
                                Delivered 15+ projects ranging from e-commerce platforms to business management systems.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {openModal && <ExperienceModal onChange={openModal} onOpenChange={setOpenModal} />}
        </>
    );
};

export default Experience;