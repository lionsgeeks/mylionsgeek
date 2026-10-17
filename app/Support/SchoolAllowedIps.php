<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SchoolAllowedIps
{
    public const SETTING_KEY = 'attendance.school_allowed_ip';

    /**
     * @return list<string>
     */
    public static function savedList(): array
    {
        if (! Schema::hasTable('app_settings')) {
            return [];
        }

        $value = DB::table('app_settings')->where('key', self::SETTING_KEY)->value('value');

        if (! is_string($value)) {
            return [];
        }

        return array_values(array_filter(
            self::parse($value),
            fn (string $ip) => filter_var($ip, FILTER_VALIDATE_IP) !== false
        ));
    }

    /**
     * Three form fields filled from the one saved row.
     *
     * @return list<string>
     */
    public static function formIps(): array
    {
        return array_pad(array_slice(self::savedList(), 0, 3), 3, '');
    }

    /**
     * @return list<string>
     */
    public static function resolve(): array
    {
        return self::savedList();
    }

    public static function source(): string
    {
        return self::savedList() !== [] ? 'saved' : 'empty';
    }

    /**
     * Create the single settings row, or update it when it already exists.
     *
     * @param  list<string>  $ips
     */
    public static function store(array $ips): void
    {
        $now = now();
        $value = implode(',', array_values($ips));
        $updated = DB::table('app_settings')->where('key', self::SETTING_KEY)->update([
            'value' => $value,
            'updated_at' => $now,
        ]);

        if ($updated > 0 || DB::table('app_settings')->where('key', self::SETTING_KEY)->exists()) {
            return;
        }

        DB::table('app_settings')->insert([
            'key' => self::SETTING_KEY,
            'value' => $value,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }

    /**
     * @return list<string>
     */
    public static function parse(string $value): array
    {
        return array_values(array_filter(
            array_map('trim', explode(',', $value)),
            fn (string $ip) => $ip !== ''
        ));
    }
}
