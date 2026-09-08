<?php

namespace App\Policies;

use App\Http\Middleware\EnsureTrainingManagementRole;
use App\Models\Formation;
use App\Models\User;

class FormationPolicy
{
    /**
     * View a formation/training detail (including roster).
     * Staff may view any formation; students only formations they are enrolled in.
     */
    public function view(User $user, Formation $formation): bool
    {
        if (EnsureTrainingManagementRole::allows($user)) {
            return true;
        }

        return $user->isEnrolledInFormation((int) $formation->id);
    }
}
