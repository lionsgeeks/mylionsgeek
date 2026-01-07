import { usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import CreateEducationModal from '../../../../../../components/CreateEducationModal';
import { helpers } from '../../../../../../components/utils/helpers';
import { EducationMenuModal } from '../../../../../../components/EducationMenuModal';

const Education = ({ user }) => {
    //console.log(user);

    const { auth } = usePage().props
    const [openModal, setOpenModal] = useState(false)
    const [expandedEducation, setExpandedEducation] = useState([])
    const { calculateDuration } = helpers()

    const getMonthName = (monthNumber) => {
        const date = new Date(2000, monthNumber - 1)
        return date.toLocaleString('en-US', { month: 'long' });
    }
    const educationDurationFormat = (education) => {

        if (!education) return '';

        const start = `${getMonthName(education.start_month)} ${education.start_year}`;

        if (!education.end_month || !education.end_year) {
            return `${start} - Present`;
        }

        const end = `${getMonthName(education.end_month)} ${education.end_year}`;
        return `${start} - ${end}`;
    };
    return (
        <>
            <div className="bg-white dark:bg-dark_gray rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-beta dark:text-light">Education</h2>
                    {
                        auth.user.id == user.id &&
                        <button onClick={() => setOpenModal(true)} className="p-1 hover:bg-beta/5 dark:hover:bg-light/5 rounded">
                            <Plus className="w-4 h-4 text-beta/70 dark:text-light/70" />
                        </button>
                    }
                </div>

                <div className="space-y-4">
                    {/* Education Items */}
                    {
                        user.educations.length == 0 ?
                            <h2 className="py-5 w-full text-center text-beta dark:text-light">This user doesn't have any education</h2>
                            :
                            user?.educations?.map((education, index) =>
                                <div key={index} className='w-full flex justify-between items-start'>
                                    <div className="flex gap-3">
                                        <div className="w-12 h-12 rounded bg-alpha flex items-center justify-center text-beta font-bold flex-shrink-0">
                                            {education?.school?.slice(0, 1)}
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="font-semibold text-beta dark:text-light">{education?.school}</h2>
                                            <p className="text-[0.9rem] text-beta dark:text-light">
                                                {education?.degree}
                                                {education?.field_of_study && ` - ${education?.field_of_study}`}
                                            </p>
                                            <p className="text-xs text-beta/60 dark:text-light/60 mt-1">
                                                {educationDurationFormat(education)} · {calculateDuration(education)}
                                            </p>
                                            {(() => {
                                                const text = education?.description || '';
                                                const limit = 250;
                                                const isLong = text.length > limit;
                                                const id = education?.id ?? index;
                                                const isExpanded = expandedEducation.includes(id);
                                                const displayText = isLong && !isExpanded ? `${text.slice(0, limit)}...` : text;

                                                if (!text) return null;

                                                return (
                                                    <div className="mt-2">
                                                        <p className="text-sm text-beta/80 dark:text-light/80">{displayText}</p>
                                                        {isLong && (
                                                            <button
                                                                type="button"
                                                                className="mt-1 text-xs font-semibold text-alpha hover:underline"
                                                                onClick={() => {
                                                                    setExpandedEducation((prev) => {
                                                                        const has = prev.includes(id);
                                                                        if (has) return prev.filter((x) => x !== id);
                                                                        return [...prev, id];
                                                                    });
                                                                }}
                                                            >
                                                                {isExpanded ? 'See less' : 'See more'}
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                    {
                                        auth.user.id == user.id && <EducationMenuModal education={education} />
                                    }
                                </div>
                            )
                    }
                </div>
            </div>
            {openModal && <CreateEducationModal onOpen={openModal} onOpenChange={setOpenModal} />}
        </>
    );
};

export default Education;