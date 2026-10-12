<?php

namespace App\Services;

use App\Models\Formation;
use App\Models\User;
use Carbon\CarbonImmutable;

class StudentTrainingDocumentService
{
    public const TYPES = [
        'contract' => 'Contrat_de_formation_LionsGeek',
        'charter' => 'Charte_droit_image_donnees_LionsGeek',
    ];

    public function items(User $user, bool $studentArea = false): array
    {
        if (! in_array('student', $user->normalizedRoles(), true)) {
            return [];
        }

        $items = [];
        foreach (Formation::whereIn('id', $user->resolvedFormationIds())->orderBy('id')->get() as $formation) {
            foreach (self::TYPES as $type => $documentId) {
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

        return $items;
    }

    public function content(User $user, Formation $formation, string $type): array
    {
        abort_unless(in_array('student', $user->normalizedRoles(), true) && $user->isEnrolledInFormation($formation->id), 404);
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

    public function filledTemplate(User $user, Formation $formation, string $type): string
    {
        $data = $this->content($user, $formation, $type);
        $template = public_path('assets/documents/'.self::TYPES[$type].'.docx');
        $path = tempnam(sys_get_temp_dir(), 'lg-document-');
        if ($path === false || ! copy($template, $path)) {
            throw new \RuntimeException('Unable to copy document template.');
        }
        $zip = new \ZipArchive();
        try {
            if ($zip->open($path) !== true) {
                throw new \RuntimeException('Unable to open document template.');
            }
            $xml = new \DOMDocument();
            if (! $xml->loadXML($zip->getFromName('word/document.xml'), LIBXML_NONET)) {
                throw new \RuntimeException('Invalid document template XML.');
            }
            $xpath = new \DOMXPath($xml);
            $xpath->registerNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');
            $date = $user->profile_documents_accepted_at?->format('d/m/Y') ?? now()->format('d/m/Y');
            $placeholders = ['{{start_date}}' => $data['startDate'] ?: 'Non renseigné', '{{end_date}}' => $data['endDate'] ?: 'Non renseignée'];
            $found = [];
            foreach ($xpath->query('//w:body//w:p') as $paragraph) {
                $nodes = iterator_to_array($xpath->query('.//w:t', $paragraph));
                $text = implode('', array_map(fn ($node) => $node->textContent, $nodes));
                $replacement = null;
                if (preg_match('/^Nom du Participant\s*:/u', trim($text))) {
                    $replacement = rtrim($text).' '.$data['studentName'];
                } elseif (preg_match('/^CINE\s*:/u', trim($text))) {
                    $replacement = rtrim($text).' '.($data['cin'] ?: 'Non renseigné');
                } elseif (str_starts_with(trim($text), 'Nom et prénom :')) {
                    $replacement = 'Nom et prénom : '.$data['studentName'].' / CIN '.($data['cin'] ?: 'Non renseigné');
                } elseif ($type === 'contract' && (str_contains($text, '{{start_date}}') || str_contains($text, '{{end_date}}'))) {
                    foreach ($placeholders as $placeholder => $value) {
                        if (str_contains($text, $placeholder)) {
                            $found[$placeholder] = true;
                        }
                    }
                    $replacement = strtr($text, $placeholders);
                } elseif (preg_match('/^Nom de la formation\s*:/u', trim($text))) {
                    $replacement = substr($text, 0, strpos($text, ':') + 1).' '.$data['trainingName'];
                } elseif (str_starts_with(trim($text), 'Fait à Casablanca, le')) {
                    $replacement = 'Fait à Casablanca, le '.$date;
                } elseif (str_starts_with(trim($text), 'Fait en deux exemplaires à Casablanca, le')) {
                    $replacement = rtrim($text).' '.$date;
                }
                if ($replacement !== null && $nodes !== []) {
                    // Keep paragraph/run properties, drawings, tables, and all other DOCX parts.
                    $nodes[0]->textContent = $replacement;
                    $nodes[0]->setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'preserve');
                    foreach (array_slice($nodes, 1) as $node) {
                        $node->textContent = '';
                    }
                }
            }
            if ($type === 'contract' && count($found) !== count($placeholders)) {
                throw new \RuntimeException('Contract template must contain {{start_date}} and {{end_date}} placeholders.');
            }
            $zip->addFromString('word/document.xml', $xml->saveXML());
            $zip->close();
            return $path;
        } catch (\Throwable $exception) {
            $zip->close();
            @unlink($path);
            throw $exception;
        }
    }

    private function date(?string $value): ?CarbonImmutable
    {
        if (blank($value) || strtoupper(trim($value)) === 'NULL') {
            return null;
        }

        return CarbonImmutable::parse($value);
    }
}
