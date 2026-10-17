<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('training_sessions') && ! Schema::hasColumn('training_sessions', 'external_coach_name')) {
            Schema::table('training_sessions', function (Blueprint $table) {
                $table->string('external_coach_name')->nullable()->after('title');
            });
        }

        // Migrate legacy external coach data if exists
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'is_external') && Schema::hasTable('session_coach') && Schema::hasTable('training_sessions')) {
            $legacyCoaches = DB::table('session_coach')
                ->join('users', 'session_coach.user_id', '=', 'users.id')
                ->where('users.is_external', true)
                ->select('session_coach.session_id', 'users.id as user_id', 'users.name')
                ->get();

            foreach ($legacyCoaches as $legacy) {
                DB::table('training_sessions')
                    ->where('id', $legacy->session_id)
                    ->whereNull('external_coach_name')
                    ->update(['external_coach_name' => $legacy->name]);

                DB::table('session_coach')
                    ->where('session_id', $legacy->session_id)
                    ->where('user_id', $legacy->user_id)
                    ->delete();
            }

            // Discover all foreign key references to users table across database
            $foreignReferences = $this->getUserForeignKeyReferences();

            // Safely clean up legacy placeholder external coach users:
            // Only delete if they are marked is_external = true, have null email,
            // and are not referenced by ANY application records / foreign keys.
            $legacyUserIds = DB::table('users')
                ->where('is_external', true)
                ->whereNull('email')
                ->pluck('id');

            foreach ($legacyUserIds as $uid) {
                if (! $this->userIsReferencedAnywhere($uid, $foreignReferences)) {
                    DB::table('users')->where('id', $uid)->delete();
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('training_sessions') && Schema::hasColumn('training_sessions', 'external_coach_name')) {
            Schema::table('training_sessions', function (Blueprint $table) {
                $table->dropColumn('external_coach_name');
            });
        }
    }

    /**
     * Inspect database schema and return list of [table, column] referencing users.id
     *
     * @return array<int, array{table: string, column: string}>
     */
    private function getUserForeignKeyReferences(): array
    {
        $references = [];
        $driver = DB::getDriverName();

        if ($driver === 'sqlite') {
            try {
                $tables = DB::select("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'");
                foreach ($tables as $t) {
                    $tableName = $t->name;
                    $fks = DB::select("PRAGMA foreign_key_list('{$tableName}')");
                    foreach ($fks as $fk) {
                        if (strtolower($fk->table) === 'users') {
                            $references[] = ['table' => $tableName, 'column' => $fk->from];
                        }
                    }
                }
            } catch (\Throwable $e) {
                // Fall back to known tables list below
            }
        } elseif ($driver === 'mysql' || $driver === 'mariadb') {
            try {
                $fks = DB::select("
                    SELECT TABLE_NAME as tbl, COLUMN_NAME as col
                    FROM information_schema.KEY_COLUMN_USAGE
                    WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
                      AND REFERENCED_TABLE_NAME = 'users'
                      AND REFERENCED_COLUMN_NAME = 'id'
                ");
                foreach ($fks as $fk) {
                    $references[] = ['table' => $fk->tbl, 'column' => $fk->col];
                }
            } catch (\Throwable $e) {
                // Fall back to known tables list below
            }
        }

        // Comprehensive fallback list of known application tables and columns referencing users
        $knownReferences = [
            ['table' => 'formations', 'column' => 'user_id'],
            ['table' => 'session_coach', 'column' => 'user_id'],
            ['table' => 'attendance_listes', 'column' => 'user_id'],
            ['table' => 'attendances', 'column' => 'user_id'],
            ['table' => 'attendance_reminders', 'column' => 'user_id'],
            ['table' => 'attendance_reminder_notifications', 'column' => 'user_id'],
            ['table' => 'student_projects', 'column' => 'user_id'],
            ['table' => 'projects', 'column' => 'created_by'],
            ['table' => 'task_management_projects', 'column' => 'created_by'],
            ['table' => 'tasks', 'column' => 'assigned_to_user_id'],
            ['table' => 'tasks', 'column' => 'assigned_by_user_id'],
            ['table' => 'task_assignment_notifications', 'column' => 'assigned_to_user_id'],
            ['table' => 'task_assignment_notifications', 'column' => 'assigned_by_user_id'],
            ['table' => 'project_message_notifications', 'column' => 'notified_user_id'],
            ['table' => 'project_message_notifications', 'column' => 'sender_user_id'],
            ['table' => 'posts', 'column' => 'user_id'],
            ['table' => 'comments', 'column' => 'user_id'],
            ['table' => 'likes', 'column' => 'user_id'],
            ['table' => 'followers', 'column' => 'follower_id'],
            ['table' => 'followers', 'column' => 'followed_id'],
            ['table' => 'calls', 'column' => 'caller_id'],
            ['table' => 'calls', 'column' => 'receiver_id'],
            ['table' => 'stories', 'column' => 'user_id'],
            ['table' => 'story_views', 'column' => 'user_id'],
            ['table' => 'story_reactions', 'column' => 'user_id'],
            ['table' => 'story_highlights', 'column' => 'user_id'],
            ['table' => 'story_mentions', 'column' => 'mentioned_user_id'],
            ['table' => 'story_mentions', 'column' => 'viewer_id'],
            ['table' => 'story_notifications', 'column' => 'user_id'],
            ['table' => 'story_notifications', 'column' => 'sender_id'],
            ['table' => 'close_friends', 'column' => 'user_id'],
            ['table' => 'close_friends', 'column' => 'friend_id'],
            ['table' => 'organizations', 'column' => 'invited_by'],
            ['table' => 'organizations', 'column' => 'account_user_id'],
            ['table' => 'organization_members', 'column' => 'user_id'],
            ['table' => 'organization_members', 'column' => 'invited_by'],
            ['table' => 'organization_members', 'column' => 'account_user_id'],
            ['table' => 'job_applications', 'column' => 'applicant_id'],
            ['table' => 'job_application_notifications', 'column' => 'notified_user_id'],
            ['table' => 'job_application_notifications', 'column' => 'applicant_id'],
            ['table' => 'job_posting_recruiter', 'column' => 'user_id'],
            ['table' => 'announcements', 'column' => 'created_by'],
            ['table' => 'newsletter_emails', 'column' => 'sent_by'],
            ['table' => 'discipline_notifications', 'column' => 'user_id'],
            ['table' => 'access_request_response_notifications', 'column' => 'user_id'],
            ['table' => 'access_request_response_notifications', 'column' => 'reviewed_by'],
            ['table' => 'post_reports', 'column' => 'reporter_id'],
            ['table' => 'post_reports', 'column' => 'reviewed_by'],
            ['table' => 'post_report_notifications', 'column' => 'notified_user_id'],
            ['table' => 'user_reports', 'column' => 'reporter_id'],
            ['table' => 'user_reports', 'column' => 'reported_user_id'],
            ['table' => 'user_reports', 'column' => 'reviewed_by'],
            ['table' => 'user_blocks', 'column' => 'blocker_id'],
            ['table' => 'user_blocks', 'column' => 'blocked_id'],
            ['table' => 'computer_histories', 'column' => 'user_id'],
            ['table' => 'event_notifications', 'column' => 'user_id'],
            ['table' => 'event_notification_reads', 'column' => 'user_id'],
            ['table' => 'messages', 'column' => 'user_id'],
        ];

        foreach ($knownReferences as $ref) {
            $references[] = $ref;
        }

        // Deduplicate pairs of [table, column]
        $unique = [];
        $result = [];
        foreach ($references as $ref) {
            $key = strtolower($ref['table']) . '.' . strtolower($ref['column']);
            if (! isset($unique[$key])) {
                $unique[$key] = true;
                $result[] = $ref;
            }
        }

        return $result;
    }

    /**
     * Determine if a user ID is referenced by any application records.
     *
     * @param int|string $userId
     * @param array<int, array{table: string, column: string}> $references
     * @return bool
     */
    private function userIsReferencedAnywhere(mixed $userId, array $references): bool
    {
        foreach ($references as $ref) {
            $table = $ref['table'];
            $column = $ref['column'];

            if (Schema::hasTable($table) && Schema::hasColumn($table, $column)) {
                try {
                    if (DB::table($table)->where($column, $userId)->exists()) {
                        return true;
                    }
                } catch (\Throwable $e) {
                    // On query error, be conservative and assume referenced to prevent accidental deletion
                    return true;
                }
            }
        }

        return false;
    }
};
