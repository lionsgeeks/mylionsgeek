<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Adds never_showed_up to users.program_status.
 * MySQL stores the column as an ENUM. SQLite stores a CHECK
 * (see 2026_09_08_104200_fix_sqlite_program_status_check_constraint).
 */
return new class extends Migration
{
    private const PREVIOUS_CHECK = '"program_status" varchar check ("program_status" in (\'active\', \'certified\', \'not_certified\', \'left\'))';

    private const NEXT_CHECK = '"program_status" varchar check ("program_status" in (\'active\', \'certified\', \'not_certified\', \'left\', \'never_showed_up\'))';

    public function up(): void
    {
        if (! Schema::hasColumn('users', 'program_status')) {
            return;
        }

        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'sqlite') {
            $this->rewriteSqliteCheck(self::NEXT_CHECK);

            return;
        }

        if ($driver === 'mysql' || $driver === 'mariadb') {
            DB::statement("ALTER TABLE users MODIFY COLUMN program_status ENUM('active', 'certified', 'not_certified', 'left', 'never_showed_up') NULL");
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('users', 'program_status')) {
            return;
        }

        DB::table('users')
            ->where('program_status', 'never_showed_up')
            ->update(['program_status' => null]);

        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'sqlite') {
            $this->rewriteSqliteCheck(self::PREVIOUS_CHECK);

            return;
        }

        if ($driver === 'mysql' || $driver === 'mariadb') {
            DB::statement("ALTER TABLE users MODIFY COLUMN program_status ENUM('active', 'certified', 'not_certified', 'left') NULL");
        }
    }

    private function rewriteSqliteCheck(string $targetCheck): void
    {
        $createSql = (string) DB::scalar("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'users'");

        if ($createSql === '' || $this->sqliteCheckAlreadyTarget($createSql, $targetCheck)) {
            return;
        }

        $checkPattern = '/"program_status"\s+varchar\s+check\s+\("program_status"\s+in\s+\([^)]+\)\)/i';
        $plainPattern = '/"program_status"\s+varchar/i';

        if (preg_match($checkPattern, $createSql)) {
            $newCreateSql = preg_replace($checkPattern, $targetCheck, $createSql, 1);
        } elseif (preg_match($plainPattern, $createSql)) {
            $newCreateSql = preg_replace($plainPattern, $targetCheck, $createSql, 1);
        } else {
            return;
        }

        if (! is_string($newCreateSql) || $newCreateSql === $createSql) {
            return;
        }

        $columns = collect(DB::select('PRAGMA table_info(users)'))
            ->pluck('name')
            ->all();
        $quoted = implode(', ', array_map(fn (string $column) => '"'.$column.'"', $columns));
        $indexes = DB::select("SELECT sql FROM sqlite_master WHERE type = 'index' AND tbl_name = 'users' AND sql IS NOT NULL");

        DB::statement('PRAGMA foreign_keys=OFF');
        DB::statement('DROP TABLE IF EXISTS users__program_status_fixed');

        $replaced = 0;
        $sql = str_replace(
            'CREATE TABLE "users"',
            'CREATE TABLE "users__program_status_fixed"',
            $newCreateSql,
            $replaced
        );

        if ($replaced === 0) {
            $sql = str_replace(
                'CREATE TABLE users',
                'CREATE TABLE users__program_status_fixed',
                $newCreateSql
            );
        }

        DB::statement($sql);
        DB::statement("INSERT INTO users__program_status_fixed ({$quoted}) SELECT {$quoted} FROM users");
        DB::statement('DROP TABLE users');
        DB::statement('ALTER TABLE users__program_status_fixed RENAME TO users');

        foreach ($indexes as $index) {
            if (is_string($index->sql) && $index->sql !== '') {
                DB::statement($index->sql);
            }
        }

        DB::statement('PRAGMA foreign_keys=ON');
    }

    private function sqliteCheckAlreadyTarget(string $createSql, string $targetCheck): bool
    {
        return str_contains(strtolower($createSql), strtolower($targetCheck));
    }
};
