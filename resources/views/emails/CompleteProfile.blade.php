@extends('emails.layouts.customMail')

@section('content')
    <h2>Hello {{ $user->name }}!</h2>
    <p>Welcome to LionsGeek 🎉</p>
    {{-- <p>Here is your temporary password: <strong>{{ $password }}</strong></p> --}}
    <p>Please change it after logging in.</p>

    <div style="text-align: center; margin-top: 20px;">
        <a href="https://lionsgeek.ma/login" class="btn">Login Now</a>
    </div>
@endsection
