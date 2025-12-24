import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { helpers } from '../../../../../../components/utils/helpers';
import CreateExperienceModal from '../../../../../../components/CreateExperienceModal';
import { ExperienceMenuModal } from '../../../../../../components/ExperienceMenuModal';



const Experience = ({ user }) => {
    const { auth } = usePage().props
    const [openModal, setOpenModal] = useState()
    const { calculateDuration } = helpers()
    const getMonthName = (monthNumber) => {
        const date = new Date(2000, monthNumber - 1)
        return date.toLocaleString('en-US', { month: 'long' });
    }
    const experienceDurationFormat = (experience) => {
        console.log(experience);

        if (!experience) return '';

        const start = `${getMonthName(experience.start_month)} ${experience.start_year}`;

        if (!experience.end_month || !experience.end_year) {
            return `${start} - Present`;
        }

        const end = `${getMonthName(experience.end_month)} ${experience.end_year}`;
        return `${start} - ${end}`;
    };
    return (
        <>
            <div className="bg-white dark:bg-beta rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-beta dark:text-light">Experience</h2>
                    {
                        auth.user.id == user.id &&
                        <button onClick={() => setOpenModal(true)} className="p-1 hover:bg-beta/5 dark:hover:bg-light/5 rounded">
                            <Plus className="w-4 h-4 text-beta/70 dark:text-light/70" />
                        </button>
                    }
                </div>

                <div className="space-y-4">
                    {/* Experience Item 1 */}
                    {
                        user?.experiences?.map((experience, index) =>
                            <div key={index} className='w-full flex justify-between items-start'>
                                <div className="flex gap-3">
                                    <div className="w-12 h-12 rounded bg-alpha flex items-center justify-center text-beta font-bold flex-shrink-0">
                                        {experience?.company?.slice(0, 1)}
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="font-semibold text-beta dark:text-light">{experience?.title}</h2>
                                        <p className="text-[0.9rem] text-beta dark:text-light">{experience?.company} - {experience?.employement_type}</p>
                                        {/* <p className="text-sm text-beta/70 dark:text-light/70"></p> */}
                                        <p className="text-xs text-beta/60 dark:text-light/60 mt-1">{experienceDurationFormat(experience)} · {calculateDuration(experience)} - {experience?.location}</p>
                                        <p className="text-sm text-beta/80 dark:text-light/80 mt-2">{experience?.description}</p>
                                    </div>
                                </div>
                                <ExperienceMenuModal experience={experience} />
                            </div>
                        )
                    }
                </div>
            </div>
            {openModal && <CreateExperienceModal id={user} onChange={openModal} onOpenChange={setOpenModal} />}
        </>
    );
};

export default Experience;