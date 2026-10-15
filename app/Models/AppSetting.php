<?php

namespace App\Models;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class AppSetting extends Model
{
    protected $fillable = ['key', 'value'];

    protected $casts = [
        'value' => 'encrypted',
    ];

    public static function get(string $key, mixed $default = null): mixed
    {
        $row = static::query()->where('key', $key)->first();
        if (! $row) {
            return $default;
        }

        try {
            return $row->value ?? $default;
        } catch (DecryptException) {
            return $default;
        }
    }

    public static function set(string $key, mixed $value): void
    {
        // Write the ciphertext directly. Loading the row and saving it decrypts the
        // previous value, which throws when that value was stored with another key.
        $encrypted = static::currentEncrypter()->encrypt($value, false);
        $now = now();
        $table = (new static)->getTable();
        $updated = DB::table($table)->where('key', $key)->update([
            'value' => $encrypted,
            'updated_at' => $now,
        ]);

        if ($updated > 0 || DB::table($table)->where('key', $key)->exists()) {
            return;
        }

        DB::table($table)->insert([
            'key' => $key,
            'value' => $encrypted,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }
}
