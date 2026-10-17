<?php

use App\Mail\ForgotPasswordLinkMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function resetTokenFor(User $user): string
{
    $sent = null;

    Mail::assertSent(ForgotPasswordLinkMail::class, function (ForgotPasswordLinkMail $mail) use ($user, &$sent) {
        if (! $mail->hasTo($user->email)) {
            return false;
        }

        $sent = $mail;

        return true;
    });

    return basename((string) parse_url($sent->resetUrl, PHP_URL_PATH));
}

test('reset password link screen can be rendered', function () {
    $response = $this->get(route('password.request'));

    $response->assertStatus(200);
});

test('reset password link is sent when the account exists', function () {
    Mail::fake();

    $user = User::factory()->create();

    $response = $this->post(route('password.email'), ['email' => $user->email]);

    $response
        ->assertSessionHasNoErrors()
        ->assertSessionHas('status', 'A reset link will be sent if the account exists.');

    Mail::assertSent(ForgotPasswordLinkMail::class, function (ForgotPasswordLinkMail $mail) use ($user) {
        return $mail->hasTo($user->email);
    });
});

test('unknown email gets the same message and no extra reset mail is sent', function () {
    Mail::fake();

    $user = User::factory()->create();

    $this->post(route('password.email'), ['email' => $user->email])
        ->assertSessionHasNoErrors()
        ->assertSessionHas('status', 'A reset link will be sent if the account exists.');

    $this->post(route('password.email'), [
        'email' => 'missing-account@example.com',
    ])
        ->assertSessionHasNoErrors()
        ->assertSessionHas('status', 'A reset link will be sent if the account exists.');

    Mail::assertSent(ForgotPasswordLinkMail::class, 1);
});

test('a second reset request within the throttle window shows the same message', function () {
    Mail::fake();

    $user = User::factory()->create();

    $this->post(route('password.email'), ['email' => $user->email])
        ->assertSessionHas('status', 'A reset link will be sent if the account exists.');

    $response = $this->post(route('password.email'), ['email' => $user->email]);

    $response
        ->assertSessionHasNoErrors()
        ->assertSessionHas('status', 'A reset link will be sent if the account exists.');

    Mail::assertSentCount(1);
});

test('invalid email is rejected before a reset is attempted', function () {
    Mail::fake();

    $response = $this->post(route('password.email'), [
        'email' => 'not-an-email',
    ]);

    $response->assertSessionHasErrors('email');

    Mail::assertNothingSent();
});

test('reset password screen can be rendered', function () {
    Mail::fake();

    $user = User::factory()->create();

    $this->post(route('password.email'), ['email' => $user->email]);

    $response = $this->get(route('password.reset', [
        'token' => resetTokenFor($user),
        'email' => $user->email,
    ]));

    $response->assertStatus(200);
});

test('password can be reset with valid token', function () {
    Mail::fake();

    $user = User::factory()->create();

    $this->post(route('password.email'), ['email' => $user->email]);

    $response = $this->post(route('password.store'), [
        'token' => resetTokenFor($user),
        'email' => $user->email,
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('login'));
});

test('password cannot be reset with invalid token', function () {
    $user = User::factory()->create();

    $response = $this->post(route('password.store'), [
        'token' => 'invalid-token',
        'email' => $user->email,
        'password' => 'newpassword123',
        'password_confirmation' => 'newpassword123',
    ]);

    $response->assertSessionHasErrors('email');
});
