<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>{{ $subjectLine ?? 'Message from LionsGeek' }}</title>
    <style>
        /* All your styles (body, header, content, footer, etc.) */
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            margin-bottom: 20px;
        }

        .content {
            background-color: #ffffff;
            padding: 20px;
            border: 1px solid #e9ecef;
            border-radius: 8px;
        }

        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #6c757d;
            font-size: 14px;
        }

        .logo {
            max-width: 150px;
            margin-bottom: 15px;
        }

        .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #ffc107;
            color: #000;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }

        .contact-link {
            color: #007bff;
            text-decoration: none;
        }

        .contact-link:hover {
            text-decoration: underline;
        }
    </style>
</head>

<body>
    @include('emails.layouts.header')

    <div class="content">
        @yield('content')
    </div>

    @include('emails.layouts.footer')
</body>

</html>
