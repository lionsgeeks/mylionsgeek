<?php

namespace App\Http\Controllers;

use App\Models\Geeko;
use App\Models\GeekoQuestion;
use App\Models\Formation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class GeekoController extends Controller
{
    /**
     * Display a listing of Geekos for a specific formation.
     */
    public function index(Request $request, $formationId)
    {
        $formation = Formation::with('coach')->findOrFail($formationId);
        
        $geekos = Geeko::where('formation_id', $formationId)
            ->with(['questions', 'creator', 'sessions'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/training/geeko/Index', [
            'formation' => $formation,
            'geekos' => $geekos,
        ]);
    }

    /**
     * Show the form for creating a new Geeko.
     */
    public function create($formationId)
    {
        $formation = Formation::findOrFail($formationId);
        
        return Inertia::render('admin/training/geeko/Create', [
            'formation' => $formation,
        ]);
    }

    /**
     * Store a newly created Geeko.
     */
    public function store(Request $request, $formationId)
    {
        // dd($request->all());
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'time_limit' => 'required|integer|min:5|max:300',
            'show_correct_answers' => 'boolean',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'data.questions' => 'nullable|array',
        ]);

        $data = $request->all();
        
        // Debug logging
        Log::info('Geeko Store Request Data:', $data);
        Log::info('Questions Data:', ['questions' => $data['data']['questions'] ?? 'No questions data']);
        
        $data['formation_id'] = $formationId;
        $data['created_by'] = Auth::id();
        $data['status'] = 'draft';

        // Handle cover image upload
        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image')->store('geeko-covers', 'public');
        }

        $geeko = Geeko::create($data);

        // Save questions if provided
        if (isset($data['data']['questions']) && is_array($data['data']['questions'])) {
            Log::info('Processing questions:', ['questions' => $data['data']['questions']]);
            
            foreach ($data['data']['questions'] as $index => $questionData) {
                Log::info("Processing question {$index}:", ['question_data' => $questionData]);
                
                if (!empty($questionData['question']) && $questionData['isComplete']) {
                    Log::info("Creating question {$index} - Complete and valid");
                    $this->createQuestion($geeko, $questionData, $index);
                } else {
                    Log::info("Skipping question {$index} - Incomplete or invalid", [
                        'has_question' => !empty($questionData['question']),
                        'is_complete' => $questionData['isComplete'] ?? false
                    ]);
                }
            }
        } else {
            Log::info('No questions data found or not an array', ['data_structure' => $data]);
        }

        return redirect()->route('geeko.show', [$formationId, $geeko->id])
            ->with('success', 'Geeko created successfully!');
    }

    /**
     * Create a question for the Geeko.
     */
    private function createQuestion($geeko, $questionData, $orderIndex)
    {
        
        Log::info("Creating question for Geeko {$geeko->id}:", ['question_data' => $questionData]);
        
        $question = [
            'geeko_id' => $geeko->id,
            'question' => $questionData['question'],
            'type' => $questionData['type'],
            'points' => $questionData['points'] ?? 1000,
            'time_limit' => $questionData['timeLimit'] ?? 20,
            'order_index' => $orderIndex,
            'question_image' => null,
        ];

        // Handle options based on question type
        if ($questionData['type'] === 'multiple_choice') {
            $options = [];
            $correctAnswers = [];
            
            foreach ($questionData['options'] as $option) {
                if (!empty($option['text'])) {
                    $options[] = $option['text'];
                    if ($option['isCorrect']) {
                        $correctAnswers[] = $option['text'];
                    }
                }
            }
            
            $question['options'] = json_encode($options);
            $question['correct_answers'] = json_encode($correctAnswers);
        } elseif ($questionData['type'] === 'true_false') {
            $options = ['True', 'False'];
            $correctAnswers = [];

            foreach ($questionData['options'] as $option) {
                if (!empty($option['text'])) {
                    // normalize to canonical True/False labels
                    $normalized = strtolower($option['text']) === 'true' ? 'True' : (strtolower($option['text']) === 'false' ? 'False' : $option['text']);
                } else {
                    $normalized = '';
                }

                if ($option['isCorrect']) {
                    $correctAnswers[] = $normalized ?: 'True';
                }
            }

            // default to True if none flagged (safety)
            if (empty($correctAnswers)) {
                $correctAnswers = ['True'];
            }

            $question['options'] = json_encode($options);
            $question['correct_answers'] = json_encode($correctAnswers);
        } elseif ($questionData['type'] === 'type_answer') {
            $correctAnswer = $questionData['options'][0]['text'] ?? '';
            $question['options'] = json_encode([]);
            $question['correct_answers'] = json_encode([$correctAnswer]);
        }

        Log::info("Final question data to save:", ['question' => $question]);
        
        $createdQuestion = GeekoQuestion::create($question);
        
        Log::info("Question created successfully with ID: {$createdQuestion->id}");
    }

    /**
     * Display the specified Geeko with questions.
     */
    public function show($formationId, $geekoId)
    {
        $formation = Formation::findOrFail($formationId);
        $geeko = Geeko::with(['questions' => function($query) {
            $query->orderBy('order_index');
        }, 'creator', 'sessions'])->findOrFail($geekoId);

        return Inertia::render('admin/training/geeko/Show', [
            'formation' => $formation,
            'geeko' => $geeko,
        ]);
    }

    /**
     * Show the form for editing the specified Geeko.
     */
    public function edit($formationId, $geekoId)
    {
        $formation = Formation::findOrFail($formationId);
        $geeko = Geeko::findOrFail($geekoId);

        return Inertia::render('admin/training/geeko/Edit', [
            'formation' => $formation,
            'geeko' => $geeko,
        ]);
    }

    /**
     * Update the specified Geeko.
     */
    public function update(Request $request, $formationId, $geekoId)
    {
        $geeko = Geeko::findOrFail($geekoId);

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'time_limit' => 'required|integer|min:5|max:300',
            'show_correct_answers' => 'boolean',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = $request->all();

        // Handle cover image upload
        if ($request->hasFile('cover_image')) {
            // Delete old image if exists
            if ($geeko->cover_image) {
                Storage::disk('public')->delete($geeko->cover_image);
            }
            $data['cover_image'] = $request->file('cover_image')->store('geeko-covers', 'public');
        }

        $geeko->update($data);

        return redirect()->route('geeko.show', [$formationId, $geekoId])
            ->with('success', 'Geeko updated successfully!');
    }

    /**
     * Remove the specified Geeko.
     */
    public function destroy($formationId, $geekoId)
    {
        $geeko = Geeko::findOrFail($geekoId);

        // Delete cover image if exists
        if ($geeko->cover_image) {
            Storage::disk('public')->delete($geeko->cover_image);
        }

        $geeko->delete();

        return redirect()->route('geeko.index', $formationId)
            ->with('success', 'Geeko deleted successfully!');
    }

    /**
     * Store a new question for the Geeko.
     */
    public function storeQuestion(Request $request, $formationId, $geekoId)
    {

        // dd($request->all());
        $geeko = Geeko::findOrFail($geekoId);

        $request->validate([
            'question' => 'required|string',
            'type' => 'required|in:multiple_choice,true_false,type_answer',
            'options' => 'required|array|min:2',
            'correct_answers' => 'required|array|min:1',
            'points' => 'required|integer|min:100|max:2000',
            'time_limit' => 'nullable|integer|min:5|max:300',
            'question_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = $request->all();
        $data['geeko_id'] = $geekoId;
        $data['order_index'] = $geeko->questions()->count();

        // Handle question image upload
        if ($request->hasFile('question_image')) {
            $data['question_image'] = $request->file('question_image')->store('geeko-questions', 'public');
        }

        GeekoQuestion::create($data);

        return back()->with('success', 'Question added successfully!');
    }

    /**
     * Update a question.
     */
    public function updateQuestion(Request $request, $formationId, $geekoId, $questionId)
    {
        $question = GeekoQuestion::where('geeko_id', $geekoId)->findOrFail($questionId);

        $request->validate([
            'question' => 'required|string',
            'type' => 'required|in:multiple_choice,true_false,type_answer',
            'options' => 'required|array|min:2',
            'correct_answers' => 'required|array|min:1',
            'points' => 'required|integer|min:100|max:2000',
            'time_limit' => 'nullable|integer|min:5|max:300',
            'question_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = $request->all();

        // Handle question image upload
        if ($request->hasFile('question_image')) {
            // Delete old image if exists
            if ($question->question_image) {
                Storage::disk('public')->delete($question->question_image);
            }
            $data['question_image'] = $request->file('question_image')->store('geeko-questions', 'public');
        }

        $question->update($data);

        return back()->with('success', 'Question updated successfully!');
    }

    /**
     * Delete a question.
     */
    public function destroyQuestion($formationId, $geekoId, $questionId)
    {
        $question = GeekoQuestion::where('geeko_id', $geekoId)->findOrFail($questionId);

        // Delete question image if exists
        if ($question->question_image) {
            Storage::disk('public')->delete($question->question_image);
        }

        $question->delete();

        // Reorder remaining questions
        $questions = GeekoQuestion::where('geeko_id', $geekoId)->orderBy('order_index')->get();
        foreach ($questions as $index => $q) {
            $q->update(['order_index' => $index]);
        }

        return back()->with('success', 'Question deleted successfully!');
    }

    /**
     * Reorder questions.
     */
    public function reorderQuestions(Request $request, $formationId, $geekoId)
    {
        $request->validate([
            'questions' => 'required|array',
            'questions.*.id' => 'required|exists:geeko_questions,id',
            'questions.*.order_index' => 'required|integer|min:0',
        ]);

        foreach ($request->questions as $questionData) {
            GeekoQuestion::where('id', $questionData['id'])
                ->where('geeko_id', $geekoId)
                ->update(['order_index' => $questionData['order_index']]);
        }

        return back()->with('success', 'Questions reordered successfully!');
    }

    /**
     * Publish/Unpublish a Geeko.
     */
    public function toggleStatus($formationId, $geekoId)
    {
        $geeko = Geeko::findOrFail($geekoId);

        if ($geeko->status === 'draft') {
            // Check if Geeko has questions before publishing
            if ($geeko->questions()->count() === 0) {
                return back()->withErrors(['error' => 'Cannot publish Geeko without questions!']);
            }
            $geeko->update(['status' => 'ready']);
            $message = 'Geeko is now ready to play!';
        } else {
            $geeko->update(['status' => 'draft']);
            $message = 'Geeko moved to draft status.';
        }

        return back()->with('success', $message);
    }
}