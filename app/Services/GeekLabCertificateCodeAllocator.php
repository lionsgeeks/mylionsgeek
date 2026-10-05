<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class GeekLabCertificateCodeAllocator
{
    public const COUNTER_NAME = 'geeklab';

    /**
     * Allocate the next global GeekLab certificate code (C-ID001, C-ID010, C-ID100…).
     * Continues from the last issued number — never resets to 0.
     */
    public function allocateNext(): string
    {
        return DB::transaction(function () {
            $row = DB::table('certificate_counters')
                ->where('name', self::COUNTER_NAME)
                ->lockForUpdate()
                ->first();

            if ($row === null) {
                DB::table('certificate_counters')->insert([
                    'name' => self::COUNTER_NAME,
                    'last_number' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $row = DB::table('certificate_counters')
                    ->where('name', self::COUNTER_NAME)
                    ->lockForUpdate()
                    ->first();
            }

            $next = ((int) ($row->last_number ?? 0)) + 1;

            DB::table('certificate_counters')
                ->where('name', self::COUNTER_NAME)
                ->update([
                    'last_number' => $next,
                    'updated_at' => now(),
                ]);

            return $this->format($next);
        });
    }

    /**
     * Reuse an existing code when regenerating; otherwise allocate a new one.
     */
    public function resolveForUser(?string $existingCode): string
    {
        $existing = trim((string) $existingCode);
        if ($existing !== '' && preg_match('/^C-ID\d+$/', $existing) === 1) {
            return $existing;
        }

        return $this->allocateNext();
    }

    public function format(int $number): string
    {
        return 'C-ID'.str_pad((string) max(0, $number), 3, '0', STR_PAD_LEFT);
    }
}
