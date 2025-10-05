<?php

namespace App\Http\Controllers;

use App\Models\GeekoSession;
use App\Models\GeekoParticipant;
use App\Models\GeekoAnswer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class GeekoPlayController extends Controller
{
    /**
     * Show the join game page.
     */
    public function join()
    {
        return Inertia::render('student/geeko/Join');
    }

    /**
     * Join a game session with PIN.
     */
    public function joinWithPin(Request $request)
    {
        $request->validate([
            'session_code' => 'required|string|size:8',
            'nickname' => 'nullable|string|max:50',
        ]);

        $session = GeekoSession::where('session_code', strtoupper($request->session_code))
            ->with('geeko.formation')
            ->first();

        if (!$session) {
            return back()->withErrors(['session_code' => 'Invalid game PIN!']);
        }

        if ($session->status === 'completed' || $session->status === 'cancelled') {
            return back()->withErrors(['session_code' => 'This game has ended!']);
        }

        // Prevent joining if already started
        if ($session->status === 'in_progress') {
            return back()->withErrors(['session_code' => 'This game already started. Please wait for the next round.']);
        }

        $user = Auth::user();

        // Check if user belongs to the same formation
        if ($user->formation_id !== $session->geeko->formation_id) {
            return back()->withErrors(['session_code' => 'You are not enrolled in this training!']);
        }

        // Check if user is already in this session
        $existingParticipant = GeekoParticipant::where('session_id', $session->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingParticipant) {
            return redirect()->route('geeko.play.lobby', $session->id)
                ->with('info', 'You are already in this game!');
        }

        // Create participant
        GeekoParticipant::create([
            'session_id' => $session->id,
            'user_id' => $user->id,
            'nickname' => $request->nickname ?: $user->name,
            'joined_at' => now(),
        ]);

        return redirect()->route('geeko.play.lobby', $session->id)
            ->with('success', 'Joined the game successfully!');
    }

    /**
     * Show the game lobby (waiting room).
     */
    public function lobby($sessionId)
    {
        $session = GeekoSession::with([
            'geeko',
            'participants.user'
        ])->findOrFail($sessionId);

        $user = Auth::user();
        $participant = GeekoParticipant::where('session_id', $sessionId)
            ->where('user_id', $user->id)
            ->first();

        if (!$participant) {
            return redirect()->route('geeko.play.join')
                ->withErrors(['error' => 'You are not part of this game!']);
        }

        if ($session->status === 'in_progress') {
            return redirect()->route('geeko.play.question', $sessionId);
        }

        return Inertia::render('student/geeko/Lobby', [
            'session' => $session,
            'participant' => $participant,
            'participantsCount' => $session->participants()->count(),
        ]);
    }

    /**
     * Show the current question to the student.
     */
    public function question($sessionId)
    {
        $session = GeekoSession::with([
            'geeko',
            'participants.user'
        ])->findOrFail($sessionId);

        $user = Auth::user();
        $participant = GeekoParticipant::where('session_id', $sessionId)
            ->where('user_id', $user->id)
            ->first();

        if (!$participant) {
            return redirect()->route('geeko.play.join')
                ->withErrors(['error' => 'You are not part of this game!']);
        }

        if ($session->status !== 'in_progress') {
            return redirect()->route('geeko.play.lobby', $sessionId);
        }

        $currentQuestion = $session->currentQuestion();
        
        if (!$currentQuestion) {
            return redirect()->route('geeko.play.completed', $sessionId);
        }

        // Ensure options is always an array
        if (!is_array($currentQuestion->options)) {
            if (is_string($currentQuestion->options)) {
                $currentQuestion->options = json_decode($currentQuestion->options, true) ?: [];
            } else {
                $currentQuestion->options = [];
            }
        }

        // Debug logging
        Log::info('Question data being passed to frontend:', [
            'question_id' => $currentQuestion->id,
            'question_text' => $currentQuestion->question,
            'question_type' => $currentQuestion->type,
            'options' => $currentQuestion->options,
            'options_type' => gettype($currentQuestion->options),
            'options_count' => is_array($currentQuestion->options) ? count($currentQuestion->options) : 'not array',
            'raw_options' => $currentQuestion->getRawOriginal('options')
        ]);



        // Check if student has already answered this question
        $hasAnswered = GeekoAnswer::where('session_id', $sessionId)
            ->where('question_id', $currentQuestion->id)
            ->where('user_id', $user->id)
            ->exists();

        return Inertia::render('student/geeko/Question', [
            'session' => $session,
            'participant' => $participant,
            'question' => $currentQuestion,
            'hasAnswered' => $hasAnswered,
            'questionNumber' => $session->current_question_index + 1,
            'totalQuestions' => $session->geeko->questions()->count(),
        ]);
    }

    /**
     * Submit an answer to the current question.
     */
    public function submitAnswer(Request $request, $sessionId)
    {
        Log::info('=== METHOD CALLED ===', ['method' => 'submitAnswer', 'session_id' => $sessionId]);
        
        try {
            Log::info('=== ANSWER SUBMISSION START ===');
            Log::info('Request data:', $request->all());
            Log::info('Session ID:', ['session_id' => $sessionId]);
            Log::info('User ID:', ['user_id' => Auth::id()]);

            $request->validate([
                'question_id' => 'required|exists:geeko_questions,id',
                'selected_answer' => 'required',
                'time_taken' => 'required|integer|min:0',
            ]);
            
            Log::info('Validation passed');

            $session = GeekoSession::findOrFail($sessionId);
            $user = Auth::user();
            
            Log::info('Session found:', ['session_id' => $session->id, 'status' => $session->status]);
            Log::info('User found:', ['user_id' => $user->id, 'name' => $user->name]);

            $participant = GeekoParticipant::where('session_id', $sessionId)
                ->where('user_id', $user->id)
                ->first();

            Log::info('Participant lookup:', [
                'participant_found' => $participant ? 'yes' : 'no',
                'participant_data' => $participant
            ]);

            if (!$participant) {
                Log::error('Participant not found');
                return response()->json(['error' => 'You are not part of this game!'], 403);
            }

            $question = $session->geeko->questions()->findOrFail($request->question_id);
            
            // Ensure options and correct_answers are arrays for logging
            $options = $question->options;
            if (is_string($options)) {
                $options = json_decode($options, true) ?: [];
            }
            
            $correctAnswers = $question->correct_answers;
            if (is_string($correctAnswers)) {
                $correctAnswers = json_decode($correctAnswers, true) ?: [];
            }
            
            Log::info('Question found:', [
                'question_id' => $question->id,
                'question_text' => $question->question,
                'question_type' => $question->type,
                'options' => $options,
                'correct_answers' => $correctAnswers
            ]);

            // Check if already answered
            $existingAnswer = GeekoAnswer::where('session_id', $sessionId)
                ->where('question_id', $question->id)
                ->where('user_id', $user->id)
                ->first();

            Log::info('Existing answer check:', [
                'existing_answer_found' => $existingAnswer ? 'yes' : 'no',
                'existing_answer_data' => $existingAnswer
            ]);

            if ($existingAnswer) {
                Log::warning('Answer already exists');
                return response()->json(['error' => 'You have already answered this question!'], 400);
            }

            // Validate answer format based on question type
            $selectedAnswer = $request->selected_answer;
            Log::info('Selected answer before processing:', ['selected_answer' => $selectedAnswer, 'type' => gettype($selectedAnswer)]);
            
            if ($question->type === 'multiple_choice' && !is_array($selectedAnswer)) {
                $selectedAnswer = [$selectedAnswer];
            }

            Log::info('Selected answer after processing:', ['selected_answer' => $selectedAnswer, 'type' => gettype($selectedAnswer)]);

            // Check if answer is correct
            $isCorrect = $question->isCorrectAnswer($selectedAnswer);
            
            Log::info('Answer validation result:', [
                'is_correct' => $isCorrect,
                'selected_answer' => $selectedAnswer,
                'correct_answers' => $correctAnswers,
                'question_type' => $question->type
            ]);
            
            // Calculate points based on correctness and time
            $pointsEarned = 0;
            if ($isCorrect) {
                $pointsEarned = $question->calculatePoints($request->time_taken);
                
                // Speed bonus: earlier answers get higher bonus to avoid ties
                $participantsCount = $session->participants()->count();
                $answerOrder = GeekoAnswer::where('session_id', $sessionId)
                    ->where('question_id', $question->id)
                    ->count(); // number already submitted before this one
                // Highest bonus for the first correct answer; never negative
                $speedBonus = max(0, $participantsCount - $answerOrder);
                $pointsEarned += $speedBonus;
            }
            
            Log::info('Points calculation:', [
                'points_earned' => $pointsEarned,
                'time_taken' => $request->time_taken,
                'is_correct' => $isCorrect
            ]);

            // Store the answer
            $answerData = [
                'session_id' => $sessionId,
                'question_id' => $question->id,
                'user_id' => $user->id,
                'selected_answer' => $selectedAnswer,
                'is_correct' => $isCorrect,
                'points_earned' => $pointsEarned,
                'time_taken' => $request->time_taken,
                'answered_at' => now(),
            ];

            Log::info('Creating answer with data:', $answerData);

            $answer = GeekoAnswer::create($answerData);
            
            Log::info('Answer created successfully:', ['answer_id' => $answer->id]);

            // Update participant score
            Log::info('Updating participant score...');
            $participant->addQuestionScore($question->id, $pointsEarned, $isCorrect);
            
            Log::info('Participant score updated successfully');

            $response = [
                'success' => true,
                'is_correct' => $isCorrect,
                'points_earned' => $pointsEarned,
                'correct_answer' => $session->geeko->show_correct_answers ? $correctAnswers : null,
            ];
            
            Log::info('Returning success response:', $response);
            Log::info('=== ANSWER SUBMISSION SUCCESS ===');

            return response()->json($response);
        
        } catch (\Exception $e) {
            Log::error('Error submitting answer:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to submit answer. Please try again.',
                'debug' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show waiting screen between questions.
     */
    public function waiting($sessionId)
    {
        $session = GeekoSession::with([
            'geeko',
            'participants.user'
        ])->findOrFail($sessionId);

        $user = Auth::user();
        $participant = GeekoParticipant::where('session_id', $sessionId)
            ->where('user_id', $user->id)
            ->first();

        if (!$participant) {
            return redirect()->route('geeko.play.join')
                ->withErrors(['error' => 'You are not part of this game!']);
        }

        $leaderboard = $session->getLeaderboard()->take(5); // Top 5

        return Inertia::render('student/geeko/Waiting', [
            'session' => $session,
            'participant' => $participant,
            'leaderboard' => $leaderboard,
        ]);
    }

    /**
     * Show game completed screen with final results.
     */
    public function completed($sessionId)
    {
        $session = GeekoSession::with([
            'geeko',
            'participants.user'
        ])->findOrFail($sessionId);

        $user = Auth::user();
        $participant = GeekoParticipant::where('session_id', $sessionId)
            ->where('user_id', $user->id)
            ->first();

        if (!$participant) {
            return redirect()->route('geeko.play.join')
                ->withErrors(['error' => 'You are not part of this game!']);
        }

        $leaderboard = $session->getLeaderboard();
        $participantRank = $leaderboard->search(function ($item) use ($participant) {
            return $item->id === $participant->id;
        }) + 1;

        // Get participant's answers for review
        $participantAnswers = GeekoAnswer::where('session_id', $sessionId)
            ->where('user_id', $user->id)
            ->with('question')
            ->get();

        return Inertia::render('student/geeko/Completed', [
            'session' => $session,
            'participant' => $participant,
            'leaderboard' => $leaderboard,
            'participantRank' => $participantRank,
            'participantAnswers' => $participantAnswers,
        ]);
    }

    /**
     * Get live game data for real-time updates.
     */
    public function liveData($sessionId)
    {
        $session = GeekoSession::with(['geeko','participants.user'])->findOrFail($sessionId);
        $user = Auth::user();

        $participant = GeekoParticipant::where('session_id', $sessionId)
            ->where('user_id', $user->id)
            ->first();

        if (!$participant) {
            return response()->json(['error' => 'Not authorized'], 403);
        }

        $currentQuestion = $session->currentQuestion();
        $hasAnswered = false;

        if ($currentQuestion) {
            $hasAnswered = GeekoAnswer::where('session_id', $sessionId)
                ->where('question_id', $currentQuestion->id)
                ->where('user_id', $user->id)
                ->exists();
        }

        $leaderboard = $session->getLeaderboard();

        return response()->json([
            'session_status' => $session->status,
            'current_question_index' => $session->current_question_index,
            'total_questions' => $session->geeko->questions()->count(),
            'current_question_started_at' => $session->current_question_started_at,
            'has_answered' => $hasAnswered,
            'participant_score' => $participant->total_score,
            'participants_count' => $session->participants()->count(),
            'leaderboard' => $leaderboard,
        ]);
    }

    /**
     * Leave the game session.
     */
    public function leave($sessionId)
    {
        $user = Auth::user();
        $participant = GeekoParticipant::where('session_id', $sessionId)
            ->where('user_id', $user->id)
            ->first();

        if ($participant) {
            $participant->delete();
        }

        return redirect()->route('dashboard')
            ->with('success', 'Left the game successfully.');
    }
}