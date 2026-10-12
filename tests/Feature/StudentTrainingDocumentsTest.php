<?php

use App\Models\Formation;
use App\Models\User;
use App\Services\StudentTrainingDocumentService;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    if (! \Illuminate\Support\Facades\Schema::hasColumn('formations', 'promo')) {
        \Illuminate\Support\Facades\Schema::table('formations', function (\Illuminate\Database\Schema\Blueprint $table) {
            $table->string('promo')->nullable();
        });
    }
});

function documentTraining(array $overrides = []): Formation
{
    return Formation::create(array_merge([
        'name' => 'Coding', 'img' => 'training.jpg',
        'start_time' => '2026-08-31', 'end_time' => null,
    ], $overrides));
}

function documentStudent(Formation $formation): User
{
    return User::factory()->create([
        'role' => ['student'], 'name' => 'Student Example', 'cin' => 'AB123456',
        'formation_id' => $formation->id, 'email_verified_at' => now(),
    ]);
}

test('personalized documents use student details and six month fallback without month overflow', function () {
    $formation = documentTraining();
    $student = documentStudent($formation);
    $content = app(StudentTrainingDocumentService::class)->content($student, $formation, 'contract');
    expect($content['studentName'])->toBe('Student Example')
        ->and($content['cin'])->toBe('AB123456')
        ->and($content['startDate'])->toBe('31/08/2026')
        ->and($content['endDate'])->toBe('28/02/2027')
        ->and($content['acceptedAt'])->toBeNull();
});

test('explicit training end date takes precedence and missing start is not invented', function () {
    $formation = documentTraining(['end_time' => '2027-01-15']);
    $student = documentStudent($formation);
    $service = app(StudentTrainingDocumentService::class);
    expect($service->content($student, $formation, 'charter')['endDate'])->toBe('15/01/2027');
    $formation->update(['start_time' => null, 'end_time' => null]);
    $content = $service->content($student, $formation->fresh(), 'contract');
    expect($content['startDate'])->toBeNull()->and($content['endDate'])->toBeNull();
    $formation->update(['start_time' => '2026-08-31', 'end_time' => 'NULL']);
    expect($service->content($student, $formation->fresh(), 'contract')['endDate'])->toBe('28/02/2027');
});

test('student document list contains a contract and charter for each enrolled training', function () {
    $formation = documentTraining();
    $other = documentTraining(['name' => 'Media']);
    $student = documentStudent($formation);
    // Existing application enrollment also resolves formations by promo.
    $formation->forceFill(['promo' => 'DOCS'])->save();
    $other->forceFill(['promo' => 'DOCS'])->save();
    $student->forceFill(['promo' => 'DOCS'])->save();
    $this->actingAs($student)->getJson('/students/training-documents')
        ->assertOk()->assertJsonCount(4, 'contracts');
});

test('student can download their filled original template but cannot access another training or admin documents', function () {
    $formation = documentTraining();
    $student = documentStudent($formation);
    $other = documentTraining(['name' => 'Other']);
    $response = $this->actingAs($student)->get('/students/training-documents/'.$formation->id.'/contract')
        ->assertOk()->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    $path = $response->baseResponse->getFile()->getPathname();
    $zip = new ZipArchive();
    $zip->open($path);
    $xml = $zip->getFromName('word/document.xml');
    expect($xml)->toContain('Student Example', 'AB123456', 'Coding', '31/08/2026', '28/02/2027')
        ->not->toContain('03/02/2025', '10/08/2025', 'CCCCCCCCCCCCCCCxxxxxxxxxxxxxx');
    $original = new ZipArchive();
    $original->open(public_path('assets/documents/Contrat_de_formation_LionsGeek.docx'));
    for ($i = 0; $i < $original->numFiles; $i++) {
        $part = $original->getNameIndex($i);
        if ($part !== 'word/document.xml') {
            expect($zip->getFromName($part))->toBe($original->getFromName($part));
        }
    }
    $original->close();
    $zip->close();
    unlink($path);
    $this->get('/students/training-documents/'.$other->id.'/charter')->assertNotFound();
    $this->getJson('/admin/users/'.$student->id.'/training-documents/'.$formation->id.'/contract')->assertForbidden();
});

test('guests and recruiters cannot view student documents', function () {
    $this->getJson('/students/training-documents')->assertUnauthorized();
    $recruiter = User::factory()->create(['role' => ['recruiter'], 'email_verified_at' => now()]);
    $this->actingAs($recruiter)->getJson('/students/training-documents')->assertForbidden();
});

test('staff document area includes personalized links and serves both document types', function () {
    $formation = documentTraining();
    $student = documentStudent($formation);
    $admin = User::factory()->create(['role' => ['admin'], 'email_verified_at' => now()]);
    $this->actingAs($admin)->getJson('/admin/users/'.$student->id.'/documents')
        ->assertOk()->assertJsonCount(2, 'contracts');
    foreach (['contract', 'charter'] as $type) {
        $response = $this->get('/admin/users/'.$student->id.'/training-documents/'.$formation->id.'/'.$type)
            ->assertOk()->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        $path = $response->baseResponse->getFile()->getPathname();
        $zip = new ZipArchive();
        $zip->open($path);
        expect($zip->getFromName('word/document.xml'))->toContain('Student Example', 'AB123456');
        $zip->close();
        unlink($path);
    }
});
