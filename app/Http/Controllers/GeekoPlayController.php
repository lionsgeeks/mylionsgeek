<?php

namespace App\Http\Controllers;

use App\Models\GeekoSession;
use App\Models\GeekoParticipant;
use App\Models\GeekoAnswer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
        $request->validate([
            'question_id' => 'required|exists:geeko_questions,id',
            'selected_answer' => 'required',
            'time_taken' => 'required|integer|min:0',
        ]);

        $session = GeekoSession::findOrFail($sessionId);
        $user = Auth::user();

        $participant = GeekoParticipant::where('session_id', $sessionId)
            ->where('user_id', $user->id)
            ->first();

        if (!$participant) {
            return response()->json(['error' => 'You are not part of this game!'], 403);
        }

        $question = $session->geeko->questions()->findOrFail($request->question_id);

        // Check if already answered
        $existingAnswer = GeekoAnswer::where('session_id', $sessionId)
            ->where('question_id', $question->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingAnswer) {
            return response()->json(['error' => 'You have already answered this question!'], 400);
        }

        // Validate answer format based on question type
        $selectedAnswer = $request->selected_answer;
        if ($question->type === 'multiple_choice' && !is_array($selectedAnswer)) {
            $selectedAnswer = [$selectedAnswer];
        }

        // Check if answer is correct
        $isCorrect = $question->isCorrectAnswer($selectedAnswer);
        
        // Calculate points based on correctness and time
        $pointsEarned = 0;
        if ($isCorrect) {
            $pointsEarned = $question->calculatePoints($request->time_taken);
        }

        // Store the answer
        GeekoAnswer::create([
            'session_id' => $sessionId,
            'question_id' => $question->id,
            'user_id' => $user->id,
            'selected_answer' => $selectedAnswer,
            'is_correct' => $isCorrect,
            'points_earned' => $pointsEarned,
            'time_taken' => $request->time_taken,
            'answered_at' => now(),
        ]);

        // Update participant score
        $participant->addQuestionScore($question->id, $pointsEarned, $isCorrect);

        return response()->json([
            'success' => true,
            'is_correct' => $isCorrect,
            'points_earned' => $pointsEarned,
            'correct_answer' => $session->geeko->show_correct_answers ? $question->correct_answers : null,
        ]);
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
        $session = GeekoSession::with('geeko')->findOrFail($sessionId);
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

        return response()->json([
            'session_status' => $session->status,
            'current_question_index' => $session->current_question_index,
            'total_questions' => $session->geeko->questions()->count(),
            'current_question_started_at' => $session->current_question_started_at,
            'has_answered' => $hasAnswered,
            'participant_score' => $participant->total_score,
            'participants_count' => $session->participants()->count(),
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