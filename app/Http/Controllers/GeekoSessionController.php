<?php

namespace App\Http\Controllers;

use App\Models\Geeko;
use App\Models\GeekoSession;
use App\Models\GeekoParticipant;
use App\Models\GeekoAnswer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class GeekoSessionController extends Controller
{
    /**
     * Create a new game session.
     */
    public function create(Request $request, $formationId, $geekoId)
    {
        $geeko = Geeko::with(['formation', 'questions'])->findOrFail($geekoId);

        // Check if Geeko is ready
        if (!$geeko->isReady()) {
            return back()->withErrors(['error' => 'This Geeko is not ready to be played!']);
        }

        // Update Geeko title and description if provided
        if ($request->has('title') || $request->has('description')) {
            $geeko->update([
                'title' => $request->input('title', $geeko->title),
                'description' => $request->input('description', $geeko->description),
            ]);
        }

        // Check if there's already an active session
        $activeSession = $geeko->activeSession();
        if ($activeSession) {
            return redirect()->route('geeko.session.control', [$formationId, $geekoId, $activeSession->id])
                ->with('info', 'Session already exists. Redirected to control panel.');
        }

        // Create new session
        $session = GeekoSession::create([
            'geeko_id' => $geekoId,
            'started_by' => Auth::id(),
            'status' => 'waiting',
        ]);

        // For AJAX requests, return JSON with session info
        if (request()->ajax() || request()->wantsJson()) {
            return response()->json([
                'success' => true,
                'session_id' => $session->id,
                'redirect_url' => route('geeko.session.control', [$formationId, $geekoId, $session->id])
            ]);
        }

        return redirect()->route('geeko.session.control', [$formationId, $geekoId, $session->id])
            ->with('success', 'Game session created! Share the PIN with students.');
    }

    /**
     * Show the admin control panel for a session.
     */
    public function control($formationId, $geekoId, $sessionId)
    {
        $session = GeekoSession::with([
            'geeko.formation',
            'geeko.questions',
            'participants.user',
            'starter'
        ])->findOrFail($sessionId);

        $currentQuestion = $session->currentQuestion();
        $leaderboard = $session->getLeaderboard();

        return Inertia::render('admin/training/geeko/SessionControl', [
            'session' => $session,
            'currentQuestion' => $currentQuestion,
            'leaderboard' => $leaderboard,
            'formationId' => $formationId,
            'geekoId' => $geekoId,
        ]);
    }

    /**
     * Start the game session.
     */
    public function start($formationId, $geekoId, $sessionId)
    {
        $session = GeekoSession::findOrFail($sessionId);

        if ($session->status !== 'waiting') {
            return back()->withErrors(['error' => 'Session cannot be started!']);
        }

        $session->update([
            'status' => 'in_progress',
            'started_at' => now(),
            'current_question_started_at' => now(),
        ]);

        // For AJAX requests, return JSON
        if (request()->ajax() || request()->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Game started!',
                'session_status' => 'in_progress'
            ]);
        }

        return back()->with('success', 'Game started!');
    }

    /**
     * Move to the next question.
     */
    public function nextQuestion($formationId, $geekoId, $sessionId)
    {
        $session = GeekoSession::findOrFail($sessionId);

        if ($session->status !== 'in_progress') {
            return back()->withErrors(['error' => 'Session is not in progress!']);
        }

        if (!$session->moveToNextQuestion()) {
            // No more questions, complete the session
            $session->complete();
            return back()->with('success', 'Game completed!');
        }

        return back()->with('success', 'Moved to next question!');
    }

    /**
     * End the current question and show results.
     */
    public function endQuestion($formationId, $geekoId, $sessionId)
    {
        $session = GeekoSession::findOrFail($sessionId);
        $currentQuestion = $session->currentQuestion();

        if (!$currentQuestion) {
            return back()->withErrors(['error' => 'No current question!']);
        }

        // Get answers for current question
        $answers = GeekoAnswer::where('session_id', $sessionId)
            ->where('question_id', $currentQuestion->id)
            ->with('user')
            ->get();

        return Inertia::render('admin/training/geeko/QuestionResults', [
            'session' => $session,
            'question' => $currentQuestion,
            'answers' => $answers,
            'formationId' => $formationId,
            'geekoId' => $geekoId,
        ]);
    }

    /**
     * Complete the game session.
     */
    public function complete($formationId, $geekoId, $sessionId)
    {
        $session = GeekoSession::findOrFail($sessionId);
        $session->complete();

        return back()->with('success', 'Game session completed!');
    }

    /**
     * Cancel the game session.
     */
    public function cancel($formationId, $geekoId, $sessionId)
    {
        $session = GeekoSession::findOrFail($sessionId);
        
        $session->update([
            'status' => 'cancelled',
            'ended_at' => now(),
        ]);

        return redirect()->route('geeko.show', [$formationId, $geekoId])
            ->with('success', 'Game session cancelled.');
    }

    /**
     * Show session results and statistics.
     */
    public function results($formationId, $geekoId, $sessionId)
    {
        $session = GeekoSession::with([
            'geeko.formation',
            'geeko.questions',
            'participants.user',
            'answers.question',
            'answers.user'
        ])->findOrFail($sessionId);

        $leaderboard = $session->getLeaderboard();
        
        // Question-wise statistics
        $questionStats = [];
        foreach ($session->geeko->questions as $question) {
            $questionAnswers = $session->answers()->where('question_id', $question->id)->get();
            $correctCount = $questionAnswers->where('is_correct', true)->count();
            $totalCount = $questionAnswers->count();
            
            $questionStats[] = [
                'question' => $question,
                'correct_count' => $correctCount,
                'wrong_count' => $totalCount - $correctCount,
                'accuracy' => $totalCount > 0 ? ($correctCount / $totalCount) * 100 : 0,
            ];
        }

        return Inertia::render('admin/training/geeko/SessionResults', [
            'session' => $session,
            'leaderboard' => $leaderboard,
            'questionStats' => $questionStats,
            'formationId' => $formationId,
            'geekoId' => $geekoId,
        ]);
    }

    /**
     * Get real-time session data for live updates.
     */
    public function liveData($formationId, $geekoId, $sessionId)
    {
        $session = GeekoSession::with([
            'participants.user',
            'geeko.questions'
        ])->findOrFail($sessionId);

        $currentQuestion = $session->currentQuestion();
        $leaderboard = $session->getLeaderboard();
        
        // Count answers for current question
        $currentAnswerCount = 0;
        if ($currentQuestion) {
            $currentAnswerCount = GeekoAnswer::where('session_id', $sessionId)
                ->where('question_id', $currentQuestion->id)
                ->count();
        }

        // Determine if question should auto end
        $shouldEndQuestion = false;
        $endReason = null;
        if ($session->status === 'in_progress' && $currentQuestion) {
            $participantsCount = $session->participants()->count();
            // End condition: time_up or all_answered (default time_up)
            $endCondition = data_get($session->geeko->settings, 'end_condition', 'time');
            $timeLimit = $currentQuestion->time_limit ?: $session->geeko->time_limit;
            $elapsedSeconds = $session->current_question_started_at
                ? now()->diffInSeconds($session->current_question_started_at)
                : 0;

            $isTimeUp = $timeLimit !== null && $elapsedSeconds >= $timeLimit;
            $isAllAnswered = $participantsCount > 0 && $currentAnswerCount >= $participantsCount;

            if ($endCondition === 'all_answered' && $isAllAnswered) {
                $shouldEndQuestion = true;
                $endReason = 'all_answered';
            } elseif ($endCondition === 'time' && $isTimeUp) {
                $shouldEndQuestion = true;
                $endReason = 'time_up';
            }
        }

        return response()->json([
            'session' => $session,
            'participants_count' => $session->participants()->count(),
            'current_question' => $currentQuestion,
            'current_answer_count' => $currentAnswerCount,
            'leaderboard' => $leaderboard,
            'progress' => [
                'current' => $session->current_question_index + 1,
                'total' => $session->geeko->questions()->count(),
            ],
            'should_end_question' => $shouldEndQuestion,
            'end_reason' => $endReason,
        ]);
    }

    /**
     * Remove a participant from the session.
     */
    public function removeParticipant($formationId, $geekoId, $sessionId, $participantId)
    {
        $participant = GeekoParticipant::where('session_id', $sessionId)->findOrFail($participantId);
        $participant->delete();

        return back()->with('success', 'Participant removed from session.');
    }
}