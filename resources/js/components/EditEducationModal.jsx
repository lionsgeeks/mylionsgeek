import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { helpers } from './utils/helpers';
import { router, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';

const MONTHS = [
    { value: '', label: 'Month' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
];

// Generate years array (50 years back from current year)
const generateYears = () => {
    const currentYear = new Date().getFullYear();
    return [
        { value: '', label: 'Year' },
        ...Array.from({ length: 50 }, (_, i) => ({
            value: String(currentYear - i),
            label: String(currentYear - i)
        }))
    ];
};

const YEARS = generateYears();

const EditEducationModal = ({ onChange, onOpenChange, item }) => {
    const isEditMode = !!item?.id;
    const [currentlyStudying, setCurrentlyStudying] = useState(!item?.end_month && !item?.end_year);
    const [dateError, setDateError] = useState('');
    const { stopScrolling } = helpers();

    const { data, setData, processing, errors } = useForm({
        school: item?.school || '',
        degree: item?.degree || '',
        fieldOfStudy: item?.field_of_study || '',
        startMonth: item?.start_month || '',
        startYear: item?.start_year || '',
        endMonth: item?.end_month || '',
        endYear: item?.end_year || '',
        description: item?.description || '',
    });

    useEffect(() => {
        stopScrolling(onChange);
        return () => stopScrolling(false);
    }, [onChange]);

    // Validate date range
    useEffect(() => {
        if (!currentlyStudying && data.startMonth && data.startYear && data.endMonth && data.endYear) {
            const startDate = new Date(parseInt(data.startYear), parseInt(data.startMonth) - 1);
            const endDate = new Date(parseInt(data.endYear), parseInt(data.endMonth) - 1);

            if (startDate > endDate) {
                setDateError('End date must be after start date');
            } else {
                setDateError('');
            }
        } else {
            setDateError('');
        }
    }, [data.startMonth, data.startYear, data.endMonth, data.endYear, currentlyStudying]);

    // Clear end date when currently studying is checked
    useEffect(() => {
        if (currentlyStudying) {
            setData({
                ...data,
                endMonth: '',
                endYear: ''
            });
        }
    }, [currentlyStudying]);

    const editEducation = () => {
        // Check if there's a date validation error
        if (dateError) {
            return;
        }

        try {
            if (isEditMode) {
                // Update existing education
                router.put(`/users/education/${item.id}`, data, {
                    onSuccess: () => {
                        onOpenChange(false);
                    },
                    onError: (error) => {
                        console.log(error);
                    }
                });
            } else {
                // Create new education
                router.post('/users/education', data, {
                    onSuccess: () => {
                        onOpenChange(false);
                    },
                    onError: (error) => {
                        console.log(error);
                    }
                });
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleChange = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value
        });
    };

    return (
        <>
            <div onClick={() => onOpenChange(false)} className="fixed inset-0 h-full z-30 bg-black/50 dark:bg-black/70 backdrop-blur-md transition-all duration-300">
            </div>
            <div className="fixed inset-0 h-fit mx-auto w-[50%] bg-light dark:bg-beta rounded-lg top-1/2 -translate-y-1/2 z-50 overflow-hidden flex flex-col">
                <div className="bg-light dark:bg-dark w-full rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-light dark:bg-dark border-b border-beta/20 dark:border-light/10 p-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-beta dark:text-light">
                            {isEditMode ? 'Edit education' : 'Add education'}
                        </h2>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="text-beta/60 dark:text-light/60 hover:text-beta dark:hover:text-light transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* School */}
                        <div>
                            <label className="block text-sm font-medium text-beta dark:text-light mb-2">
                                School*
                            </label>
                            <input
                                type="text"
                                name="school"
                                value={data.school}
                                onChange={handleChange}
                                placeholder="Ex: Harvard University"
                                className="w-full px-3 py-2 bg-light dark:bg-dark_gray border border-beta/30 dark:border-light/20 rounded text-beta dark:text-light placeholder:text-beta/50 dark:placeholder:text-light/50 focus:outline-none focus:border-alpha focus:ring-1 focus:ring-alpha"
                            />
                            <InputError message={errors.school} className="mt-1" />
                        </div>

                        {/* Degree */}
                        <div>
                            <label className="block text-sm font-medium text-beta dark:text-light mb-2">
                                Degree
                            </label>
                            <input
                                type="text"
                                name="degree"
                                value={data.degree}
                                onChange={handleChange}
                                placeholder="Ex: Bachelor's"
                                className="w-full px-3 py-2 bg-light dark:bg-dark_gray border border-beta/30 dark:border-light/20 rounded text-beta dark:text-light placeholder:text-beta/50 dark:placeholder:text-light/50 focus:outline-none focus:border-alpha focus:ring-1 focus:ring-alpha"
                            />
                            <InputError message={errors.degree} className="mt-1" />
                        </div>

                        {/* Field of Study */}
                        <div>
                            <label className="block text-sm font-medium text-beta dark:text-light mb-2">
                                Field of study
                            </label>
                            <input
                                type="text"
                                name="fieldOfStudy"
                                value={data.fieldOfStudy}
                                onChange={handleChange}
                                placeholder="Ex: Computer Science"
                                className="w-full px-3 py-2 bg-light dark:bg-dark_gray border border-beta/30 dark:border-light/20 rounded text-beta dark:text-light placeholder:text-beta/50 dark:placeholder:text-light/50 focus:outline-none focus:border-alpha focus:ring-1 focus:ring-alpha"
                            />
                            <InputError message={errors.fieldOfStudy} className="mt-1" />
                        </div>

                        {/* Currently Studying Checkbox */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="currently-studying"
                                checked={currentlyStudying}
                                onChange={(e) => setCurrentlyStudying(e.target.checked)}
                                className="w-4 h-4 text-alpha bg-light dark:bg-dark_gray border-beta/30 dark:border-light/20 rounded focus:ring-alpha focus:ring-2"
                            />
                            <label htmlFor="currently-studying" className="text-sm text-beta dark:text-light cursor-pointer">
                                I am currently studying here
                            </label>
                        </div>

                        {/* Start Date */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-beta dark:text-light mb-2">
                                    Start date*
                                </label>
                                <select
                                    name="startMonth"
                                    value={data.startMonth}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-light dark:bg-dark_gray border border-beta/30 dark:border-light/20 rounded text-beta dark:text-light focus:outline-none focus:border-alpha focus:ring-1 focus:ring-alpha"
                                >
                                    {MONTHS.map((month) => (
                                        <option key={month.value} value={month.value}>
                                            {month.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.startMonth} className="mt-1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-beta dark:text-light mb-2 opacity-0">
                                    Year
                                </label>
                                <select
                                    name="startYear"
                                    value={data.startYear}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-light dark:bg-dark_gray border border-beta/30 dark:border-light/20 rounded text-beta dark:text-light focus:outline-none focus:border-alpha focus:ring-1 focus:ring-alpha"
                                >
                                    {YEARS.map((year) => (
                                        <option key={year.value} value={year.value}>
                                            {year.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.startYear} className="mt-1" />
                            </div>
                        </div>

                        {/* End Date */}
                        {!currentlyStudying && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-beta dark:text-light mb-2">
                                        End date (or expected)*
                                    </label>
                                    <select
                                        name="endMonth"
                                        value={data.endMonth}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-light dark:bg-dark_gray border border-beta/30 dark:border-light/20 rounded text-beta dark:text-light focus:outline-none focus:border-alpha focus:ring-1 focus:ring-alpha"
                                    >
                                        {MONTHS.map((month) => (
                                            <option key={month.value} value={month.value}>
                                                {month.label}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.endMonth} className="mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-beta dark:text-light mb-2 opacity-0">
                                        Year
                                    </label>
                                    <select
                                        name="endYear"
                                        value={data.endYear}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-light dark:bg-dark_gray border border-beta/30 dark:border-light/20 rounded text-beta dark:text-light focus:outline-none focus:border-alpha focus:ring-1 focus:ring-alpha"
                                    >
                                        {YEARS.map((year) => (
                                            <option key={year.value} value={year.value}>
                                                {year.label}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.endYear} className="mt-1" />
                                </div>
                            </div>
                        )}

                        {/* Date Validation Error */}
                        {dateError && (
                            <div className="flex items-center gap-2 p-3 bg-error/10 border border-error/30 rounded">
                                <svg className="w-5 h-5 text-error flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm text-error font-medium">{dateError}</span>
                            </div>
                        )}

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-beta dark:text-light mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={data.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Describe your academic achievements, activities, honors, or relevant coursework."
                                className="w-full px-3 py-2 bg-light dark:bg-dark_gray border border-beta/30 dark:border-light/20 rounded text-beta dark:text-light placeholder:text-beta/50 dark:placeholder:text-light/50 focus:outline-none focus:border-alpha focus:ring-1 focus:ring-alpha resize-none"
                            />
                            <InputError message={errors.description} className="mt-1" />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-light dark:bg-dark border-t border-beta/20 dark:border-light/10 p-4 flex justify-end gap-3">
                        <button
                            onClick={() => onOpenChange(false)}
                            className="px-6 py-2 border border-beta/30 dark:border-light/30 text-beta dark:text-light rounded-full font-medium hover:bg-beta/5 dark:hover:bg-light/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={editEducation}
                            disabled={processing || dateError}
                            className="px-6 py-2 bg-alpha text-beta dark:text-dark rounded-full font-medium hover:bg-alpha/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
export default EditEducationModal;