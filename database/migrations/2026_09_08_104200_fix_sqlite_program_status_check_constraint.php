<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * SQLite still had the old program_status CHECK
 * (active, laureate, completed, left) after later table rebuilds.
 * The app and backfill scripts write certified / not_certified / left / active.
 */
return new class extends Migration
{
    private const TARGET_CHECK = '"program_status" varchar check ("program_status" in (\'active\', \'certified\', \'not_certified\', \'left\'))';

    public function up(): void
    {
        if (! Schema::hasColumn('users', 'program_status')) {
            return;
        }

        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'sqlite') {
            $this->rewriteSqliteCheck();

            return;
        }

        if ($driver === 'mysql' || $driver === 'mariadb') {
            DB::statement("ALTER TABLE users MODIFY program_status ENUM('active', 'certified', 'not_certified', 'left') NULL");
        }
    }

    public function down(): void
    {
        // Keep the current allowed values; rolling back to laureate/completed would
        // reject certified rows already written by the app.
    }

    private function rewriteSqliteCheck(): void
    {
        $createSql = (string) DB::scalar("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'users'");

        if ($createSql === '' || $this->sqliteCheckAlreadyTarget($createSql)) {
            $this->remapLegacyValues();

            return;
        }

        if (! preg_match('/"program_status"\s+varchar\s+check\s+\("program_status"\s+in\s+\([^)]+\)\)/i', $createSql)) {
            $this->remapLegacyValues();

            return;
        }

        $newCreateSql = preg_replace(
            '/"program_status"\s+varchar\s+check\s+\("program_status"\s+in\s+\([^)]+\)\)/i',
            self::TARGET_CHECK,
            $createSql,
            1
        );

        if (! is_string($newCreateSql) || $newCreateSql === $createSql) {
            return;
        }

        $columns = collect(DB::select('PRAGMA table_info(users)'))
            ->pluck('name')
            ->all();
        $quoted = implode(', ', array_map(fn (string $column) => '"'.$column.'"', $columns));
        $selectProgramStatus = $this->sqliteRemapExpression();
        $selectList = implode(', ', array_map(
            fn (string $column) => $column === 'program_status' ? $selectProgramStatus : '"'.$column.'"',
            $columns
        ));

        DB::statement('PRAGMA foreign_keys=OFF');
        DB::statement('DROP TABLE IF EXISTS users__program_status_fixed');
        DB::statement(str_replace(
            'CREATE TABLE "users"',
            'CREATE TABLE "users__program_status_fixed"',
            $newCreateSql,
            $replaced
        ));

        if ($replaced === 0) {
            DB::statement(str_replace(
                'CREATE TABLE users',
                'CREATE TABLE users__program_status_fixed',
                $newCreateSql
            ));
        }

        DB::statement("INSERT INTO users__program_status_fixed ({$quoted}) SELECT {$selectList} FROM users");
        DB::statement('DROP TABLE users');
        DB::statement('ALTER TABLE users__program_status_fixed RENAME TO users');
        DB::statement('PRAGMA foreign_keys=ON');
    }

    private function sqliteCheckAlreadyTarget(string $createSql): bool
    {
        return (bool) preg_match(
            '/"program_status"\s+varchar\s+check\s+\("program_status"\s+in\s+\(\'active\', \'certified\', \'not_certified\', \'left\'\)\)/i',
            $createSql
        );
    }

    private function sqliteRemapExpression(): string
    {
        return "CASE program_status "
            ."WHEN 'laureate' THEN 'certified' "
            ."WHEN 'alumni' THEN 'not_certified' "
            ."WHEN 'completed' THEN 'not_certified' "
            .'ELSE program_status END';
    }

    private function remapLegacyValues(): void
    {
        DB::table('users')->where('program_status', 'laureate')->update(['program_status' => 'certified']);
        DB::table('users')->whereIn('program_status', ['alumni', 'completed'])->update(['program_status' => 'not_certified']);
    }
};
