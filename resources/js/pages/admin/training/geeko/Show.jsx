import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    Plus, Play, Settings, Trash2, Edit3, ArrowLeft,
    Clock, Users, Trophy, CheckCircle, XCircle,
    Eye, ChevronUp, ChevronDown, Save, X, Upload,
    Copy, ExternalLink, GripVertical
} from 'lucide-react';

export default function ShowGeeko({ formation, geeko }) {
    const [showAddQuestion, setShowAddQuestion] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [expandedQuestion, setExpandedQuestion] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [meta, setMeta] = useState({
        title: geeko?.title || '',
        description: geeko?.description || '',
    });

    const normalizeQuestions = (qs) => {
        if (!Array.isArray(qs)) return [];
        const normalizeText = (val) => String(val ?? '')
            .toLowerCase()
            .normalize('NFKD')
            .replace(/\p{Diacritic}/gu, '')
            .replace(/[\s\t\n\r]+/g, ' ')
            .replace(/[""]/g, '"')
            .replace(/['']/g, "'")
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .replace(/[\s]*([,.;:!?])([\s]*)/g, '$1 ')
            .trim();
        const truthySet = new Set(['true', 't', '1', 'yes', 'y']);
        const falsySet = new Set(['false', 'f', '0', 'no', 'n']);

        return qs.map(q => {
            //('Processing question:', q.id, 'Raw options:', q.options, 'Raw correct_answers:', q.correct_answers);

            // Handle options - could be array or JSON string
            let optionsArray = [];
            if (Array.isArray(q.options)) {
                // Already an array
                optionsArray = q.options.map(o => (typeof o === 'string' ? o : (o?.text ?? '')));
            } else if (typeof q.options === 'string') {
                // JSON string, try to parse
                try {
                    const parsed = JSON.parse(q.options);
                    if (Array.isArray(parsed)) {
                        optionsArray = parsed.map(o => (typeof o === 'string' ? o : (o?.text ?? '')));
                    }
                } catch (e) {
                    console.warn('Failed to parse options JSON:', q.options);
                    optionsArray = [];
                }
            }

            // Ensure defaults for true/false
            if (q.type === 'true_false' && optionsArray.length === 0) {
                optionsArray = ['True', 'False'];
            }

            // Handle correct_answers - could be array or JSON string
            let correctRaw = [];
            if (Array.isArray(q.correct_answers)) {
                // Already an array
                correctRaw = q.correct_answers;
            } else if (typeof q.correct_answers === 'string') {
                // JSON string, try to parse
                try {
                    const parsed = JSON.parse(q.correct_answers);
                    if (Array.isArray(parsed)) {
                        correctRaw = parsed;
                    }
                } catch (e) {
                    console.warn('Failed to parse correct_answers JSON:', q.correct_answers);
                    correctRaw = [];
                }
            }

            // Convert correct answers to numeric indices
            const correctIndexes = [];
            const optionIndexByText = new Map(optionsArray.map((opt, idx) => [normalizeText(opt), idx]));

            correctRaw.forEach((val) => {
                if (typeof val === 'number' && Number.isInteger(val)) {
                    correctIndexes.push(val);
                } else if (typeof val === 'string') {
                    const maybeIndex = parseInt(val, 10);
                    if (!Number.isNaN(maybeIndex)) {
                        correctIndexes.push(maybeIndex);
                    } else {
                        const norm = normalizeText(val);
                        // Map common TF synonyms to canonical labels present in options
                        if (q.type === 'true_false') {
                            if (truthySet.has(norm)) {
                                const i = optionIndexByText.get(normalizeText('True'));
                                if (typeof i === 'number') correctIndexes.push(i);
                                return;
                            }
                            if (falsySet.has(norm)) {
                                const i = optionIndexByText.get(normalizeText('False'));
                                if (typeof i === 'number') correctIndexes.push(i);
                                return;
                            }
                        }
                        const idx = optionIndexByText.get(norm);
                        if (typeof idx === 'number') correctIndexes.push(idx);
                    }
                }
            });

            // For type_answer, ensure single option and index 0
            if (q.type === 'type_answer') {
                const textAnswer = correctRaw[0] || optionsArray[0] || '';
                optionsArray = [textAnswer];
                return { ...q, options: optionsArray, correct_answers: [0] };
            }

            const result = {
                ...q,
                options: optionsArray,
                correct_answers: correctIndexes,
            };

            //('Normalized question:', q.id, 'Options:', result.options, 'Correct answers:', result.correct_answers);
            return result;
        });
    };

    const [questions, setQuestions] = useState(normalizeQuestions(geeko?.questions));

    useEffect(() => {
        setQuestions(normalizeQuestions(geeko?.questions));
    }, [geeko]);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        question: '',
        type: 'multiple_choice',
        options: ['', '', '', ''],
        correct_answers: [],
        points: 1000,
        time_limit: null,
        question_image: null,
    });

    const questionTypes = [
        { value: 'multiple_choice', label: 'Multiple Choice', icon: 'MC' },
        { value: 'true_false', label: 'True/False', icon: 'TF' },
        { value: 'type_answer', label: 'Type Answer', icon: 'TA' },
    ];

    const resetForm = () => {
        reset();
        setEditingQuestion(null);
        setShowAddQuestion(false);
    };

    const handleAddQuestion = () => {
        setShowAddQuestion(true);
        setEditingQuestion(null);
        reset();
        // Set default options based on type
        if (data.type === 'true_false') {
            setData('options', ['True', 'False']);
        } else if (data.type === 'multiple_choice') {
            setData('options', ['', '', '', '']);
        } else {
            setData('options', ['']);
        }
    };

    const handleEditQuestion = (question) => {
        setEditingQuestion(question.id);
        setShowAddQuestion(true);
        setData({
            question: question.question,
            type: question.type,
            options: Array.isArray(question.options) ? question.options : [],
            correct_answers: Array.isArray(question.correct_answers) ? question.correct_answers : [],
            points: question.points,
            time_limit: question.time_limit,
            question_image: null,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const url = editingQuestion
            ? `/training/${formation.id}/geeko/${geeko.id}/questions/${editingQuestion}`
            : `/training/${formation.id}/geeko/${geeko.id}/questions`;

        const method = editingQuestion ? 'put' : 'post';

        router[method](url, data, {
            onSuccess: () => {
                resetForm();
                // Refresh list locally by adding/updating
                if (method === 'post') {
                    // simple refresh: navigate back to same page to refetch data
                    router.visit(`/training/${formation.id}/geeko/${geeko.id}`);
                } else {
                    router.visit(`/training/${formation.id}/geeko/${geeko.id}`);
                }
            }
        });
    };

    const handleDeleteQuestion = (questionId) => {
        router.delete(`/training/${formation.id}/geeko/${geeko.id}/questions/${questionId}`, {
            onSuccess: () => {
                setConfirmDelete(null);
                setQuestions(prev => prev.filter(q => q.id !== questionId));
            }
        });
    };

    const handleToggleStatus = () => {
        router.post(`/training/${formation.id}/geeko/${geeko.id}/toggle-status`);
    };

    const handleStartSession = () => {
        setShowDetailsModal(true);
    };

    const handleConfirmAndCreateSession = () => {
        // Close modal first
        setShowDetailsModal(false);

        // Create session directly - skip the quiz update for now
        ('Creating session with params:', {
            formationId: formation.id,
            geekoId: geeko.id,
            title: meta.title,
            description: meta.description
        });

        router.post(`/training/${formation.id}/geeko/${geeko.id}/session/create`, {
            title: meta.title,
            description: meta.description
        }, {
            onSuccess: (page) => {
                //('Session created successfully:', page);
                // The backend should redirect automatically to control page
            },
            onError: (errors) => {
                console.error('Failed to create session:', errors);
                console.error('Error details:', JSON.stringify(errors, null, 2));
                //alert('Failed to create session. Please check the console for details.');
            }
        });
    };

    const handleTypeChange = (type) => {
        setData('type', type);
        setData('correct_answers', []);

        if (type === 'true_false') {
            setData('options', ['True', 'False']);
        } else if (type === 'multiple_choice') {
            setData('options', ['', '', '', '']);
        } else {
            setData('options', ['']);
        }
    };

    const updateOption = (index, value) => {
        const newOptions = [...data.options];
        newOptions[index] = value;
        setData('options', newOptions);
    };

    const addOption = () => {
        setData('options', [...data.options, '']);
    };

    const removeOption = (index) => {
        const newOptions = data.options.filter((_, i) => i !== index);
        setData('options', newOptions);
    };

    const toggleCorrectAnswer = (index) => {
        const currentCorrect = [...data.correct_answers];
        if (data.type === 'multiple_choice') {
            // Multiple selections allowed
            if (currentCorrect.includes(index)) {
                setData('correct_answers', currentCorrect.filter(i => i !== index));
            } else {
                setData('correct_answers', [...currentCorrect, index]);
            }
        } else {
            // Single selection
            setData('correct_answers', [index]);
        }
    };

    const getQuestionIcon = (type) => {
        return questionTypes.find(t => t.value === type)?.icon || 'Q';
    };

    // Inline edit helpers
    const updateLocalQuestionField = (questionId, field, value) => {
        setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, [field]: value } : q));
    };

    const updateLocalOption = (questionId, optionIndex, value) => {
        setQuestions(prev => prev.map(q => {
            if (q.id !== questionId) return q;
            const opts = Array.isArray(q.options) ? [...q.options] : [];
            opts[optionIndex] = value;
            return { ...q, options: opts };
        }));
    };

    const addLocalOption = (questionId) => {
        setQuestions(prev => prev.map(q => {
            if (q.id !== questionId) return q;
            const opts = Array.isArray(q.options) ? [...q.options] : [];
            return { ...q, options: [...opts, ''] };
        }));
    };

    const removeLocalOption = (questionId, optionIndex) => {
        setQuestions(prev => prev.map(q => {
            if (q.id !== questionId) return q;
            const opts = Array.isArray(q.options) ? q.options.filter((_, i) => i !== optionIndex) : [];
            const corrected = Array.isArray(q.correct_answers) ? q.correct_answers.filter(i => i !== optionIndex).map(i => i > optionIndex ? i - 1 : i) : [];
            return { ...q, options: opts, correct_answers: corrected };
        }));
    };

    const toggleLocalCorrect = (questionId, optionIndex, type) => {
        //('Toggling correct answer:', { questionId, optionIndex, type });
        setQuestions(prev => prev.map(q => {
            if (q.id !== questionId) return q;
            const current = Array.isArray(q.correct_answers) ? [...q.correct_answers] : [];
            let newCorrectAnswers;

            //('Current correct answers:', current);

            if (type === 'multiple_choice') {
                // Multiple selections allowed
                if (current.includes(optionIndex)) {
                    newCorrectAnswers = current.filter(i => i !== optionIndex);
                } else {
                    newCorrectAnswers = [...current, optionIndex];
                }
            } else {
                // Single selection (true_false, type_answer)
                newCorrectAnswers = [optionIndex];
            }

            //('New correct answers:', newCorrectAnswers);
            return { ...q, correct_answers: newCorrectAnswers };
        }));
    };

    const saveQuestion = (q) => {
        const payload = {
            question: q.question,
            type: q.type,
            options: Array.isArray(q.options) ? q.options : [],
            correct_answers: Array.isArray(q.correct_answers) ? q.correct_answers : [],
            points: q.points,
            time_limit: q.time_limit,
        };
        router.put(`/training/${formation.id}/geeko/${geeko.id}/questions/${q.id}`, payload, {
            preserveScroll: true,
            onSuccess: () => {
                // Collapse editor
                setExpandedQuestion(null);
                router.visit(`/training/${formation.id}/geeko/${geeko.id}`);
            }
        });
    };

    const changeTypeAdjustOptions = (qId, newType) => {
        setQuestions(prev => prev.map(q => {
            if (q.id !== qId) return q;
            if (newType === 'true_false') {
                return { ...q, type: newType, options: ['True', 'False'], correct_answers: [] };
            }
            if (newType === 'multiple_choice') {
                const opts = Array.isArray(q.options) && q.options.length >= 4 ? q.options.slice(0, 4) : ['', '', '', ''];
                return { ...q, type: newType, options: opts, correct_answers: [] };
            }
            if (newType === 'type_answer') {
                return { ...q, type: newType, options: [Array.isArray(q.options) && q.options[0] ? q.options[0] : ''], correct_answers: [0] };
            }
            return { ...q, type: newType };
        }));
    };

    // Native drag and drop handlers
    const [draggedIndex, setDraggedIndex] = useState(null);

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
        e.target.style.opacity = '0.5';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
        setDraggedIndex(null);
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) return;

        const newQuestions = [...questions];
        const draggedQuestion = newQuestions[draggedIndex];
        newQuestions.splice(draggedIndex, 1);
        newQuestions.splice(dropIndex, 0, draggedQuestion);

        setQuestions(newQuestions);

        // Persist order
        router.post(`/training/${formation.id}/geeko/${geeko.id}/questions/reorder`, {
            questions: newQuestions.map((qq, i) => ({ id: qq.id, order_index: i }))
        }, { preserveScroll: true });
    };

    return (
        <AppLayout>
            <Head title={`${geeko.title} - ${formation.name}`} />

            <div className="min-h-screen bg-light dark:bg-dark">
                {/* Clean Header */}
                <div className="bg-white dark:bg-dark border-b border-alpha/10">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <button
                                onClick={() => router.visit(`/training/${formation.id}/geeko`)}
                                className="flex items-center text-dark/60 dark:text-light/60 hover:text-alpha transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to Geeko
                            </button>

                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => router.visit(`/training/${formation.id}/geeko/${geeko.id}/edit`)}
                                    className="p-2 rounded-lg hover:bg-alpha/10 transition-colors"
                                >
                                    <Settings size={18} />
                                </button>
                                <button
                                    onClick={handleToggleStatus}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${geeko.status === 'ready'
                                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        : 'bg-alpha/20 text-alpha hover:bg-alpha/30'
                                        }`}
                                >
                                    {geeko.status === 'ready' ? 'Draft' : 'Ready'}
                                </button>
                                {geeko.status === 'ready' && (geeko.questions?.length || 0) > 0 && (
                                    <button
                                        onClick={handleStartSession}
                                        className="flex items-center space-x-2 bg-alpha text-dark px-4 py-2 rounded-lg hover:bg-alpha/90 transition-colors font-medium"
                                    >
                                        <Play size={16} />
                                        <span>Start Game</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Minimalist Lobby */}
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">


                    {/* Questions Section */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-dark dark:text-light">Questions</h3>
                            <p className="text-sm text-dark/60 dark:text-light/60">{questions?.length || 0} questions</p>
                        </div>
                        <button
                            onClick={handleAddQuestion}
                            className="flex items-center space-x-2 bg-alpha text-dark px-4 py-2 rounded-lg hover:bg-alpha/90 transition-colors font-medium"
                        >
                            <Plus size={16} />
                            <span>Add Question</span>
                        </button>
                    </div>

                    {/* Questions Grid */}
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-12 space-y-6">

                        {/* Add/Edit Question Form */}
                        {showAddQuestion && (
                            <div className="backdrop-blur-xl bg-white/60 dark:bg-dark/50 border border-white/20 rounded-2xl p-6 shadow-xl">
                                <h3 className="text-xl font-bold text-dark dark:text-light mb-6">
                                    {editingQuestion ? 'Edit Question' : 'Add New Question'}
                                </h3>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Question Text */}
                                    <div>
                                        <label className="block text-sm font-semibold text-dark dark:text-light mb-2">
                                            Question *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.question}
                                            onChange={(e) => setData('question', e.target.value)}
                                            className="w-full text-lg border border-white/20 rounded-xl px-5 py-4 bg-white/60 dark:bg-dark/50 backdrop-blur text-dark dark:text-light focus:border-alpha focus:ring-2 focus:ring-alpha/20 placeholder:text-dark/50 dark:placeholder:text-light/50"
                                            placeholder="Start typing your question"
                                            required
                                        />
                                        {errors.question && (
                                            <p className="text-error text-sm mt-1">{errors.question}</p>
                                        )}
                                    </div>

                                    {/* Media Upload */}
                                    <div>
                                        <label className="block text-sm font-semibold text-dark dark:text-light mb-2">
                                            Media (optional)
                                        </label>
                                        <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-white/30 bg-white/40 dark:bg-dark/40 backdrop-blur p-6">
                                            <label className="cursor-pointer inline-flex items-center gap-3 px-4 py-2 rounded-lg border border-alpha/30 hover:bg-alpha/10 text-dark dark:text-light">
                                                <Upload size={16} />
                                                <span>Upload file</span>
                                                <input
                                                    type="file"
                                                    accept="image/*,video/*"
                                                    className="hidden"
                                                    onChange={(e) => setData('question_image', e.target.files?.[0] || null)}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Question Type */}
                                    <div>
                                        <label className="block text-sm font-semibold text-dark dark:text-light mb-2">
                                            Question Type
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {questionTypes.map((type) => (
                                                <button
                                                    key={type.value}
                                                    type="button"
                                                    onClick={() => handleTypeChange(type.value)}
                                                    className={`p-3 rounded-full border transition-all ${data.type === type.value
                                                        ? 'border-alpha bg-alpha/10'
                                                        : 'border-white/20 hover:border-alpha/40'
                                                        }`}
                                                >
                                                    <div className="text-xs font-semibold">{type.label}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Answer Options */}
                                    <div>
                                        <label className="block text-sm font-semibold text-dark dark:text-light mb-2">
                                            Answer Options
                                        </label>
                                        <div className="space-y-3">
                                            {data.options.map((option, index) => (
                                                <div key={index} className="flex items-center gap-3">
                                                    <div className={`w-4 h-10 rounded-l-md ${index === 0 ? 'bg-red-500' : index === 1 ? 'bg-blue-500' : index === 2 ? 'bg-yellow-500' : 'bg-green-600'}`}></div>
                                                    <input
                                                        type="text"
                                                        value={option}
                                                        onChange={(e) => updateOption(index, e.target.value)}
                                                        className="flex-1 border border-white/20 rounded-r-md px-4 py-2 bg-white/60 dark:bg-dark/50 backdrop-blur text-dark dark:text-light focus:border-alpha focus:ring-2 focus:ring-alpha/20"
                                                        placeholder={`Add answer ${index + 1}${index > 1 ? ' (optional)' : ''}`}
                                                        disabled={data.type === 'true_false'}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleCorrectAnswer(index)}
                                                        className={`px-3 py-2 rounded-lg border text-sm font-semibold ${data.correct_answers.includes(index)
                                                            ? 'bg-good/20 border-good text-good'
                                                            : 'border-white/20 hover:border-alpha/40'
                                                            }`}
                                                    >
                                                        Correct
                                                    </button>
                                                    {data.type === 'multiple_choice' && data.options.length > 2 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeOption(index)}
                                                            className="p-2 text-error hover:bg-error/10 rounded-lg"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}

                                            {data.type === 'multiple_choice' && data.options.length < 6 && (
                                                <button
                                                    type="button"
                                                    onClick={addOption}
                                                    className="flex items-center space-x-2 text-alpha hover:text-alpha/80 font-semibold"
                                                >
                                                    <Plus size={16} />
                                                    <span>Add Option</span>
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-dark/60 dark:text-light/60 mt-2">
                                            Click the circle to mark correct answers
                                        </p>
                                    </div>

                                    {/* Points and Time */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-dark dark:text-light mb-2">
                                                Points
                                            </label>
                                            <input
                                                type="number"
                                                min="100"
                                                max="2000"
                                                step="100"
                                                value={data.points}
                                                onChange={(e) => setData('points', parseInt(e.target.value))}
                                                className="w-full border border-alpha/30 rounded-lg px-4 py-2 bg-light dark:bg-dark text-dark dark:text-light focus:border-alpha focus:ring-2 focus:ring-alpha/20"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-dark dark:text-light mb-2">
                                                Time Limit (seconds)
                                            </label>
                                            <input
                                                type="number"
                                                min="5"
                                                max="300"
                                                value={data.time_limit || ''}
                                                onChange={(e) => setData('time_limit', e.target.value ? parseInt(e.target.value) : null)}
                                                className="w-full border border-alpha/30 rounded-lg px-4 py-2 bg-light dark:bg-dark text-dark dark:text-light focus:border-alpha focus:ring-2 focus:ring-alpha/20"
                                                placeholder={`Default: ${geeko.time_limit}s`}
                                            />
                                        </div>
                                    </div>

                                    {/* Form Actions */}
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="flex items-center space-x-2 px-4 py-2 border border-white/20 rounded-lg hover:bg-white/40 transition-colors backdrop-blur"
                                        >
                                            <X size={16} />
                                            <span>Cancel</span>
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="flex items-center space-x-2 bg-gradient-to-r from-alpha to-yellow-400 text-dark px-6 py-3 rounded-xl hover:from-alpha/90 hover:to-yellow-400/90 transition-all disabled:opacity-50 font-bold shadow"
                                        >
                                            <Save size={16} />
                                            <span>{processing ? 'Saving...' : (editingQuestion ? 'Update' : 'Add Question')}</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Questions Grid */}
                        {questions && questions.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {questions.map((question, index) => (
                                    <QuestionCard
                                        key={question.id}
                                        question={question}
                                        index={index}
                                        isExpanded={expandedQuestion === question.id}
                                        onExpand={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
                                        onEdit={() => handleEditQuestion(question)}
                                        onDelete={() => setConfirmDelete(question.id)}
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={handleDragOver}
                                        onDragEnd={handleDragEnd}
                                        onDrop={(e) => handleDrop(e, index)}
                                        isDragging={draggedIndex === index}
                                        // Edit handlers
                                        updateLocalQuestionField={updateLocalQuestionField}
                                        updateLocalOption={updateLocalOption}
                                        addLocalOption={addLocalOption}
                                        removeLocalOption={removeLocalOption}
                                        toggleLocalCorrect={toggleLocalCorrect}
                                        changeTypeAdjustOptions={changeTypeAdjustOptions}
                                        saveQuestion={saveQuestion}
                                        geeko={geeko}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <div className="w-24 h-24 mx-auto mb-6 rounded-2xl backdrop-blur bg-white/50 dark:bg-dark/40 border border-white/20 flex items-center justify-center text-2xl font-bold text-alpha">QUIZ</div>
                                <h3 className="text-2xl font-bold text-dark dark:text-light mb-4">
                                    No Questions Yet
                                </h3>
                                <p className="text-dark/70 dark:text-light/70 mb-8 max-w-md mx-auto">
                                    Add your first question to get started. You can create multiple choice, true/false, or open-ended questions.
                                </p>
                                <button
                                    onClick={handleAddQuestion}
                                    className="inline-flex items-center space-x-2 bg-alpha text-dark px-6 py-3 rounded-lg hover:bg-alpha/90 transition-colors font-semibold"
                                >
                                    <Plus size={20} />
                                    <span>Add Your First Question</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {confirmDelete && (
                    <div className="fixed inset-0 bg-dark/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-light dark:bg-dark border border-alpha/20 rounded-2xl p-6 max-w-md w-full mx-4">
                            <h3 className="text-xl font-bold text-dark dark:text-light mb-4">
                                Delete Question
                            </h3>
                            <p className="text-dark/70 dark:text-light/70 mb-6">
                                Are you sure you want to delete this question? This action cannot be undone.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="flex-1 px-4 py-2 border border-alpha/30 rounded-lg hover:bg-alpha/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteQuestion(confirmDelete)}
                                    className="flex-1 px-4 py-2 bg-error text-light rounded-lg hover:bg-error/90 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Minimalist Game Info Modal */}
                <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
                    <DialogContent className="sm:max-w-lg bg-white dark:bg-dark border border-alpha/20">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold text-dark dark:text-light">Start Game Session</DialogTitle>
                            <p className="text-dark/60 dark:text-light/60 text-sm">
                                Update quiz details before starting the game.
                            </p>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div>
                                <label className="text-sm font-medium text-dark dark:text-light mb-2 block">Quiz Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter quiz title..."
                                    value={meta.title}
                                    onChange={(e) => setMeta(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full p-3 border border-alpha/20 rounded-lg bg-white dark:bg-dark/80 text-dark dark:text-light focus:ring-2 focus:ring-alpha focus:border-alpha transition-colors"
                                    maxLength={95}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-dark dark:text-light mb-2 block">Description (Optional)</label>
                                <textarea
                                    placeholder="Brief description of the quiz..."
                                    value={meta.description}
                                    onChange={(e) => setMeta(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full p-3 border border-alpha/20 rounded-lg bg-white dark:bg-dark/80 text-dark dark:text-light focus:ring-2 focus:ring-alpha focus:border-alpha transition-colors resize-none"
                                    rows={3}
                                    maxLength={200}
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="px-4 py-2 text-dark/60 dark:text-light/60 hover:text-dark dark:hover:text-light transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmAndCreateSession}
                                    disabled={!meta.title?.trim()}
                                    className="px-6 py-2 bg-alpha text-dark rounded-lg font-medium hover:bg-alpha/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Start Game
                                </button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

// Question Card Component
function QuestionCard({
    question,
    index,
    isExpanded,
    onExpand,
    onEdit,
    onDelete,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDrop,
    isDragging,
    updateLocalQuestionField,
    updateLocalOption,
    addLocalOption,
    removeLocalOption,
    toggleLocalCorrect,
    changeTypeAdjustOptions,
    saveQuestion,
    geeko
}) {
    const getQuestionIcon = (type) => {
        const questionTypes = [
            { value: 'multiple_choice', label: 'Multiple Choice', icon: 'MC' },
            { value: 'true_false', label: 'True/False', icon: 'TF' },
            { value: 'type_answer', label: 'Type Answer', icon: 'TA' },
        ];
        return questionTypes.find(t => t.value === type)?.icon || 'Q';
    };

    const getQuestionTypeLabel = (type) => {
        const questionTypes = [
            { value: 'multiple_choice', label: 'Multiple Choice' },
            { value: 'true_false', label: 'True/False' },
            { value: 'type_answer', label: 'Type Answer' },
        ];
        return questionTypes.find(t => t.value === type)?.label || 'Question';
    };

    return (
        <div
            draggable
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            onDrop={onDrop}
            className={`bg-white dark:bg-dark/80 border border-alpha/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-move ${isDragging ? 'opacity-50 scale-95' : ''
                } ${isExpanded ? 'ring-1 ring-alpha/40' : ''}`}
        >
            {/* Minimalist Card Header */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <GripVertical size={16} className="text-dark/40 dark:text-light/40" />
                        <div className="w-8 h-8 rounded-lg bg-alpha/10 flex items-center justify-center text-sm font-semibold text-alpha">
                            {getQuestionIcon(question.type)}
                        </div>
                        <div>
                            <div className="text-sm font-medium text-dark dark:text-light">
                                Question {index + 1}
                            </div>
                            <div className="text-xs text-dark/50 dark:text-light/50">
                                {getQuestionTypeLabel(question.type)}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={onExpand}
                            className="p-1.5 rounded-md hover:bg-alpha/10 transition-colors"
                        >
                            {/* {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />} */}
                            <Edit3 size={14} />
                        </button>

                        <button
                            onClick={onDelete}
                            className="p-1.5 rounded-md hover:bg-error/10 text-error transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>

                {/* Minimalist Question Preview */}
                <div className="mb-3">
                    <h3 className="font-medium text-dark dark:text-light line-clamp-2 mb-2">
                        {question.question || 'Untitled question'}
                    </h3>

                    {/* Options Preview */}
                    <div className="space-y-1">
                        {(Array.isArray(question.options) ? question.options.slice(0, 2) : []).map((option, optionIndex) => {
                            const correctArray = Array.isArray(question.correct_answers) ? question.correct_answers : [];
                            const isCorrect = correctArray.includes(optionIndex);
                            return (
                                <div key={optionIndex} className={`flex items-center space-x-2 text-sm ${isCorrect ? 'text-good font-medium' : 'text-dark/60 dark:text-light/60'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${isCorrect ? 'bg-good' : 'bg-dark/30 dark:bg-light/30'}`} />
                                    <span className="line-clamp-1">{typeof option === 'string' ? option : (option?.text ?? '')}</span>
                                </div>
                            );
                        })}
                        {Array.isArray(question.options) && question.options.length > 2 && (
                            <div className="text-xs text-dark/40 dark:text-light/40">
                                +{question.options.length - 2} more
                            </div>
                        )}
                    </div>
                </div>

                {/* Minimalist Stats */}
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 rounded-md bg-dark/5 dark:bg-light/5 text-dark/60 dark:text-light/60">
                            {question.points} pts
                        </span>
                        <span className="px-2 py-1 rounded-md bg-dark/5 dark:bg-light/5 text-dark/60 dark:text-light/60">
                            {question.time_limit || geeko.time_limit}s
                        </span>
                    </div>
                    {Array.isArray(question.correct_answers) && question.correct_answers.length > 0 && (
                        <span className="px-2 py-1 rounded-md bg-good/10 text-good text-xs font-medium">
                            {question.correct_answers.length} correct
                        </span>
                    )}
                </div>
            </div>

            {/* Minimalist Expanded Edit Mode */}
            {isExpanded && (
                <div className="border-t border-alpha/10 p-4 bg-gray-50 dark:bg-dark/60">
                    <div className="space-y-6">
                        {/* Question Text */}
                        <div>
                            <label className="block text-sm font-semibold text-dark dark:text-light mb-2">Question</label>
                            <input
                                type="text"
                                className="w-full border border-alpha/30 rounded-lg px-4 py-2 bg-light dark:bg-dark text-dark dark:text-light"
                                value={question.question || ''}
                                onChange={(e) => updateLocalQuestionField(question.id, 'question', e.target.value)}
                            />
                        </div>

                        {/* Answer Options */}
                        <div>
                            <label className="block text-sm font-semibold text-dark dark:text-light mb-2">Answer Options</label>
                            <div className="space-y-2">
                                {(Array.isArray(question.options) ? question.options : []).map((option, optionIndex) => {
                                    const correctArray = Array.isArray(question.correct_answers) ? question.correct_answers : [];
                                    const isCorrect = correctArray.includes(optionIndex);
                                    return (
                                        <div key={optionIndex} className={`flex items-center gap-3 rounded-lg px-2 py-2 ${isCorrect ? 'bg-alpha/10' : ''}`}>
                                            <button
                                                type="button"
                                                onClick={() => toggleLocalCorrect(question.id, optionIndex, question.type)}
                                                className={`w-8 h-8 rounded-full border-2 ${isCorrect ? 'border-alpha bg-alpha text-dark' : 'border-dark/30 dark:border-light/30 bg-transparent'} hover:bg-alpha/10 transition-colors flex items-center justify-center`}
                                            >
                                                {isCorrect ? <CheckCircle size={14} /> : ''}
                                            </button>
                                            <input
                                                type="text"
                                                className="flex-1 border border-alpha/30 rounded-lg px-3 py-2 bg-light dark:bg-dark text-dark dark:text-light"
                                                value={typeof option === 'string' ? option : (option?.text ?? '')}
                                                onChange={(e) => updateLocalOption(question.id, optionIndex, e.target.value)}
                                                readOnly={question.type === 'true_false'}
                                            />
                                            {question.type === 'multiple_choice' && (Array.isArray(question.options) ? question.options.length : 0) > 2 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeLocalOption(question.id, optionIndex)}
                                                    className="p-2 text-error hover:bg-error/10 rounded-lg"
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {question.type === 'multiple_choice' && (Array.isArray(question.options) ? question.options.length : 0) < 6 && (
                                <button
                                    type="button"
                                    onClick={() => addLocalOption(question.id)}
                                    className="mt-2 inline-flex items-center space-x-2 text-alpha hover:text-alpha/80 font-semibold"
                                >
                                    <Plus size={16} />
                                    <span>Add Option</span>
                                </button>
                            )}
                        </div>

                        {/* Settings Row */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-dark dark:text-light mb-2">Type</label>
                                <select
                                    value={question.type || 'multiple_choice'}
                                    onChange={(e) => changeTypeAdjustOptions(question.id, e.target.value)}
                                    className="w-full p-2 border border-alpha/30 rounded-lg bg-light dark:bg-dark text-dark dark:text-light"
                                >
                                    <option value="multiple_choice">Multiple Choice</option>
                                    <option value="true_false">True/False</option>
                                    <option value="type_answer">Type Answer</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-dark dark:text-light mb-2">Time (s)</label>
                                <input
                                    type="number"
                                    min="5"
                                    max="300"
                                    value={question.time_limit || ''}
                                    onChange={(e) => updateLocalQuestionField(question.id, 'time_limit', e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-full border border-alpha/30 rounded-lg px-3 py-2 bg-light dark:bg-dark text-dark dark:text-light"
                                    placeholder={`${geeko.time_limit}s`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-dark dark:text-light mb-2">Points</label>
                                <input
                                    type="number"
                                    min="100"
                                    max="2000"
                                    step="100"
                                    value={question.points}
                                    onChange={(e) => updateLocalQuestionField(question.id, 'points', parseInt(e.target.value))}
                                    className="w-full border border-alpha/30 rounded-lg px-3 py-2 bg-light dark:bg-dark text-dark dark:text-light"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-4">
                            <button
                                onClick={() => saveQuestion(question)}
                                className="flex-1 inline-flex items-center justify-center space-x-2 bg-alpha text-dark px-4 py-2 rounded-lg hover:bg-alpha/90 font-semibold"
                            >
                                <Save size={16} />
                                <span>Save</span>
                            </button>
                            <button
                                onClick={onExpand}
                                className="flex-1 inline-flex items-center justify-center space-x-2 border border-alpha/30 px-4 py-2 rounded-lg hover:bg-alpha/10 font-semibold"
                            >
                                <X size={16} />
                                <span>Close</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}