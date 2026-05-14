<?php

use App\Models\Job;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_posting_organization', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_posting_id')->constrained('job_postings')->cascadeOnDelete();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['job_posting_id', 'organization_id']);
        });

        if (! Schema::hasTable('job_posting_recruiter')) {
            return;
        }

        $legacyRecruiters = User::query()
            ->whereJsonContains('role', 'recruiter')
            ->whereNull('organization_id')
            ->get();

        $seedNow = now();
        foreach ($legacyRecruiters as $recruiter) {
            $organizationId = DB::table('organizations')->insertGetId([
                'email' => $recruiter->email,
                'enterprise_name' => $recruiter->name ?: \Illuminate\Support\Str::before((string) $recruiter->email, '@'),
                'contact_name' => $recruiter->name,
                'phone' => $recruiter->phone,
                'onboarding_completed_at' => $seedNow,
                'account_state' => (int) ($recruiter->account_state ?? 0),
                'created_at' => $seedNow,
                'updated_at' => $seedNow,
            ]);

            DB::table('users')->where('id', $recruiter->id)->update([
                'organization_id' => $organizationId,
                'is_organization_owner' => true,
            ]);
        }

        $now = now();
        $rows = DB::table('job_posting_recruiter')->get(['job_posting_id', 'user_id']);

        foreach ($rows as $row) {
            $organizationId = User::query()->whereKey($row->user_id)->value('organization_id');
            if (! $organizationId) {
                continue;
            }

            DB::table('job_posting_organization')->insertOrIgnore([
                'job_posting_id' => $row->job_posting_id,
                'organization_id' => $organizationId,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('job_posting_organization');
    }
};
