<?php

namespace App\Http\Controllers;

use App\Models\Formation;
use App\Models\User;
use App\Services\StudentTrainingDocumentService;
use Illuminate\Http\Request;

class StudentTrainingDocumentController extends Controller
{
    public function index(Request $request, StudentTrainingDocumentService $documents)
    {
        return response()->json(['contracts' => $documents->items($request->user(), true), 'medicals' => []]);
    }

    public function studentView(Request $request, Formation $formation, string $type, StudentTrainingDocumentService $documents)
    {
        return $this->render($request->user(), $formation, $type, $documents);
    }

    public function adminView(User $user, Formation $formation, string $type, StudentTrainingDocumentService $documents)
    {
        return $this->render($user, $formation, $type, $documents);
    }

    private function render(User $user, Formation $formation, string $type, StudentTrainingDocumentService $documents)
    {
        return response()->download(
            $documents->filledTemplate($user, $formation, $type),
            $documents::TYPES[$type].'-'.$user->id.'-'.$formation->id.'.docx',
            ['Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        )->deleteFileAfterSend(true);
    }
}
