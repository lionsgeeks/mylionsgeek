@extends('emails.layouts.customMail')

@section('content')
    <div
        style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #f9f9f9; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

        <h2 style="color: #2c3e50;">Félicitations {{ $user->name }} 🎉</h2>

        <p style="font-size: 16px; line-height: 1.6;">
            LionsGeek atteste officiellement que vous avez suivi avec succès le programme
            <strong>{{ $trainingName }}</strong>.
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
            Votre certificat GeekLab est joint à cet e-mail au format PDF.
        </p>

        <p style="font-size: 15px; color: #555;">
            Vous pouvez également le retrouver depuis votre profil sur
            <a href="https://www.lionsgeek.ma" style="color: #2c3e50;">www.lionsgeek.ma</a>.
        </p>

        <p style="margin-top: 40px; font-size: 15px;">
            Bravo encore une fois !<br>
            L’équipe <strong>LionsGeek</strong> 🦁
        </p>
    </div>
@endsection
