<?php

namespace App\Http\Controllers;

use App\Models\Computer;
use App\Models\Formation;
use App\Models\User;
use App\Services\StudentTrainingDocumentService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\HeaderUtils;

class StudentTrainingDocumentController extends Controller
{
    public function index(Request $request, StudentTrainingDocumentService $documents)
    {
        return response()->json(['contracts' => $documents->items($request->user(), true), 'medicals' => []]);
    }

    public function studentView(Request $request, Formation $formation, string $type, StudentTrainingDocumentService $documents)
    {
        return $this->training($request->user(), $formation, $type, $documents);
    }

    public function adminView(User $user, Formation $formation, string $type, StudentTrainingDocumentService $documents)
    {
        return $this->training($user, $formation, $type, $documents);
    }

    public function studentComputer(Request $request, Computer $computer, StudentTrainingDocumentService $documents)
    {
        abort_unless((int) $computer->user_id === (int) $request->user()->id, 404);

        return $this->pdf($documents->computerPdf($computer), $documents->computerFileName($computer));
    }

    public function adminComputer(User $user, Computer $computer, StudentTrainingDocumentService $documents)
    {
        abort_unless((int) $computer->user_id === (int) $user->id, 404);

        return $this->pdf($documents->computerPdf($computer), $documents->computerFileName($computer));
    }

    private function training(User $user, Formation $formation, string $type, StudentTrainingDocumentService $documents)
    {
        return $this->pdf($documents->trainingPdf($user, $formation, $type), $documents->trainingFileName($user, $type));
    }

    private function pdf(string $content, string $fileName)
    {
        return response($content, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => HeaderUtils::makeDisposition(HeaderUtils::DISPOSITION_ATTACHMENT, $fileName),
        ]);
    }
}
