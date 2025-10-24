<?php

namespace App\Console\Commands;

use App\Models\Reservation;
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

        $now = Carbon::now();

        $endedReservations = DB::table('reservations')
            ->where('approved', true)
            ->where('canceled', false)
            ->where('passed', false)
            ->get()
            ->filter(function ($reservation) use ($now) {
                $reservationDateTime = Carbon::parse($reservation->day . ' ' . $reservation->end);

                // Allow a 1-minute window
                return $now->between(
                    $reservationDateTime->copy()->startOfMinute(),
                    $reservationDateTime->copy()->endOfMinute()
                );
            });



        $processedCount = 0;

        foreach ($endedReservations as $reservation) {
            try {
                // Get the user who made the reservation
                $user = DB::table('users')->where('id', $reservation->user_id)->first();

                if (!$user) {
                    $this->warn("No user found for reservation ID: {$reservation->id}");
                    continue;
                }

                // Send the email
                $verificationLink = url("/reservations/{$reservation->id}/verify-end");
                Mail::to("boujjarr@gmail.com")->send(new ReservationEndedMail($user, $reservation, $verificationLink));

                // Mark the reservation as passed to avoid duplicate emails
                DB::table('reservations')->where('id', $reservation->id)->update(['passed' => true]);

                $processedCount++;

                $this->info("Reservation end time email sent for reservation ID: {$reservation->id}");
                Log::info("Reservation end time email sent for reservation ID: {$reservation->id}");
            } catch (\Exception $e) {
                $this->error("Failed to send reservation end time email for reservation ID: {$reservation->id}. Error: " . $e->getMessage());
                Log::error("Failed to send reservation end time email for reservation ID: {$reservation->id}. Error: " . $e->getMessage());
            }
        }

        $this->info("Processed {$processedCount} reservations that have reached their end time.");

        return Command::SUCCESS;
    }
}
