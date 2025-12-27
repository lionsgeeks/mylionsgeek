import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { helpers } from './utils/helpers';
import { router, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';

// Constants for form options
const EMPLOYMENT_TYPES = [
    { value: '', label: 'Please select' },
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Internship' },
];

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

const CreateExperienceModal = ({ onChange, onOpenChange, id  }) => {
    const [currentlyWorking, setCurrentlyWorking] = useState(false);
    const [remotePosition, setRemotePosition] = useState(false);
    const [dateError, setDateError] = useState('');
    const { stopScrolling } = helpers()
    const { data, setData, processing, errors } = useForm({
        title: '',
        description: '',
        employment_type: '',
        company: '',
        start_month: '',
        start_year: '',
        end_month: '',
        end_year: '',
        location: '',
    })

    useEffect(() => {
        stopScrolling(onChange)
        return () => stopScrolling(false);
    }, [onChange])

    // Validate date range
    useEffect(() => {
        if (!currentlyWorking && data.start_month && data.start_year && data.end_month && data.end_year) {
            const startDate = new Date(parseInt(data.start_year), parseInt(data.start_month) - 1);
            const endDate = new Date(parseInt(data.end_year), parseInt(data.end_month) - 1);

            if (startDate > endDate) {
                setDateError('End date must be after start date');
            } else {
                setDateError('');
            }
        } else {
            setDateError('');
        }
    }, [data.start_month, data.start_year, data.end_month, data.end_year, currentlyWorking]);

    const createExperience = () => {
        // Check if there's a date validation error
        if (dateError) {
            return;
        }

        try {
            router.post(`/users/experience`, data, {
                onSuccess: () => {
                    onOpenChange(false)
                },
                onError: (error) => {
                    console.log(error);
                }
            })
        } catch (error) {
            console.log(error);
        }
    }

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
                        <h2 className="text-xl font-semibold text-beta dark:text-light">Add experience</h2>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="text-beta/60 dark:text-light/60 hover:text-beta dark:hover:text-light transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-beta dark:text-light mb-2">
                                Title*
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={data.title}
                                onChange={handleChange}
                                placeholder="Ex: Retail Sales Manager"
                                className="w-full px-3 py-2 bg-light dark:bg-dark_gray border border-beta/30 dark:border-light/20 rounded text-beta dark:text-light placeholder:text-beta/50 dark:placeholder:text-light/50 focus:outline-none focus:border-alpha focus:ring-1 focus:ring-alpha"
                            />
                            <InputError message={errors.title} className="mt-1" />
                        </div>

                        {/* Employment Type */}
                        <div>
                            <label className="block text-sm font-medium text-beta dark:text-light mb-2">
                                Employment type
                            </label>
                            <select
                                name="employment_type"
                                value={data.employment_type}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-light dark:bg-dark_gray border border-beta/30 dark:border-light/20 rounded text-beta dark:text-light focus:outline-none focus:border-alpha focus:ring-1 focus:ring-alpha"
                            >
                                {EMPLOYMENT_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.employment_type} className="mt-1" />
                            <p className="text-xs text-beta/70 dark:text-light/70 mt-1">Learn more about employment types.</p>
                        </div>

                        {/* Company */}
                        <div>
                            <label className="block text-sm font-medium text-beta dark:text-light mb-2">
                                Company or organization*
                            </label>
                            <input
                                type="text"
                                name="company"
                                value={data.company}
                                onChange={handleChange}
                                placeholder="Ex: Microsoft"
                                className="w-full px-3 py-2 bg-light dark:bg-dark_gray border border-beta/30 dark:border-light/20 rounded text-beta dark:text-light placeholder:text-beta/50 dark:placeholder:text-light/50 focus:outline-none focus:border-alpha focus:ring-1 focus:ring-alpha"
                            />
                            <InputError message={errors.company} className="mt-1" />
                        </div>

                        {/* Currently Working Checkbox */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="currently-working"
                                checked={currentlyWorking}
                                onChange={(e) => setCurrentlyWorking(e.target.checked)}
                                className="w-4 h-4 text-alpha bg-light dark:bg-dark_gray border-beta/30 dark:border-light/20 rounded focus:ring-alpha focus:ring-2"
                            />
                            <label htmlFor="currently-working" className="text-sm text-beta dark:text-light cursor-pointer">
                                I am currently working in this role
                            </label>
                        </div>

                        {/* Start Date */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-beta dark:text-light mb-2">
                                    Start date*
                                </label>
                                <select
                                    name="start_month"
                                    value={data.start_month}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-light dark:bg-dark_gray border border-beta/30 dark:border-light/20 rounded text-beta dark:text-light focus:outline-none focus:border-alpha focus:ring-1 focus:ring-alpha"
                                >
                                    {MONTHS.map((month) => (
                                        <option key={month.value} value={month.value}>
                                            {month.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.start_month} className="mt-1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-beta dark:text-light mb-2 opacity-0">
                                    Year
                                </label>
                                <select
                                    name="start_year"
                                    value={data.start_year}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-light dark:bg-dark_gray border border-beta/30 dark:border-light/20 rounded text-beta dark:text-light focus:outline-none focus:border-alpha focus:ring-1 focus:ring-alpha"
                                >
                                    {YEARS.map((year) => (
                                        <option key={year.value} value={year.value}>
                                            {year.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.start_year} className="mt-1" />
                            </div>
                        </div>

                        {/* End Date */}
                        {!currentlyWorking && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-beta dark:text-light mb-2">
                                        End date*
                                    </label>
                                    <select
                                        name="end_month"
                                        value={data.end_month}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-light dark:bg-dark_gray border border-beta/30 dark:border-light/20 rounded text-beta dark:text-light focus:outline-none focus:border-alpha focus:ring-1 focus:ring-alpha"
                                    >
                                        {MONTHS.map((month) => (
                                            <option key={month.value} value={month.value}>
                                                {month.label}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.end_month} className="mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-beta dark:text-light mb-2 opacity-0">
                                        Year
                                    </label>
                                    <select
                                        name="end_year"
                                        value={data.end_year}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-light dark:bg-dark_gray border border-beta/30 dark:border-light/20 rounded text-beta dark:text-light focus:outline-none focus:border-alpha focus:ring-1 focus:ring-alpha"
                                    >
                                        {YEARS.map((year) => (
                                            <option key={year.value} value={year.value}>
                                                {year.label}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.end_year} className="mt-1" />
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

                        {/* Remote Position Checkbox */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="remote-position"
                                checked={remotePosition}
                                onChange={(e) => setRemotePosition(e.target.checked)}
                                className="w-4 h-4 text-alpha bg-light dark:bg-dark_gray border-beta/30 dark:border-light/20 rounded focus:ring-alpha focus:ring-2"
                            />
                            <label htmlFor="remote-position" className="text-sm text-beta dark:text-light cursor-pointer">
                                End current position at next role - Software Developer at CamelCase
                            </label>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-beta dark:text-light mb-2">
                                Location
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={data.location}
                                onChange={handleChange}
                                placeholder="Ex: London, United Kingdom"
                                className="w-full px-3 py-2 bg-light dark:bg-dark_gray border border-beta/30 dark:border-light/20 rounded text-beta dark:text-light placeholder:text-beta/50 dark:placeholder:text-light/50 focus:outline-none focus:border-alpha focus:ring-1 focus:ring-alpha"
                            />
                            <InputError message={errors.location} className="mt-1" />
                        </div>

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
                                placeholder="Tell your major duties and successes, highlighting specific projects."
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
                            onClick={() => createExperience()}
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
export default CreateExperienceModal;