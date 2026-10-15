<?php

namespace App\Support;

use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Mail;

/**
 * Sends credential-bearing mail after the HTTP response (in-process, not queued).
 * Avoids Mail::queue() so plaintext passwords are not persisted in the jobs table.
 */
final class SendsCredentialsMailAfterResponse
{
    public static function send(string $recipientEmail, Mailable $mailable): void
    {
        dispatch(static function () use ($recipientEmail, $mailable): void {
            try {
                Mail::to($recipientEmail)->send($mailable);
            } catch (\Throwable $exception) {
                report($exception);
            }
        })->afterResponse();
    }
}
