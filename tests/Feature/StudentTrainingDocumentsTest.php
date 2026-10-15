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

function pdfPageCount(string $pdf): int
{
    return preg_match_all('#/Type\s*/Page[^s]#', $pdf);
}

test('student document list contains one contract and one charter for their own training', function () {
    $formation = documentTraining();
    $other = documentTraining(['name' => 'Media']);
    $student = documentStudent($formation);
    // Promo matches resolve extra formations, but documents are issued for the assigned one only.
    $formation->forceFill(['promo' => 'DOCS'])->save();
    $other->forceFill(['promo' => 'DOCS'])->save();
    $student->forceFill(['promo' => 'DOCS'])->save();
    $this->actingAs($student)->getJson('/students/training-documents')
        ->assertOk()->assertJsonCount(2, 'contracts')
        ->assertJsonPath('contracts.0.name', 'Contrat de formation — Coding');
    $this->get('/students/training-documents/'.$other->id.'/contract')->assertNotFound();
});

test('student can download their one-page training PDFs but cannot access another training or admin documents', function () {
    $formation = documentTraining();
    $student = documentStudent($formation);
    $other = documentTraining(['name' => 'Other']);
    foreach (['contract', 'charter'] as $type) {
        $response = $this->actingAs($student)->get('/students/training-documents/'.$formation->id.'/'.$type)
            ->assertOk()->assertHeader('Content-Type', 'application/pdf');
        expect(pdfPageCount($response->getContent()))->toBe(1);
    }
    $this->get('/students/training-documents/'.$other->id.'/charter')->assertNotFound();
    $this->getJson('/admin/users/'.$student->id.'/training-documents/'.$formation->id.'/contract')->assertForbidden();
});

test('assigned computer contract is listed and downloadable as a one-page PDF by its holder only', function () {
    $formation = documentTraining();
    $student = documentStudent($formation);
    $computer = \App\Models\Computer::create([
        'reference' => 'LG-042', 'cpu' => 'SN-123', 'gpu' => 'none', 'mark' => 'Dell',
        'state' => 'working', 'user_id' => $student->id, 'start' => '2026-09-01',
    ]);
    $this->actingAs($student)->getJson('/students/training-documents')
        ->assertOk()->assertJsonCount(3, 'contracts')
        ->assertJsonPath('contracts.2.name', 'Contrat ordinateur — Dell LG-042');
    $response = $this->get('/students/computer-contract/'.$computer->id)
        ->assertOk()->assertHeader('Content-Type', 'application/pdf');
    expect(pdfPageCount($response->getContent()))->toBe(1);

    $classmate = documentStudent($formation);
    $this->actingAs($classmate)->get('/students/computer-contract/'.$computer->id)->assertNotFound();
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
            ->assertOk()->assertHeader('Content-Type', 'application/pdf');
        expect(pdfPageCount($response->getContent()))->toBe(1);
    }
});
