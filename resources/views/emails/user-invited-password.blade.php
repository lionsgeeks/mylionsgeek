<p>Hello {{ $user->name }},</p>

<p>Your LionsGeek account has been created.</p>

<p><strong>Email:</strong> {{ $user->email }}<br>
<strong>Temporary password:</strong> {{ $plainPassword }}</p>

<p>You can sign in here: <a href="{{ $loginUrl }}">Login</a></p>

<p>For your security, please change your password after logging in.</p>



