<?php

namespace App\Console\Commands;

use App\Models\Reservation;
use App\Models\User;
use App\Mail\ReservationEndedMail;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class CheckReservationEndTimes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reservations:check-end-times';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for reservations that have reached their end time and send emails';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for reservations that have reached their end time...');
        Log::info('CheckReservationEndTimes: Starting check for ended reservations');

        $now = Carbon::now();
        
        // Get studio responsable emails first and log them
        $studioEmails = $this->studioResponsableEmails();
        $this->info("Found " . count($studioEmails) . " studio responsable email(s): " . implode(', ', $studioEmails));
        Log::info('CheckReservationEndTimes: Studio responsable emails: ' . implode(', ', $studioEmails));

        if (empty($studioEmails)) {
            $this->warn("No studio responsable emails found! Emails will not be sent.");
            Log::warning('CheckReservationEndTimes: No studio responsable emails configured');
        }

        // Check for reservations that ended in the last 5 minutes (wider window to catch missed ones)
        $endedReservations = DB::table('reservations')
            ->where('approved', true)
            ->where('canceled', false)
            ->where('passed', false)
            ->get()
            ->filter(function ($reservation) use ($now) {
                if (!$reservation->day || !$reservation->end) {
                    return false;
                }
                
                try {
                    $reservationDateTime = Carbon::parse($reservation->day . ' ' . $reservation->end);
                    
                    // Check if reservation ended in the last 5 minutes (wider window)
                    $fiveMinutesAgo = $now->copy()->subMinutes(5);
                    return $reservationDateTime->between($fiveMinutesAgo, $now);
                } catch (\Exception $e) {
                    Log::error("CheckReservationEndTimes: Error parsing date for reservation {$reservation->id}: " . $e->getMessage());
                    return false;
                }
            });

        $this->info("Found " . $endedReservations->count() . " reservation(s) that have ended.");
        Log::info("CheckReservationEndTimes: Found " . $endedReservations->count() . " ended reservations");

        $processedCount = 0;

        foreach ($endedReservations as $reservation) {
            try {
                // Get the user who made the reservation
                $user = DB::table('users')->where('id', $reservation->user_id)->first();

                if (!$user) {
                    $this->warn("No user found for reservation ID: {$reservation->id}");
                    Log::warning("CheckReservationEndTimes: No user found for reservation ID: {$reservation->id}");
                    continue;
                }

                if (empty($studioEmails)) {
                    $this->warn("Skipping reservation ID: {$reservation->id} - no studio responsable emails configured");
                    Log::warning("CheckReservationEndTimes: Skipping reservation ID: {$reservation->id} - no emails configured");
                    continue;
                }

                // Send the email - use route helper for dynamic URL
                $verificationPath = route('reservations.verify-end', $reservation->id);
                foreach ($studioEmails as $email) {
                    $this->info("Sending email to: {$email} for reservation ID: {$reservation->id}");
                    Log::info("CheckReservationEndTimes: Sending email to {$email} for reservation ID: {$reservation->id}");
                    
                    Mail::to($email)->send(new ReservationEndedMail($user, $reservation, $verificationPath));
                    
                    $this->info("Email sent successfully to: {$email}");
                    Log::info("CheckReservationEndTimes: Email sent successfully to {$email} for reservation ID: {$reservation->id}");
                }

                // Mark the reservation as passed to avoid duplicate emails
                DB::table('reservations')->where('id', $reservation->id)->update(['passed' => true]);

                $processedCount++;

                $this->info("Reservation end time email sent for reservation ID: {$reservation->id}");
                Log::info("CheckReservationEndTimes: Reservation end time email sent for reservation ID: {$reservation->id}");
            } catch (\Exception $e) {
                $this->error("Failed to send reservation end time email for reservation ID: {$reservation->id}. Error: " . $e->getMessage());
                Log::error("CheckReservationEndTimes: Failed to send email for reservation ID: {$reservation->id}. Error: " . $e->getMessage());
                Log::error("CheckReservationEndTimes: Stack trace: " . $e->getTraceAsString());
            }
        }

        $this->info("Processed {$processedCount} reservation(s) that have reached their end time.");
        Log::info("CheckReservationEndTimes: Processed {$processedCount} reservation(s)");

        return Command::SUCCESS;
    }
    private function studioResponsableEmails(): array
    {
        // Get all users and filter by role (since role is JSON array, User model handles casting)
        $users = User::whereNotNull('email')->get();
        
        $emails = $users->filter(function ($user) {
            $roles = $this->normalizeRolesList($user->role);
            return in_array('studio_responsable', $roles);
        })->pluck('email')
          ->filter()
          ->unique()
          ->values();

        if ($emails->isEmpty()) {
            $fallback = collect(array_filter(array_map('trim', explode(',', env('STUDIO_RESPONSABLE_EMAILS', env('ADMIN_NOTIFICATION_EMAILS', ''))))));
            $emails = $fallback->filter()->unique()->values();
        }

        return $emails->all();
    }

    private function normalizeRolesList($roles): array
    {
        if (is_array($roles)) {
            $list = $roles;
        } elseif (is_string($roles) && $roles !== '') {
            $decoded = json_decode($roles, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $list = $decoded;
            } else {
                $list = array_map('trim', explode(',', $roles));
            }
        } else {
            $list = [];
        }

        return array_filter(array_map(fn ($role) => strtolower((string) $role), $list));
    }
}
