import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@headlessui/react';

export default function Create({ formation, coach, coachId }) {
  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: '',
      type: 'multiple_choice',
      options: [
        { id: 1, text: '', isCorrect: false, color: 'bg-red-500' },
        { id: 2, text: '', isCorrect: false, color: 'bg-blue-500' },
        { id: 3, text: '', isCorrect: false, color: 'bg-yellow-500' },
        { id: 4, text: '', isCorrect: false, color: 'bg-green-500' }
      ],
      timeLimit: 20,
      points: 1000,
      image: null,
      isComplete: false
    }
  ]);
  
  const [selectedQuestionId, setSelectedQuestionId] = useState(1);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const { data, setData, post, processing, errors } = useForm({
    title: '',
    description: '',
    time_limit: 20,
    show_correct_answers: true,
    status: 'draft'
  });

  useEffect(() => {
    const question = questions.find(q => q.id === selectedQuestionId);
    setSelectedQuestion(question || questions[0]);
  }, [questions, selectedQuestionId]);

  const addQuestion = () => {
    const newId = Math.max(...questions.map(q => q.id)) + 1;
    const newQuestion = {
      id: newId,
      question: '',
      type: 'multiple_choice',
      options: [
        { id: 1, text: '', isCorrect: false, color: 'bg-red-500' },
        { id: 2, text: '', isCorrect: false, color: 'bg-blue-500' },
        { id: 3, text: '', isCorrect: false, color: 'bg-yellow-500' },
        { id: 4, text: '', isCorrect: false, color: 'bg-green-500' }
      ],
      timeLimit: 20,
      points: 1000,
      image: null,
      isComplete: false
    };
    setQuestions([...questions, newQuestion]);
    setSelectedQuestionId(newId);
  };

  const updateQuestion = (field, value) => {
    const updatedQuestions = questions.map(q => {
      if (q.id === selectedQuestionId) {
        const updatedQ = { ...q, [field]: value };
        
        // Auto-save logic: mark as complete if all required fields are filled
        if (field === 'type' && value === 'true_false') {
          // For true/false, we need question text and correct answer
          updatedQ.options = [
            { id: 1, text: 'True', isCorrect: false, color: 'bg-green-500' },
            { id: 2, text: 'False', isCorrect: false, color: 'bg-red-500' }
          ];
        } else if (field === 'type' && value === 'type_answer') {
          // For type answer, we need question text and correct answer
          updatedQ.options = [
            { id: 1, text: '', isCorrect: true, color: 'bg-alpha' }
          ];
        } else if (field === 'type' && value === 'multiple_choice') {
          // Reset to multiple choice options
          updatedQ.options = [
            { id: 1, text: '', isCorrect: false, color: 'bg-red-500' },
            { id: 2, text: '', isCorrect: false, color: 'bg-blue-500' },
            { id: 3, text: '', isCorrect: false, color: 'bg-yellow-500' },
            { id: 4, text: '', isCorrect: false, color: 'bg-green-500' }
          ];
        }
        
        // Check if question is complete
        updatedQ.isComplete = checkQuestionComplete(updatedQ);
        return updatedQ;
      }
      return q;
    });
    setQuestions(updatedQuestions);
  };

  const checkQuestionComplete = (question) => {
    if (!question.question.trim()) return false;
    
    if (question.type === 'multiple_choice') {
      const hasCorrectAnswer = question.options.some(opt => opt.isCorrect);
      const hasAllOptions = question.options.every(opt => opt.text.trim());
      return hasCorrectAnswer && hasAllOptions;
    } else if (question.type === 'true_false') {
      const hasCorrectAnswer = question.options.some(opt => opt.isCorrect);
      return hasCorrectAnswer;
    } else if (question.type === 'type_answer') {
      const hasCorrectAnswer = question.options[0]?.text.trim();
      return !!hasCorrectAnswer;
    }
    
    return false;
  };

  const updateOption = (optionId, field, value) => {
    const updatedQuestions = questions.map(q => {
      if (q.id === selectedQuestionId) {
        const updatedQ = {
          ...q,
          options: q.options.map(opt => 
            opt.id === optionId 
              ? { ...opt, [field]: value }
              : opt
          )
        };
        
        // Re-check if question is complete after option update
        updatedQ.isComplete = checkQuestionComplete(updatedQ);
        return updatedQ;
      }
      return q;
    });
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (questionId) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter(q => q.id !== questionId);
      setQuestions(newQuestions);
      
      const remainingIds = newQuestions.map(q => q.id).sort((a, b) => a - b);
      setSelectedQuestionId(remainingIds[0]);
    }
  };

  const duplicateQuestion = () => {
    const newId = Math.max(...questions.map(q => q.id)) + 1;
    const duplicatedQuestion = {
      ...selectedQuestion,
      id: newId,
      question: selectedQuestion.question + ' (Copy)'
    };
    setQuestions([...questions, duplicatedQuestion]);
    setSelectedQuestionId(newId);
  };

  const handleSave = () => {
    setShowDetailsModal(true);
  };

  const submitGame = () => {
    const sanitizedQuestions = questions.map((q) => ({
      ...q,
      // ensure numeric values are numbers
      points: typeof q.points === 'string' ? (q.points === 'standard' ? 1000 : parseInt(q.points, 10) || 1000) : (q.points ?? 1000),
      timeLimit: typeof q.timeLimit === 'string' ? parseInt(q.timeLimit, 10) || 20 : (q.timeLimit ?? 20),
    }));

    const payload = { ...data, data: { questions: sanitizedQuestions } };

    console.log('Submitting data:', payload);
    console.log('Questions:', sanitizedQuestions);

    router.post(`/training/${formation.id}/geeko`, payload, {
      onSuccess: () => {
        // Backend redirects to show page; no manual navigation needed
      },
    });
  };

  const getQuestionTypeIcon = (type) => {
    switch(type) {
      case 'multiple_choice': return 'Q';
      case 'true_false': return 'T';
      case 'type_answer': return 'A';
      default: return 'Q';
    }
  };

  const getQuestionTypeLabel = (type) => {
    switch(type) {
      case 'multiple_choice': return 'Quiz';
      case 'true_false': return 'True/False';
      case 'type_answer': return 'Type Answer';
      default: return 'Quiz';
    }
  };

  return (
    <AppLayout>
      <Head title="Create Geeko - Kahoot Style" />

      {/* Main Container */}
      <div className="min-h-screen bg-light dark:bg-dark">
        {/* Top Header */}
        <div className="bg-light dark:bg-dark border-b border-alpha/20 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Left - Back Button */}
              <div className="flex items-center">
                <Link 
                  href={`/training/${formation.id}/geeko`}
                  className="flex items-center text-dark/70 dark:text-light/70 hover:text-alpha dark:hover:text-alpha transition-colors font-semibold"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Geeko
                </Link>
              </div>

              {/* Center - Title Input */}
              <div className="flex-1 flex justify-center px-8">
                <input
                  type="text"
                  placeholder="Enter your quiz title..."
                  className="bg-light dark:bg-dark border border-alpha/30 rounded-xl px-6 py-3 w-full max-w-lg text-dark dark:text-light placeholder-dark/50 dark:placeholder-light/50 focus:ring-2 focus:ring-alpha focus:border-alpha transition-all duration-300 text-center font-semibold text-lg"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                />
              </div>

              {/* Right - Save Button */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-dark/60 dark:text-light/60 font-medium">
                    {questions.filter(q => q.isComplete).length} / {questions.length} Complete
                  </div>
                  <div className="text-xs text-dark/50 dark:text-light/50">
                    {questions.filter(q => q.isComplete).length === questions.length ? 'Ready to save!' : 'Complete all questions'}
                  </div>
                </div>
                <button
                  onClick={handleSave}
                  disabled={questions.filter(q => q.isComplete).length === 0}
                  className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg ${
                    questions.filter(q => q.isComplete).length > 0
                      ? 'bg-alpha text-dark hover:bg-alpha/90 hover:scale-105'
                      : 'bg-dark/20 dark:bg-light/20 text-dark/50 dark:text-light/50 cursor-not-allowed'
                  }`}
                >
                  {questions.filter(q => q.isComplete).length === questions.length ? 'Save & Continue' : 'Save Draft'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Left Sidebar - Questions List */}
            <div className="w-80 bg-light dark:bg-dark border border-alpha/20 rounded-2xl p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-dark dark:text-light mb-4">
                  {questions.length} Question{questions.length !== 1 ? 's' : ''}
                </h3>
                
                {/* Questions List */}
                <div className="space-y-3">
                  {questions.map((question) => (
                    <div
                      key={question.id}
                      onClick={() => setSelectedQuestionId(question.id)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                        question.id === selectedQuestionId 
                          ? 'bg-alpha text-dark border-2 border-alpha shadow-lg' 
                          : 'bg-light dark:bg-dark border border-alpha/20 hover:border-alpha/40 hover:shadow-md text-dark/70 dark:text-light/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className={`w-8 h-8 ${
                            question.isComplete ? 'bg-good text-light' : 'bg-alpha text-dark'
                          } rounded-full flex items-center justify-center text-sm font-bold`}>
                            {question.isComplete ? '✓' : getQuestionTypeIcon(question.type)}
                          </span>
                          <span className="font-semibold">Question {question.id}</span>
                          {question.isComplete && (
                            <span className="text-xs bg-good/20 text-good px-2 py-1 rounded-full font-medium">
                              Complete
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-dark/10 dark:bg-light/10 px-2 py-1 rounded-full font-medium">
                            {question.points || '1000'}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-dark/60 dark:text-light/60 line-clamp-2">
                        {question.question || 'Untitled question'}
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-dark/50 dark:text-light/50">
                          {getQuestionTypeLabel(question.type)}
                        </span>
                        <span className="text-xs text-dark/50 dark:text-light/50">
                          {question.timeLimit}s
                        </span>
                      </div>
                      {question.image && (
                        <div className="mt-3">
                          <div className="w-full h-16 bg-alpha/20 rounded-lg flex items-center justify-center">
                            <span className="text-dark/60 font-medium">Image</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Question Buttons */}
              <div className="space-y-4">
                <button
                  onClick={addQuestion}
                  className="w-full bg-alpha text-dark py-3 px-4 rounded-xl font-bold hover:bg-alpha/90 transition-all duration-300 hover:scale-105"
                >
                  + Add Question
                </button>
                <button className="w-full bg-dark/10 dark:bg-light/10 text-dark dark:text-light py-3 px-4 rounded-xl font-semibold hover:bg-dark/20 dark:hover:bg-light/20 transition-colors flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Generate with AI
                </button>
              </div>
            </div>

            {/* Center - Question Editor */}
            <div className="flex-1 bg-light dark:bg-dark border border-alpha/20 rounded-2xl p-8 relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-72 h-36 bg-gradient-to-br from-alpha/10 via-alpha/5 to-transparent rounded-bl-3xl"></div>
              
              {/* Question Status */}
              {selectedQuestion && (
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                      selectedQuestion.isComplete ? 'bg-good text-light' : 'bg-alpha text-dark'
                    }`}>
                      {selectedQuestion.isComplete ? '✓' : '!'}
                    </span>
                    <span className="text-sm font-semibold text-dark dark:text-light">
                      {selectedQuestion.isComplete ? 'Question Complete' : 'Complete this question'}
                    </span>
                  </div>
                  <div className="text-sm text-dark/60 dark:text-light/60">
                    {getQuestionTypeLabel(selectedQuestion.type)} • {selectedQuestion.timeLimit}s
                  </div>
                </div>
              )}
              
              <div className="space-y-8">
                {/* Question Title */}
                <div>
                  <Input
                    type="text"
                    placeholder="Start typing your question here..."
                    className="w-full text-2xl font-bold  border-0 text-dark dark:text-light placeholder-dark/40 dark:placeholder-light/40 focus:ring-0  px-3"
                    value={selectedQuestion?.question || ''}
                    onChange={(e) => updateQuestion('question', e.target.value)}
                  />
                </div>

                {/* Logo Display */}
                <div className="bg-light dark:bg-dark border-2 border-dashed border-alpha/30 rounded-2xl p-12 text-center hover:border-alpha/50 transition-colors duration-300">
                  <div className="max-w-sm mx-auto">
                    <div className="space-y-6">
                      <div className="flex justify-center">
                        <div className="w-24 h-24 bg-alpha/20 rounded-2xl flex items-center justify-center">
                          <div className="text-4xl font-bold text-alpha">Q</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="text-2xl font-bold text-alpha">
                          Geeko Quiz
                        </div>
                        <div className="text-sm text-dark/60 dark:text-light/60">
                          Interactive learning experience
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Answer Options */}
                <div className="space-y-6">
                  {selectedQuestion?.type === 'type_answer' ? (
                    /* Type Answer Input */
                    <div className="bg-light dark:bg-dark border-2 border-alpha/30 rounded-2xl p-8">
                      <div className="text-center">
                        <h3 className="text-lg font-bold text-dark dark:text-light mb-4">Correct Answer</h3>
                        <input
                          type="text"
                          placeholder="Enter the correct answer..."
                          className="w-full p-4 border-0 rounded-xl bg-light dark:bg-dark text-dark dark:text-light focus:ring-2 focus:ring-alpha transition-all duration-300 text-center text-xl font-semibold"
                          value={selectedQuestion?.options?.[0]?.text || ''}
                          onChange={(e) => updateOption(selectedQuestion?.options?.[0]?.id, 'text', e.target.value)}
                        />
                        <p className="text-sm text-dark/60 dark:text-light/60 mt-3">
                          Students will type their answer and it will be compared to this correct answer.
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Multiple Choice / True False Options */
                    selectedQuestion?.options?.map((option, index) => (
                      <div key={option.id} className="relative">
                        <div className={`${
                          option.isCorrect 
                            ? 'bg-alpha text-dark shadow-lg' 
                            : 'bg-light dark:bg-dark border-2 border-alpha/30 hover:border-alpha/50'
                        } rounded-2xl flex items-center justify-between p-6  shadow-lg hover:shadow-xl transition-all duration-300`}>
                          <div className="flex items-center  w-full">
                            <input
                              type="text"
                              placeholder={selectedQuestion?.type === 'true_false' 
                                ? option.text 
                                : `Add answer ${index + 1}${index > 1 ? ' (optional)' : ''}`
                              }
                              className={`flex-1 focus:outline-0 bg-transparent border-0 ${
                                option.isCorrect 
                                  ? 'text-dark placeholder-dark/50' 
                                  : 'text-dark dark:text-light placeholder-dark/40 dark:placeholder-light/40'
                              } focus:ring-0 text-xl font-semibold`}
                              value={option.text}
                              onChange={(e) => updateOption(option.id, 'text', e.target.value)}
                              readOnly={selectedQuestion?.type === 'true_false'}
                            />
                           
                          </div>
                          
                          {/* Correct Answer Selection - Yellow Checkmark */}
                          <div className=" top-3 left-3">
                            <button
                              onClick={() => {
                                // For multiple choice, only one can be correct
                                if (selectedQuestion?.type === 'multiple_choice') {
                                  const updatedOptions = selectedQuestion.options.map(opt => ({
                                    ...opt,
                                    isCorrect: opt.id === option.id
                                  }));
                                  setQuestions(questions.map(q => 
                                    q.id === selectedQuestionId 
                                      ? { ...q, options: updatedOptions, isComplete: checkQuestionComplete({...q, options: updatedOptions}) }
                                      : q
                                  ));
                                } else {
                                  updateOption(option.id, 'isCorrect', !option.isCorrect);
                                }
                              }}
                              className={`w-8 h-8 rounded-full border-2 ${
                                option.isCorrect 
                                  ? 'border-alpha bg-alpha text-dark' 
                                  : 'border-dark/30 dark:border-light/30 bg-transparent'
                              } hover:bg-alpha/20 transition-colors flex items-center justify-center`}
                            >
                              {option.isCorrect && (
                                <span className="text-sm font-bold">✓</span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Question Settings */}
            <div className="w-80 bg-light dark:bg-dark border border-alpha/20 rounded-2xl p-6">
              <div className="space-y-8">
                {/* Question Type */}
                <div>
                  <label className="text-sm font-bold text-dark dark:text-light mb-3 block">
                    Question Type
                  </label>
                  <select
                    value={selectedQuestion?.type || 'multiple_choice'}
                    onChange={(e) => updateQuestion('type', e.target.value)}
                    className="w-full p-3 border border-alpha/30 rounded-xl bg-light dark:bg-dark text-dark dark:text-light focus:ring-2 focus:ring-alpha focus:border-alpha transition-all duration-300"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="true_false">True/False</option>
                    <option value="type_answer">Type Answer</option>
                  </select>
                </div>

                {/* Time Limit */}
                <div>
                  <label className="text-sm font-bold text-dark dark:text-light mb-3 block">
                    Time Limit
                  </label>
                  <select
                    value={selectedQuestion?.timeLimit || 20}
                    onChange={(e) => updateQuestion('timeLimit', parseInt(e.target.value))}
                    className="w-full p-3 border border-alpha/30 rounded-xl bg-light dark:bg-dark text-dark dark:text-light focus:ring-2 focus:ring-alpha focus:border-alpha transition-all duration-300"
                  >
                    <option value={5}>5 seconds</option>
                    <option value={10}>10 seconds</option>
                    <option value={20}>20 seconds</option>
                    <option value={30}>30 seconds</option>
                    <option value={60}>60 seconds</option>
                    <option value={120}>2 minutes</option>
                  </select>
                </div>

                {/* Points */}
                <div>
                  <label className="text-sm font-bold text-dark dark:text-light mb-3 block">
                    Points
                  </label>
                  <select
                    value={selectedQuestion?.points ?? 1000}
                    onChange={(e) => updateQuestion('points', parseInt(e.target.value, 10))}
                    className="w-full p-3 border border-alpha/30 rounded-xl bg-light dark:bg-dark text-dark dark:text-light focus:ring-2 focus:ring-alpha focus:border-alpha transition-all duration-300"
                  >
                    <option value={1000}>Standard (1000)</option>
                    <option value={500}>500 points</option>
                    <option value={1000}>1000 points</option>
                    <option value={2000}>2000 points</option>
                  </select>
                </div>

                {/* Answer Options */}
                <div>
                  <label className="text-sm font-bold text-dark dark:text-light mb-3 block">
                    Answer Options
                  </label>
                  <select className="w-full p-3 border border-alpha/30 rounded-xl bg-light dark:bg-dark text-dark dark:text-light focus:ring-2 focus:ring-alpha focus:border-alpha transition-all duration-300">
                    <option>Single Select</option>
                    <option>Multiple Select</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-6">
                  <button
                    onClick={removeQuestion}
                    className="w-full bg-error text-light py-3 px-4 rounded-xl font-semibold hover:bg-error/90 transition-all duration-300"
                  >
                    Delete Question
                  </button>
                  <button
                    onClick={duplicateQuestion}
                    className="w-full bg-dark/10 dark:bg-light/10 text-dark dark:text-light py-3 px-4 rounded-xl font-semibold hover:bg-dark/20 dark:hover:bg-light/20 transition-all duration-300"
                  >
                    Duplicate Question
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-lg bg-light dark:bg-dark border border-alpha/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-dark dark:text-light">Save Your Quiz</DialogTitle>
            <p className="text-dark/70 dark:text-light/70">
              Add final details to save your quiz. After saving, you'll be able to preview all questions, edit them, and create live game sessions with PIN codes for students to join.
            </p>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            <div>
              <label className="text-sm font-bold text-dark dark:text-light mb-3 block">
                Quiz Title
              </label>
              <input
                type="text"
                placeholder="Enter a compelling title for your quiz..."
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                className="w-full p-4 border border-alpha/30 rounded-xl bg-light dark:bg-dark text-dark dark:text-light focus:ring-2 focus:ring-alpha focus:border-alpha transition-all duration-300"
                maxLength={95}
              />
              <div className="text-right text-sm text-dark/60 dark:text-light/60 mt-2">
                {95 - data.title.length} characters remaining
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-dark dark:text-light mb-3 block">
                Description (Optional)
              </label>
              <p className="text-sm text-dark/60 dark:text-light/60 mb-3">
                Provide a brief description to help students understand what they'll learn.
              </p>
              <textarea
                placeholder="Describe what this quiz covers and what students will learn..."
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                className="w-full p-4 border border-alpha/30 rounded-xl bg-light dark:bg-dark text-dark dark:text-light focus:ring-2 focus:ring-alpha focus:border-alpha transition-all duration-300 resize-none"
                rows={4}
                maxLength={500}
              />
              <div className="text-right text-sm text-dark/60 dark:text-light/60 mt-2">
                {500 - data.description.length} characters remaining
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-8 py-3 bg-dark/10 dark:bg-light/10 text-dark dark:text-light rounded-xl font-semibold hover:bg-dark/20 dark:hover:bg-light/20 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={submitGame}
                disabled={processing || !data.title.trim()}
                className="px-8 py-3 bg-alpha text-dark rounded-xl font-bold hover:bg-alpha/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              >
                {processing ? 'Saving Quiz...' : 'Save & Preview'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}