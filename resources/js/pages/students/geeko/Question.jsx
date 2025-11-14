import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Clock, CheckCircle, Users, Trophy } from 'lucide-react';

export default function GeekoQuestion({ session, participant, question, hasAnswered, questionNumber, totalQuestions }) {
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [timeLeft, setTimeLeft] = useState(question.time_limit || session.geeko.time_limit);
    const [timeTaken, setTimeTaken] = useState(0);
    const [isReadingPhase, setIsReadingPhase] = useState(true);
    const [hasSubmitted, setHasSubmitted] = useState(hasAnswered);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState(null);

    // Ensure options is always an array
    const safeOptions = (() => {
        if (Array.isArray(question.options)) {
            return question.options;
        }
        if (typeof question.options === 'string') {
            try {
                return JSON.parse(question.options);
            } catch (e) {
                console.error('Failed to parse options JSON:', e);
                return [];
            }
        }
        return [];
    })();





    // Apply 3s reading phase based on current_question_started_at
    useEffect(() => {
        const startedAt = session.current_question_started_at ? new Date(session.current_question_started_at) : new Date();
        const now = new Date();
        const msSinceStart = now.getTime() - startedAt.getTime();
        const remaining = 3000 - msSinceStart;
        if (remaining <= 0) {
            setIsReadingPhase(false);
            return;
        }
        const t = setTimeout(() => setIsReadingPhase(false), remaining);
        return () => clearTimeout(t);
    }, [session.current_question_started_at]);

    // Timer effect (students no longer show timer, but we keep timeTaken for scoring). Only start after reading phase
    useEffect(() => {
        if (isReadingPhase || hasSubmitted || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                const newTime = prev - 1;
                setTimeTaken(prev => prev + 1);
                if (newTime <= 0) {
                    handleSubmit(true);
                    return 0;
                }
                return newTime;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isReadingPhase, hasSubmitted, timeLeft]);

    // Poll for game state changes
    useEffect(() => {
        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch(`/geeko/play/${session.id}/live-data`);
                const data = await response.json();
                
                // Check if we moved to next question or game ended
                if (data.current_question_index !== session.current_question_index) {
                    router.visit(`/geeko/play/${session.id}/question`);
                } else if (data.session_status === 'completed') {
                    router.visit(`/geeko/play/${session.id}/completed`);
                }
            } catch (error) {
                console.error('Failed to fetch live data:', error);
            }
        }, 3000);

        return () => clearInterval(pollInterval);
    }, [session.id]);

    const handleAnswerSelect = (answer) => {
        if (hasSubmitted) return;
        
        
        if (question.type === 'multiple_choice') {
            // For multiple choice, we can select multiple answers
            setSelectedAnswer(prev => {
                if (Array.isArray(prev)) {
                    if (prev.includes(answer)) {
                        return prev.filter(a => a !== answer);
                    } else {
                        return [...prev, answer];
                    }
                } else {
                    return [answer];
                }
            });
        } else {
            // For true/false and type answers, single selection
            setSelectedAnswer(answer);
        }
    };

    const handleSubmit = async (isAutoSubmit = false) => {
        if (hasSubmitted || isSubmitting) return;
        if (!isAutoSubmit && (!selectedAnswer || (Array.isArray(selectedAnswer) && selectedAnswer.length === 0))) return;

        setIsSubmitting(true);

        try {
            const requestData = {
                question_id: question.id,
                selected_answer: selectedAnswer || (question.type === 'multiple_choice' ? [] : ''),
                time_taken: timeTaken,
            };

            //('=== FRONTEND SUBMISSION DEBUG ===');
            //('Request data:', requestData);
            //('Question type:', question.type);
            //('Selected answer:', selectedAnswer);
            //('Time taken:', timeTaken);
            //('================================');

            const response = await fetch(`/geeko/play/${session.id}/answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify(requestData),
            });

            //('Response status:', response.status);
            //('Response headers:', response.headers);
            
            const data = await response.json();
            //('Response data:', data);
            
            
            if (data.success) {
                setHasSubmitted(true);
                setResult(data);
                setShowResult(true);
                
                // Hide result after 3 seconds and show waiting screen
                setTimeout(() => {
                    router.visit(`/geeko/play/${session.id}/waiting`);
                }, 3000);
            } else {
                //alert(`Failed to submit answer: ${data.error || 'Unknown error'}`);
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error('Failed to submit answer:', error);
            //alert('Failed to submit answer. Please try again.');
            setIsSubmitting(false);
        }
    };

    const getTimeColor = () => {
        const percentage = (timeLeft / (question.time_limit || session.geeko.time_limit)) * 100;
        if (percentage > 60) return 'text-good';
        if (percentage > 30) return 'text-alpha';
        return 'text-error';
    };

    const getProgressPercentage = () => {
        return ((question.time_limit || session.geeko.time_limit) - timeLeft) / (question.time_limit || session.geeko.time_limit) * 100;
    };

    const formatAnswer = (answer, index) => {
        if (question.type === 'true_false') {
            return answer;
        } else if (question.type === 'multiple_choice') {
            return `${String.fromCharCode(65 + index)}. ${answer}`;
        } else {
            return answer;
        }
    };

    const isAnswerSelected = (answer, index) => {
        if (question.type === 'multiple_choice') {
            return Array.isArray(selectedAnswer) && selectedAnswer.includes(index);
        } else if (question.type === 'true_false') {
            return selectedAnswer === answer;
        } else {
            return selectedAnswer === index;
        }
    };

    if (showResult && result) {
        return (
            <AppLayout>
                <Head title={`Question ${questionNumber} Result`} />
                
                <div className="min-h-screen bg-light dark:bg-dark flex items-center justify-center p-6">
                    <div className="w-full max-w-2xl text-center">
                        <div className={`text-6xl mb-6 ${result.is_correct ? 'animate-bounce text-good' : 'text-error'}`}>
                            {result.is_correct ? 'Correct' : 'Incorrect'}
                        </div>
                        
                        <h1 className={`text-4xl font-extrabold mb-4 ${result.is_correct ? 'text-good' : 'text-error'}`}>
                            {result.is_correct ? 'Correct!' : 'Incorrect'}
                        </h1>
                        
                        <div className="backdrop-blur-xl bg-white/60 dark:bg-dark/50 border border-white/20 rounded-2xl p-8 mb-8 shadow-xl">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-alpha mb-2">
                                        +{result.points_earned}
                                    </div>
                                    <div className="text-dark/70 dark:text-light/70">Points Earned</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-500 mb-2">
                                        {timeTaken}s
                                    </div>
                                    <div className="text-dark/70 dark:text-light/70">Time Taken</div>
                                </div>
                            </div>
                        </div>

                        {result.correct_answer && (
                            <div className="backdrop-blur bg-good/10 border border-good/20 rounded-2xl p-6 mb-8">
                                <h3 className="text-lg font-bold text-good mb-3">Correct Answer:</h3>
                                <div className="space-y-2">
                                    {Array.isArray(result.correct_answer) ? 
                                        result.correct_answer.map((answerIndex, idx) => (
                                            <div key={idx} className="text-dark dark:text-light font-semibold">
                                                {safeOptions && safeOptions[answerIndex] ? formatAnswer(safeOptions[answerIndex], answerIndex) : `Answer ${answerIndex + 1}`}
                                            </div>
                                        )) :
                                        <div className="text-dark dark:text-light font-semibold">
                                            {result.correct_answer}
                                        </div>
                                    }
                                </div>
                            </div>
                        )}

                        <p className="text-dark/70 dark:text-light/70">
                            Moving to next question in a moment...
                        </p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title={`Question ${questionNumber} of ${totalQuestions}`} />

            <div className="min-h-screen bg-gradient-to-br from-alpha/5 to-transparent dark:from-alpha/10 dark:to-transparent p-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center space-x-4 mb-4">
                        <div className="backdrop-blur bg-alpha/80 text-dark px-4 py-2 rounded-full font-bold shadow">
                            Question {questionNumber} of {totalQuestions}
                        </div>
                        <div className="backdrop-blur bg-white/60 dark:bg-dark/50 border border-white/20 px-4 py-2 rounded-full shadow">
                            <Users size={16} className="inline mr-2" />
                            <span className="font-semibold">{participant.total_score} pts</span>
                        </div>
                    </div>

                    {/* Timer */}
                    <div className="mb-6">
                        <div className={`text-6xl font-extrabold mb-2 ${getTimeColor()}`}>
                            {timeLeft}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                            <div 
                                className={`h-3 rounded-full transition-all duration-1000 ${
                                    timeLeft > 10 ? 'bg-good' : timeLeft > 5 ? 'bg-alpha' : 'bg-error'
                                }`}
                                style={{ width: `${100 - getProgressPercentage()}%` }}
                            ></div>
                        </div>
                        <p className="text-dark/70 dark:text-light/70">seconds remaining</p>
                    </div>
                </div>

                {/* Question */}
                <div className="max-w-4xl mx-auto">
                        <div className="backdrop-blur-xl bg-white/60 dark:bg-dark/50 border border-white/20 rounded-2xl p-8 mb-8 text-center shadow-xl">
                        {/* Students: do not show question text; only options. Show a short reading phase overlay */}
                        {isReadingPhase && (
                            <div className="mb-6 text-dark/70 dark:text-light/70 font-semibold">
                                Get ready... The question is displayed on the instructor screen.
                            </div>
                        )}
                        
                        {question.question_image && (
                            <img 
                                src={`/storage/${question.question_image}`} 
                                alt="Question" 
                                className="max-w-full h-auto rounded-lg mx-auto mb-6"
                            />
                        )}

                        {/* Answer Options */}
                        <div className="space-y-4">
                            {question.type === 'type_answer' ? (
                                <div className="max-w-md mx-auto">
                                    <input
                                        type="text"
                                        value={selectedAnswer || ''}
                                        onChange={(e) => setSelectedAnswer(e.target.value)}
                                        className="w-full text-center text-xl border border-alpha/30 rounded-xl px-6 py-4 bg-light dark:bg-dark text-dark dark:text-light focus:border-alpha focus:ring-2 focus:ring-alpha/20"
                                        placeholder="Type your answer here..."
                                        disabled={hasSubmitted || isReadingPhase}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && selectedAnswer && selectedAnswer.trim()) {
                                                handleSubmit();
                                            }
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {safeOptions && safeOptions.length > 0 ? safeOptions.map((option, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleAnswerSelect(question.type === 'true_false' ? option : index)}
                                            disabled={hasSubmitted || isReadingPhase}
                                            className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left backdrop-blur ${
                                                isAnswerSelected(option, index)
                                                    ? 'border-alpha bg-alpha/20 scale-105'
                                                    : 'border-white/20 hover:border-alpha/60 hover:bg-white/30'
                                            } ${hasSubmitted ? 'opacity-50 cursor-not-allowed' : 'hover:scale-102'}`}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
                                                    isAnswerSelected(option, index)
                                                        ? 'border-alpha bg-alpha text-dark'
                                                        : 'border-alpha/50 text-alpha'
                                                }`}>
                                                    {question.type === 'true_false' ? 
                                                        (option === 'True' ? '✓' : '✗') :
                                                        String.fromCharCode(65 + index)
                                                    }
                                                </div>
                                                <span className="text-lg font-semibold text-dark dark:text-light">
                                                    {option}
                                                </span>
                                            </div>
                                        </button>
                                    )) : (
                                        <div className="col-span-2 text-center py-8">
                                            <p className="text-dark/60 dark:text-light/60">No options available for this question.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        {!hasSubmitted && (
                            <button
                                onClick={() => handleSubmit()}
                                disabled={isReadingPhase || isSubmitting || !selectedAnswer || (Array.isArray(selectedAnswer) && selectedAnswer.length === 0)}
                                className="mt-8 bg-gradient-to-r from-alpha to-yellow-400 text-dark text-xl font-bold py-4 px-8 rounded-xl hover:from-alpha/90 hover:to-yellow-400/90 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center space-x-3">
                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-dark border-t-transparent"></div>
                                        <span>Submitting...</span>
                                    </div>
                                ) : (
                                    <>Submit Answer</>
                                )}
                            </button>
                        )}

                        {/* Already Answered */}
                        {hasSubmitted && (
                            <div className="mt-8 bg-good/10 border border-good/20 rounded-xl p-6">
                                <div className="flex items-center justify-center space-x-3">
                                    <CheckCircle className="text-good" size={24} />
                                    <span className="text-good font-bold text-lg">Answer Submitted!</span>
                                </div>
                                <p className="text-dark/70 dark:text-light/70 mt-2">
                                    Waiting for other players to finish...
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Help Text */}
                        {question.type === 'multiple_choice' && !hasSubmitted && (
                        <div className="text-center">
                            <p className="text-sm text-dark/60 dark:text-light/60">
                                Tip: You can select multiple answers if needed
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

