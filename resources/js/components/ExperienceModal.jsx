import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { helpers } from './utils/helpers';

const ExperienceModal = ({ onChange, onOpenChange }) => {
    const [currentlyWorking, setCurrentlyWorking] = useState(false);
    const [remotePosition, setRemotePosition] = useState(false);
    const { stopScrolling } = helpers()

    useEffect(() => {
        stopScrolling(onChange)
        return () => stopScrolling(false);
    }, [onChange])


    const [formData, setFormData] = useState({
        title: '',
        employmentType: '',
        company: '',
        location: '',
        startMonth: '',
        startYear: '',
        endMonth: '',
        endYear: '',
        industry: '',
        description: '',
        profileHeadline: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    return (
        <>
            <div onClick={() => onOpenChange(false)} className="fixed inset-0 h-full z-30 bg-black/50 dark:bg-black/70 backdrop-blur-md transition-all duration-300">
            </div>
            <div className="fixed inset-0 h-fit mx-auto w-[50%] bg-light dark:bg-beta rounded-lg top-1/2 -translate-y-1/2 z-50 overflow-hidden flex flex-col">
                <div className="bg-light dark:bg-dark w-full  rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
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
                        {/* Notify Network */}
                        {/* <div className="flex items-start justify-between gap-4 pb-6 border-b border-beta/20 dark:border-light/10">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-beta dark:text-light mb-1">Notify network</p>
                            <p className="text-xs text-beta/70 dark:text-light/70">
                                Turn on to notify your network of key profile changes (such as new job) and work anniversaries. Updates can take up to 2 hours. Learn more about sharing profile changes.
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notify}
                                onChange={(e) => setNotify(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-beta/30 dark:bg-light/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-light dark:after:bg-dark after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-alpha"></div>
                        </label>
                    </div> */}

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-beta dark:text-light mb-2">
                                Title*
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Ex: Retail Sales Manager"
                                className="w-full px-3 py-2 bg-light dark:bg-dark_gray border border-beta/30 dark:border-light/20 rounded text-beta dark:text-light placeholder:text-beta/50 dark:placeholder:text-light/50 focus:outline-none focus:border-alpha focus:ring-1 focus:ring-alpha"
                            />
                        </div>

                        {/* Employment Type */}
                        <div>
                            <label className="block text-sm font-medium text-beta dark:text-light mb-2">
                                Employment type
                            </label>
                            <select
                                name="employmentType"
                                value={formData.employmentType}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-light dark:bg-dark_gray border border-beta/30 dark:border-light/20 rounded text-beta dark:text-light focus:outline-none focus:border-alpha focus:ring-1 focus:ring-alpha"
                            >
                                <option value="">Please select</option>
                                <option value="full-time">Full-time</option>
                                <option value="part-time">Part-time</option>
                                <option value="contract">Contract</option>
                                <option value="freelance">Freelance</option>
                                <option value="internship">Internship</option>
                            </select>
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
                                value={formData.company}
                                onChange={handleChange}
                                placeholder="Ex: Microsoft"
                                className="w-full px-3 py-2 bg-light dark:bg-dark_gray border border-beta/30 dark:border-light/20 rounded text-beta dark:text-light placeholder:text-beta/50 dark:placeholder:text-light/50 focus:outline-none focus:border-alpha focus:ring-1 focus:ring-alpha"
                            />
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
                                    name="startMonth"
                                    value={formData.startMonth}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-light dark:bg-dark_gray border border-beta/30 dark:border-light/20 rounded text-beta dark:text-light focus:outline-none focus:border-alpha focus:ring-1 focus:ring-alpha"
                                >
                                    <option value="">Month</option>
                                    <option value="1">January</option>
                                    <option value="2">February</option>
                                    <option value="3">March</option>
                                    <option value="4">April</option>
                                    <option value="5">May</option>
                                    <option value="6">June</option>
                                    <option value="7">July</option>
                                    <option value="8">August</option>
                                    <option value="9">September</option>
                                    <option value="10">October</option>
                                    <option value="11">November</option>
                                    <option value="12">December</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-beta dark:text-light mb-2 opacity-0">
                                    Year
                                </label>
                                <select
                                    name="startYear"
                                    value={formData.startYear}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-light dark:bg-dark_gray border border-beta/30 dark:border-light/20 rounded text-beta dark:text-light focus:outline-none focus:border-alpha focus:ring-1 focus:ring-alpha"
                                >
                                    <option value="">Year</option>
                                    {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
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
                                        name="endMonth"
                                        value={formData.endMonth}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-light dark:bg-dark_gray border border-beta/30 dark:border-light/20 rounded text-beta dark:text-light focus:outline-none focus:border-alpha focus:ring-1 focus:ring-alpha"
                                    >
                                        <option value="">Month</option>
                                        <option value="1">January</option>
                                        <option value="2">February</option>
                                        <option value="3">March</option>
                                        <option value="4">April</option>
                                        <option value="5">May</option>
                                        <option value="6">June</option>
                                        <option value="7">July</option>
                                        <option value="8">August</option>
                                        <option value="9">September</option>
                                        <option value="10">October</option>
                                        <option value="11">November</option>
                                        <option value="12">December</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-beta dark:text-light mb-2 opacity-0">
                                        Year
                                    </label>
                                    <select
                                        name="endYear"
                                        value={formData.endYear}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-light dark:bg-dark_gray border border-beta/30 dark:border-light/20 rounded text-beta dark:text-light focus:outline-none focus:border-alpha focus:ring-1 focus:ring-alpha"
                                    >
                                        <option value="">Year</option>
                                        {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
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
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Ex: London, United Kingdom"
                                className="w-full px-3 py-2 bg-light dark:bg-dark_gray border border-beta/30 dark:border-light/20 rounded text-beta dark:text-light placeholder:text-beta/50 dark:placeholder:text-light/50 focus:outline-none focus:border-alpha focus:ring-1 focus:ring-alpha"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-beta dark:text-light mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Tell your major duties and successes, highlighting specific projects."
                                className="w-full px-3 py-2 bg-light dark:bg-dark_gray border border-beta/30 dark:border-light/20 rounded text-beta dark:text-light placeholder:text-beta/50 dark:placeholder:text-light/50 focus:outline-none focus:border-alpha focus:ring-1 focus:ring-alpha resize-none"
                            />
                        </div>
                        {/* Skills */}
                        {/* <div>
                        <label className="block text-sm font-medium text-beta dark:text-light mb-2">
                            Skills
                        </label>
                        <p className="text-xs text-beta/70 dark:text-light/70 mb-2">
                            We recommend adding your top 5 used in this role. They'll also appear in your Skills section.
                        </p>
                        <button className="px-4 py-2 border border-alpha text-alpha rounded-full text-sm font-medium hover:bg-alpha hover:text-beta dark:hover:text-dark transition-colors">
                            + Add skill
                        </button>
                    </div> */}
                        {/* Media */}
                        {/* <div>
                        <label className="block text-sm font-medium text-beta dark:text-light mb-2">
                            Media
                        </label>
                        <p className="text-xs text-beta/70 dark:text-light/70 mb-2">
                            Add media like images, documents, sites or presentations.{' '}
                            <span className="text-alpha cursor-pointer">Learn more about media file types supported</span>
                        </p>
                        <button className="px-4 py-2 border border-alpha text-alpha rounded-full text-sm font-medium hover:bg-alpha hover:text-beta dark:hover:text-dark transition-colors">
                            + Add media
                        </button>
                    </div> */}
                    </div>
                    {/* Footer */}
                    <div className="sticky bottom-0 bg-light dark:bg-dark border-t border-beta/20 dark:border-light/10 p-4 flex justify-end">
                        <button className="px-6 py-2 bg-alpha text-beta dark:text-dark rounded-full font-medium hover:bg-alpha/90 transition-colors">
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ExperienceModal;