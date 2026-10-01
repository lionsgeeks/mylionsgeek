import AppLayout from '@/layouts/app-layout';
import ProgrammeSheet from './components/ProgrammeSheet';
import { Head } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    Code,
    Film,
    Info,
    Layers,
    RotateCcw,
} from 'lucide-react';
import { useMemo, useState } from 'react';

// Helper: Calculate array of weekly objects dynamically from startDate and endDate
const calculateWeeksFromDates = (startDateStr, endDateStr) => {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
        return [];
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.max(1, Math.ceil(diffDays / 7));

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const weeks = [];

    for (let i = 0; i < totalWeeks; i++) {
        const weekStart = new Date(start);
        weekStart.setDate(start.getDate() + i * 7);

        const yyyy = weekStart.getFullYear();
        const mm = String(weekStart.getMonth() + 1).padStart(2, '0');
        const dd = String(weekStart.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const shortDate = `${dd}-${monthNames[weekStart.getMonth()]}`;

        weeks.push({
            id: `w_${i + 1}`,
            number: i + 1,
            dateStr,
            shortDate,
        });
    }

    return weeks;
};

// Initial neutral mock formation dates and module sequences (NO COACH / CLASS ROWS)
const initialFormationsData = {
    coding: {
        startDate: '2026-10-12',
        endDate: '2027-04-25', // 28 weeks
        // Neutral rows only (no coach, no class)
        rows: [
            { id: 'module', name: 'Module / Subject', isHeaderRow: true },
            { id: 'topics', name: 'Core Topics & Objectives', isHeaderRow: false },
            { id: 'deliverables', name: 'Deliverables & Exercises', isHeaderRow: false },
        ],
        modules: {
            1: 'HTML',
            2: 'HTML',
            3: 'HTML',
            4: 'HTML',
            5: 'CSS',
            6: 'HTML',
            7: 'CSS',
            8: 'JavaScript',
            9: 'JavaScript',
            10: 'JavaScript',
            11: 'React.js',
            12: 'React.js',
            13: 'React.js',
            14: 'Node.js & Express',
            15: 'Databases & SQL',
            16: 'Laravel PHP',
            17: 'Laravel PHP',
            18: 'Fullstack Integration',
            19: 'Capstone Project',
            20: 'Capstone Project',
            21: 'Capstone Project',
            22: 'Capstone Project',
            23: 'Mentorship & Review',
            24: 'Mentorship & Review',
            25: 'Final Portfolio',
            26: 'Final Portfolio',
            27: 'Certification Prep',
            28: 'Graduation & Demo',
        },
        contents: {
            'w_1_topics': 'Web Fundamentals, HTTP, HTML5 Semantics & Page Hierarchy',
            'w_1_deliverables': 'Semantic Personal CV Webpage',

            'w_2_topics': 'Forms, Input Validation, Accessibility (a11y) & Media Elements',
            'w_2_deliverables': 'Multi-step Registration Form',

            'w_3_topics': 'CSS Box Model, Positioning, Flexbox Layout Alignment',
            'w_3_deliverables': 'Responsive Dashboard Layout UI',

            'w_4_topics': 'CSS Grid, Responsive Breakpoints, Custom Animations & Transitions',
            'w_4_deliverables': 'E-commerce Product Showcase Grid',

            'w_5_topics': 'CSS Utility Libraries, Utility-first Styling & Color Tokens',
            'w_5_deliverables': 'Custom Styled Component Library',

            'w_6_topics': 'DOM Manipulation, HTML Data Attributes & Event Handling',
            'w_6_deliverables': 'Interactive Task Board Application',

            'w_7_topics': 'Advanced Responsive CSS, Modern Selectors & Variable Themes',
            'w_7_deliverables': 'Dark/Light Theme Switcher Landing Page',

            'w_8_topics': 'JS Data Structures, ES6+ Syntax, Functions & Scope',
            'w_8_deliverables': 'Interactive Quiz Application',

            'w_11_topics': 'React Components, JSX, Props, State & Hooks (useState, useEffect)',
            'w_11_deliverables': 'Weather Forecast Dashboard App',
        },
    },
    media: {
        startDate: '2026-10-12',
        endDate: '2027-03-28', // 24 weeks
        rows: [
            { id: 'module', name: 'Module / Subject', isHeaderRow: true },
            { id: 'topics', name: 'Core Topics & Objectives', isHeaderRow: false },
            { id: 'deliverables', name: 'Deliverables & Exercises', isHeaderRow: false },
        ],
        modules: {
            1: 'Photography',
            2: 'Photography',
            3: 'Lightroom Editing',
            4: 'Graphic Design',
            5: 'Graphic Design',
            6: 'Illustrator Vector',
            7: 'Photoshop Compositing',
            8: 'Video Editing',
            9: 'Video Editing',
            10: 'Premiere Pro',
            11: 'After Effects Motion',
            12: 'Sound & Audio Design',
            13: 'Production Project',
            14: 'Production Project',
            15: 'Production Project',
            16: 'Production Project',
            17: 'Branding & Identity',
            18: 'Branding & Identity',
            19: 'Documentary Short',
            20: 'Documentary Short',
            21: 'Portfolio Curation',
            22: 'Portfolio Curation',
            23: 'Final Exhibition',
            24: 'Graduation & Reel',
        },
        contents: {
            'w_1_topics': 'Digital Camera Controls, Shutter Speed, Aperture & ISO Settings',
            'w_1_deliverables': 'Manual Mode Photo Series (10 Shots)',

            'w_2_topics': 'Composition Rules, Rule of Thirds, Framing & Natural Lighting',
            'w_2_deliverables': 'Outdoor Natural Portrait Portfolio',

            'w_3_topics': 'Adobe Lightroom Workflow, Color Grading & Preset Creation',
            'w_3_deliverables': 'Edited Event Photo Series',

            'w_4_topics': 'Typography Principles, Font Pairing, Alignment & Visual Grid',
            'w_4_deliverables': 'Typography Poster Design',

            'w_8_topics': 'Video Shooting Techniques, B-Roll Capture & Camera Movement',
            'w_8_deliverables': '60-Second Short Promo Video',
        },
    },
};

export default function TrainingProgrammes() {
    const [selectedTrack, setSelectedTrack] = useState('coding');
    const [formationsData, setFormationsData] = useState(initialFormationsData);

    const tracks = [
        {
            id: 'coding',
            name: 'Coding',
            description: 'Fullstack web development, engineering & programming curriculum.',
            icon: Code,
            color: 'from-blue-500/20 to-indigo-500/20 text-blue-500',
        },
        {
            id: 'media',
            name: 'Media',
            description: 'Audiovisual production, graphic design & digital content creation.',
            icon: Film,
            color: 'from-purple-500/20 to-pink-500/20 text-purple-500',
        },
    ];

    const currentTrackConfig = tracks.find((t) => t.id === selectedTrack) || tracks[0];
    const currentFormation = formationsData[selectedTrack];

    // Compute continuous weekly columns dynamically from Start Date and End Date
    const weeks = useMemo(() => {
        return calculateWeeksFromDates(currentFormation.startDate, currentFormation.endDate);
    }, [currentFormation.startDate, currentFormation.endDate]);

    const handleDateChange = (field, value) => {
        setFormationsData((prev) => ({
            ...prev,
            [selectedTrack]: {
                ...prev[selectedTrack],
                [field]: value,
            },
        }));
    };

    const handleCellChange = (weekNum, rowId, value) => {
        if (rowId === 'module') {
            setFormationsData((prev) => ({
                ...prev,
                [selectedTrack]: {
                    ...prev[selectedTrack],
                    modules: {
                        ...prev[selectedTrack].modules,
                        [weekNum]: value,
                    },
                },
            }));
        } else {
            const cellKey = `w_${weekNum}_${rowId}`;
            setFormationsData((prev) => ({
                ...prev,
                [selectedTrack]: {
                    ...prev[selectedTrack],
                    contents: {
                        ...prev[selectedTrack].contents,
                        [cellKey]: value,
                    },
                },
            }));
        }
    };

    const handleResetMockData = () => {
        setFormationsData(initialFormationsData);
    };

    return (
        <AppLayout>
            <Head title="Training Programmes" />

            <div className="min-h-screen space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-dark sm:text-3xl dark:text-light">
                            <BookOpen className="h-7 w-7 text-alpha" />
                            Training Programmes
                        </h1>
                        <p className="mt-1 text-sm text-dark/70 dark:text-light/70">
                            Neutral & reusable weekly programme templates for <span className="font-bold text-dark dark:text-light">{currentTrackConfig.name}</span> formation.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleResetMockData}
                            className="flex items-center gap-1.5 rounded-xl border border-alpha/20 bg-light px-3.5 py-2 text-xs font-semibold text-dark/80 transition-colors hover:bg-alpha/10 dark:bg-dark dark:text-light/80"
                            title="Reset local changes"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Reset Mock Data
                        </button>
                    </div>
                </div>

                {/* Track Selector Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {tracks.map((track) => {
                        const Icon = track.icon;
                        const isSelected = selectedTrack === track.id;

                        return (
                            <button
                                key={track.id}
                                type="button"
                                onClick={() => setSelectedTrack(track.id)}
                                className={`flex items-start gap-4 rounded-2xl border p-5 text-left transition-all ${
                                    isSelected
                                        ? 'border-alpha bg-alpha/10 shadow-md ring-1 ring-alpha dark:bg-alpha/15'
                                        : 'border-alpha/20 bg-light hover:border-alpha/40 dark:bg-dark dark:hover:border-alpha/40'
                                }`}
                            >
                                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${track.color}`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-dark dark:text-light">{track.name} Track</h3>
                                        {isSelected && (
                                            <span className="rounded-full bg-alpha px-2.5 py-0.5 text-xs font-semibold text-black">
                                                Active Track
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-xs text-dark/60 dark:text-light/60">{track.description}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Neutral Template Info Bar */}
                <div className="flex flex-col gap-4 rounded-xl border border-alpha/20 bg-alpha/5 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-alpha/15">
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-dark dark:text-light">
                            <Calendar className="h-4 w-4 text-alpha" />
                            <span>Formation Timeline Preview:</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-dark/70 dark:text-light/70">Start:</label>
                            <input
                                type="date"
                                value={currentFormation.startDate}
                                onChange={(e) => handleDateChange('startDate', e.target.value)}
                                className="rounded-lg border border-alpha/30 bg-light px-2.5 py-1 text-xs font-medium text-dark shadow-sm focus:outline-none dark:bg-dark dark:text-light"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-dark/70 dark:text-light/70">End:</label>
                            <input
                                type="date"
                                value={currentFormation.endDate}
                                onChange={(e) => handleDateChange('endDate', e.target.value)}
                                className="rounded-lg border border-alpha/30 bg-light px-2.5 py-1 text-xs font-medium text-dark shadow-sm focus:outline-none dark:bg-dark dark:text-light"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                        <span className="rounded-lg bg-alpha/20 px-3 py-1.5 font-extrabold text-alpha">
                            {weeks.length} Continuous Weeks
                        </span>
                        <div className="flex items-center gap-1 text-dark/60 dark:text-light/60">
                            <Info className="h-3.5 w-3.5 text-alpha" />
                            <span>Neutral Template • Coach & Class assignment happens on Training Page</span>
                        </div>
                    </div>
                </div>

                {/* Neutral Programme Sheet */}
                <ProgrammeSheet
                    weeks={weeks}
                    rows={currentFormation.rows}
                    modules={currentFormation.modules}
                    contents={currentFormation.contents}
                    onCellChange={handleCellChange}
                    editable={true}
                    trackName={currentTrackConfig.name}
                />
            </div>
        </AppLayout>
    );
}
