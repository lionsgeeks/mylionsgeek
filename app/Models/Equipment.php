<?php

namespace App\Models;

use App\Mail\EquipmentNonFunctionalMail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Mail;

class Equipment extends Model
{
    use HasFactory;

    protected $table = 'equipment';

    protected $fillable = [
        'id',
        'reference',
        'mark',
        'state',
        'equipment_type_id',
        'image',
    ];

    protected $casts = [
        'state' => 'boolean',
    ];

    /**
     * Boot method to handle model events
     */
    protected static function boot()
    {
        parent::boot();

        static::updating(function ($equipment) {
            // Check if state is changing from functional (true) to non-functional (false)
            if ($equipment->isDirty('state') && 
                $equipment->getOriginal('state') === true && 
                $equipment->state === false) {
                
                // Send notification to all admin users
                $adminUsers = User::where('role', 'admin')->get();
                
                foreach ($adminUsers as $admin) {
                    Mail::to($admin->email)->send(new EquipmentNonFunctionalMail($equipment, $admin));
                }
            }
        });
    }

    public function image(): MorphOne
    {
        return $this->morphOne(Image::class, 'imagable');
    }

    public function equipmentType(): BelongsTo
    {
        return $this->belongsTo(EquipmentType::class, 'equipment_type_id');
    }

    /**
     * Equipment can be in many reservations (Many-to-Many)
     */
    public function reservations()
    {
        return $this->belongsToMany(Reservation::class, 'reservation_equipment', 'equipment_id', 'reservation_id')->withPivot('day', 'start', 'end')->withTimestamps();
    }

}


