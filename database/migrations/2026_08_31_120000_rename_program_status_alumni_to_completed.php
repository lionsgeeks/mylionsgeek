<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Renames the program_status value 'alumni' to 'completed'.
 *
 * SQLite stores Laravel enums as a CHECK on CREATE TABLE. Dropping and
 * re-adding the column does not replace that CHECK, so this migration
 * rebuilds the users table instead.
 */
return new class extends Migration
{
    private const OLD_VALUES = ['active', 'laureate', 'alumni', 'left'];

    private const NEW_VALUES = ['active', 'laureate', 'completed', 'left'];

    public function up(): void
    {
        $this->rewriteEnum(self::NEW_VALUES, from: 'alumni', to: 'completed');
    }

    public function down(): void
    {
        $this->rewriteEnum(self::OLD_VALUES, from: 'completed', to: 'alumni');
    }

    /**
     * Repoints the program_status enum at $targetValues, remapping $from to $to.
     *
     * @param  list<string>  $targetValues
     */
    private function rewriteEnum(array $targetValues, string $from, string $to): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'sqlite') {
            $this->rewriteEnumForSqlite($targetValues, $from, $to);

            return;
        }

        if ($driver === 'mysql' || $driver === 'mariadb') {
            $this->rewriteEnumForMysql($targetValues, $from, $to);

            return;
        }

        if ($driver === 'pgsql') {
            $this->rewriteEnumForPgsql($targetValues, $from, $to);

            return;
        }

        // Any other driver: remap the value and leave constraint handling to the DBMS.
        DB::table('users')->where('program_status', $from)->update(['program_status' => $to]);
    }

    /**
     * Rebuild `users` so the CHECK actually changes. Dropping/re-adding the
     * enum column on SQLite leaves the old CHECK in place, which is what
     * failed production (`UPDATE program_status = program_status_tmp`).
     *
     * Also resumes if a previous attempt left `program_status_tmp` behind.
     *
     * @param  list<string>  $targetValues
     */
    private function rewriteEnumForSqlite(array $targetValues, string $from, string $to): void
    {
        $createSql = (string) DB::scalar("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'users'");

        if ($createSql === '') {
            return;
        }

        $hasTmp = Schema::hasColumn('users', 'program_status_tmp');
        $checkIsTarget = $this->sqliteProgramStatusCheckMatches($createSql, $targetValues);
        $legacyRowsRemain = DB::table('users')->where('program_status', $from)->exists();

        if ($checkIsTarget && ! $hasTmp && ! $legacyRowsRemain) {
            return;
        }

        $targetCheck = $this->sqliteProgramStatusCheckSql($targetValues);
        $newCreateSql = $this->sqliteCreateSqlWithoutTmp($createSql);

        if (preg_match('/"program_status"\s+varchar\s+check\s+\("program_status"\s+in\s+\([^)]+\)\)/i', $newCreateSql)) {
            $newCreateSql = (string) preg_replace(
                '/"program_status"\s+varchar\s+check\s+\("program_status"\s+in\s+\([^)]+\)\)/i',
                $targetCheck,
                $newCreateSql,
                1
            );
        } elseif (preg_match('/"program_status"\s+varchar/i', $newCreateSql)) {
            $newCreateSql = (string) preg_replace(
                '/"program_status"\s+varchar/i',
                $targetCheck,
                $newCreateSql,
                1
            );
        }

        $columns = collect(DB::select('PRAGMA table_info(users)'))
            ->pluck('name')
            ->reject(fn (string $column) => $column === 'program_status_tmp')
            ->values()
            ->all();
        $quoted = implode(', ', array_map(fn (string $column) => '"'.$column.'"', $columns));
        $selectList = implode(', ', array_map(
            fn (string $column) => $column === 'program_status'
                ? $this->sqliteRemapSelect($from, $to, $hasTmp)
                : '"'.$column.'"',
            $columns
        ));
        $indexes = DB::select("SELECT sql FROM sqlite_master WHERE type = 'index' AND tbl_name = 'users' AND sql IS NOT NULL");

        DB::statement('PRAGMA foreign_keys=OFF');
        DB::statement('DROP TABLE IF EXISTS users__program_status_rewrite');
        $this->sqliteCreateRenamedTable($newCreateSql, 'users__program_status_rewrite');
        DB::statement("INSERT INTO users__program_status_rewrite ({$quoted}) SELECT {$selectList} FROM users");
        DB::statement('DROP TABLE users');
        DB::statement('ALTER TABLE users__program_status_rewrite RENAME TO users');

        foreach ($indexes as $index) {
            if (is_string($index->sql) && $index->sql !== '') {
                DB::statement($index->sql);
            }
        }

        DB::statement('PRAGMA foreign_keys=ON');
    }

    /**
     * @param  list<string>  $values
     */
    private function sqliteProgramStatusCheckSql(array $values): string
    {
        $quoted = implode(', ', array_map(fn (string $value) => "'".$value."'", $values));

        return '"program_status" varchar check ("program_status" in ('.$quoted.'))';
    }

    /**
     * @param  list<string>  $values
     */
    private function sqliteProgramStatusCheckMatches(string $createSql, array $values): bool
    {
        $quoted = implode(', ', array_map(fn (string $value) => "'".$value."'", $values));

        return (bool) preg_match(
            '/"program_status"\s+varchar\s+check\s+\("program_status"\s+in\s+\('.$quoted.'\)\)/i',
            $createSql
        );
    }

    private function sqliteCreateSqlWithoutTmp(string $createSql): string
    {
        $withoutTmp = preg_replace('/,\s*"program_status_tmp"\s+varchar(?:\s+DEFAULT\s+NULL)?/i', '', $createSql);
        $withoutTmp = preg_replace('/"program_status_tmp"\s+varchar(?:\s+DEFAULT\s+NULL)?\s*,\s*/i', '', (string) $withoutTmp);

        return is_string($withoutTmp) ? $withoutTmp : $createSql;
    }

    private function sqliteRemapSelect(string $from, string $to, bool $hasTmp): string
    {
        $fromSql = "'".str_replace("'", "''", $from)."'";
        $toSql = "'".str_replace("'", "''", $to)."'";

        if ($hasTmp) {
            return "CASE COALESCE(program_status_tmp, program_status) WHEN {$fromSql} THEN {$toSql} ELSE COALESCE(program_status_tmp, program_status) END";
        }

        return "CASE program_status WHEN {$fromSql} THEN {$toSql} ELSE program_status END";
    }

    private function sqliteCreateRenamedTable(string $createSql, string $newName): void
    {
        $replaced = 0;
        $sql = str_replace(
            'CREATE TABLE "users"',
            'CREATE TABLE "'.$newName.'"',
            $createSql,
            $replaced
        );

        if ($replaced === 0) {
            $sql = str_replace('CREATE TABLE users', 'CREATE TABLE '.$newName, $createSql);
        }

        DB::statement($sql);
    }

    /**
     * Widen the enum to accept both spellings before remapping, so no row is ever
     * momentarily invalid, then narrow it to the target set.
     *
     * @param  list<string>  $targetValues
     */
    private function rewriteEnumForMysql(array $targetValues, string $from, string $to): void
    {
        $union = array_values(array_unique(array_merge(self::OLD_VALUES, self::NEW_VALUES)));

        DB::statement($this->modifyEnumStatement($union));
        DB::table('users')->where('program_status', $from)->update(['program_status' => $to]);
        DB::statement($this->modifyEnumStatement($targetValues));
    }

    /**
     * PostgreSQL stores Laravel enums as varchar + CHECK. Widen the check to accept
     * both spellings before remapping, then narrow it to the target set.
     *
     * @param  list<string>  $targetValues
     */
    private function rewriteEnumForPgsql(array $targetValues, string $from, string $to): void
    {
        $union = array_values(array_unique(array_merge(self::OLD_VALUES, self::NEW_VALUES)));

        $this->replaceProgramStatusCheckConstraint($union);
        DB::table('users')->where('program_status', $from)->update(['program_status' => $to]);
        $this->replaceProgramStatusCheckConstraint($targetValues);
    }

    private function dropProgramStatusCheckConstraint(): void
    {
        $constraints = DB::select("
            SELECT c.conname
            FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            JOIN pg_namespace n ON t.relnamespace = n.oid
            WHERE t.relname = 'users'
              AND n.nspname = current_schema()
              AND c.contype = 'c'
              AND pg_get_constraintdef(c.oid) LIKE '%program_status%'
        ");

        foreach ($constraints as $constraint) {
            DB::statement('ALTER TABLE users DROP CONSTRAINT "'.$constraint->conname.'"');
        }
    }

    /**
     * @param  list<string>  $values
     */
    private function replaceProgramStatusCheckConstraint(array $values): void
    {
        $this->dropProgramStatusCheckConstraint();

        $quoted = implode(', ', array_map(fn (string $value) => "'".$value."'", $values));

        DB::statement(
            'ALTER TABLE users ADD CONSTRAINT users_program_status_check '
            ."CHECK (program_status IS NULL OR program_status IN ({$quoted}))"
        );
    }

    /**
     * @param  list<string>  $values
     */
    private function modifyEnumStatement(array $values): string
    {
        $quoted = implode(', ', array_map(fn (string $value) => "'".$value."'", $values));

        return "ALTER TABLE users MODIFY program_status ENUM({$quoted}) NULL";
    }
};
