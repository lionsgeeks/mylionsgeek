<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppBlockModal extends Model
{
    protected $table = 'app_alert';

    protected $fillable = [
        'is_active',
        'title',
        'message',
        'button_label',
        'button_url',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public static function current(): ?self
    {
        return static::query()->where('is_active', true)->latest('id')->first();
    }

    public static function latest(): ?self
    {
        return static::query()->latest('id')->first();
    }

    /**
     * @return list<array{id: int, title: string, message: string, button_label: string, button_url: string, is_active: bool, saved_at: string}>
     */
    public static function history(): array
    {
        return static::query()
            ->latest('id')
            ->limit(50)
            ->get()
            ->map(fn (self $row) => [
                'id' => $row->id,
                'title' => (string) $row->title,
                'message' => (string) $row->message,
                'button_label' => (string) ($row->button_label ?? ''),
                'button_url' => (string) ($row->button_url ?? ''),
                'is_active' => (bool) $row->is_active,
                'saved_at' => $row->created_at?->timezone((string) config('app.timezone'))->format('Y-m-d H:i') ?? '',
            ])
            ->all();
    }
}
