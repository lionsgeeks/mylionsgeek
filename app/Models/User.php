<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id',               // UUID primary key
        'name',
        'email',
        'password',
        'role',
        'phone',
        'cin',
        'status',
        'formation_id',
        'account_state',
        'image',
        'access_cowork',
        'access_studio',
        'promo',
        'remember_token',
        'email_verified_at',
        // 'remember_token',
        'created_at',
        'updated_at',
        'wakatime_api_key',
        'last_online',
        'activation_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => 'array',
            'two_factor_recovery_codes' => 'array',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'has_two_factor_authentication',
        'has_confirmed_two_factor_authentication',
    ];

    public function access(): HasOne
    {
        return $this->hasOne(Access::class);
    }

    public function formation()
    {
        return $this->belongsTo(Formation::class, 'formation_id');
    }

    /**
     * Get Geekos created by this user.
     */
    public function createdGeekos()
    {
        return $this->hasMany(Geeko::class, 'created_by');
    }

    /**
     * Get Geeko sessions started by this user.
     */
    public function startedSessions()
    {
        return $this->hasMany(GeekoSession::class, 'started_by');
    }

    /**
     * Get Geeko participations for this user.
     */
    public function geekoParticipations()
    {
        return $this->hasMany(GeekoParticipant::class, 'user_id');
    }

    public function scopeActive($query)
    {
        return $query->where('account_state', 0);
    }

    /**
     * User has many reservations as creator
     */
    public function reservations()
    {
        return $this->hasMany(Reservation::class, 'user_id');
    }

    /**
     * User can be in many reservation teams (Many-to-Many)
     */
    public function reservationTeams()
    {
        return $this->belongsToMany(Reservation::class, 'reservation_teams', 'user_id', 'reservation_id')->withTimestamps();
    }

    /**
     * User badges relationship
     */
    public function badges()
    {
        return $this->belongsToMany(Badge::class)->withTimestamps();
    }

    /**
     * Determine if the user has two-factor authentication enabled.
     */
    public function hasTwoFactorAuthentication(): bool
    {
        return ! is_null($this->two_factor_secret);
    }

    /**
     * Determine if two-factor authentication is confirmed.
     */
    public function hasConfirmedTwoFactorAuthentication(): bool
    {
        return ! is_null($this->two_factor_confirmed_at);
    }

    /**
     * Get the user's two factor authentication status.
     */
    public function getHasTwoFactorAuthenticationAttribute(): bool
    {
        return $this->hasTwoFactorAuthentication();
    }

    /**
     * Get the user's two factor authentication confirmation status.
     */
    public function getHasConfirmedTwoFactorAuthenticationAttribute(): bool
    {
        return $this->hasConfirmedTwoFactorAuthentication();
    }

    /**
     * Get the user's recovery codes.
     */
    public function recoveryCodes(): array
    {
        return $this->two_factor_recovery_codes ?? [];
    }

    /**
     * Replace the given recovery code with a new one in the user's array of recovery codes.
     */
    public function replaceRecoveryCode(string $code): void
    {
        $this->forceFill([
            'two_factor_recovery_codes' => collect($this->recoveryCodes())
                ->reject(fn ($recoveryCode) => $recoveryCode === $code)
                ->values()
                ->all(),
        ])->save();
    }
}
