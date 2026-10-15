<?php

namespace App\Services;

use App\Models\Computer;
use App\Models\Formation;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\CarbonImmutable;
use Illuminate\Support\Str;

class StudentTrainingDocumentService
{
    public const TYPES = [
        'contract' => 'Contrat_de_formation_LionsGeek',
        'charter' => 'Charte_droit_image_donnees_LionsGeek',
    ];

    private const VIEWS = [
        'contract' => 'pdf.training_contract',
        'charter' => 'pdf.training_charter',
    ];

    private const FONT_SIZES = [10, 9.5, 9, 8.5, 8, 7.5, 7, 6.5];

    public function items(User $user, bool $studentArea = false): array
    {
        $items = [];
        $formation = in_array('student', $user->normalizedRoles(), true) ? $this->formation($user) : null;
        if ($formation) {
            foreach (array_keys(self::TYPES) as $type) {
                $items[] = [
                    'id' => $type.'-'.$formation->id,
                    'name' => ($type === 'contract' ? 'Contrat de formation' : "Charte droit d'image et données").' — '.$formation->name,
                    'kind' => 'contract',
                    'download' => true,
                    'url' => $studentArea
                        ? route('student.training-documents.view', ['formation' => $formation->id, 'type' => $type])
                        : route('admin.users.training-documents.view', ['user' => $user->id, 'formation' => $formation->id, 'type' => $type]),
                ];
            }
        }

        foreach (Computer::where('user_id', $user->id)->orderBy('id')->get() as $computer) {
            $items[] = [
                'id' => 'computer-'.$computer->id,
                'name' => 'Contrat ordinateur — '.trim($computer->mark.' '.$computer->reference),
                'kind' => 'contract',
                'download' => true,
                'url' => $studentArea
                    ? route('student.computer-contract.view', ['computer' => $computer->id])
                    : route('admin.users.computer-contract.view', ['user' => $user->id, 'computer' => $computer->id]),
            ];
        }

        return $items;
    }

    /**
     * The training a student's documents are issued for: their assigned formation first,
     * then pivot enrollments, then promo matches (same order as resolvedFormationIds).
     */
    public function formation(User $user): ?Formation
    {
        $ids = $user->resolvedFormationIds();

        return $ids === [] ? null : Formation::find($ids[0]);
    }

    public function content(User $user, Formation $formation, string $type): array
    {
        abort_unless(in_array('student', $user->normalizedRoles(), true) && $this->formation($user)?->id === $formation->id, 404);
        abort_unless(isset(self::TYPES[$type]), 404);
        $start = $this->date($formation->start_time);
        $end = $this->date($formation->end_time) ?? $start?->addMonthsNoOverflow(6);

        return [
            'title' => $type === 'contract' ? 'Contrat de formation LionsGeek' : "Charte sur le droit d'image et les données personnelles",
            'studentName' => $user->name,
            'cin' => $user->cin,
            'trainingName' => $formation->name,
            'startDate' => $start?->format('d/m/Y'),
            'endDate' => $end?->format('d/m/Y'),
            'acceptedAt' => collect($user->profile_document_acceptances ?? [])->contains(fn ($item) => ($item['id'] ?? null) === self::TYPES[$type] && ($item['accepted'] ?? false))
                ? $user->profile_documents_accepted_at?->format('d/m/Y H:i') : null,
        ];
    }

    public function trainingPdf(User $user, Formation $formation, string $type): string
    {
        $data = $this->content($user, $formation, $type);
        $data['signedAt'] = $user->profile_documents_accepted_at?->format('d/m/Y') ?? now()->format('d/m/Y');

        return $this->onePagePdf(self::VIEWS[$type], $data);
    }

    public function trainingFileName(User $user, string $type): string
    {
        return ($type === 'contract' ? 'Contrat-de-formation' : 'Charte-droit-image-donnees').'-'.Str::slug($user->name).'.pdf';
    }

    public function computerPdf(Computer $computer): string
    {
        abort_unless($computer->user, 404);

        return $this->onePagePdf('pdf.computer_start', ['user' => $computer->user, 'computer' => $computer]);
    }

    public function computerFileName(Computer $computer): string
    {
        return 'Contrat-ordinateur-'.Str::slug($computer->user?->name ?? 'beneficiaire').'.pdf';
    }

    private function onePagePdf(string $view, array $data): string
    {
        $data['letterhead'] = 'data:image/jpeg;base64,'.base64_encode(file_get_contents(public_path('assets/documents/letterhead.jpg')));
        foreach (self::FONT_SIZES as $fontSize) {
            $pdf = Pdf::loadView($view, $data + ['fontSize' => $fontSize])->setPaper('a4');
            $pdf->render();
            if ($pdf->getDomPDF()->getCanvas()->get_page_count() === 1) {
                return $pdf->output();
            }
        }

        throw new \RuntimeException("Document [{$view}] does not fit on one page.");
    }

    private function date(?string $value): ?CarbonImmutable
    {
        if (blank($value) || strtoupper(trim($value)) === 'NULL') {
            return null;
        }

        return CarbonImmutable::parse($value);
    }
}
