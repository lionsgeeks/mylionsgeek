<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>@yield('title')</title>
    <style>
        @page {
            margin: 3.5cm 1.4cm 3.2cm 1.4cm;
        }

        body {
            font-family: Helvetica, Arial, sans-serif;
            font-size: {{ $fontSize }}pt;
            line-height: 1.3;
            color: #111;
        }

        .letterhead {
            position: fixed;
            top: -3.5cm;
            left: -1.4cm;
            width: 21cm;
            height: 29.7cm;
            z-index: -1;
        }

        h1 {
            font-size: 1.45em;
            text-align: center;
            margin: 0 0 0.7em;
        }

        h2 {
            font-size: 1em;
            margin: 0.6em 0 0.15em;
        }

        p {
            margin: 0 0 0.35em;
            text-align: justify;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        td {
            width: 50%;
            vertical-align: top;
        }

        td.left {
            padding-right: 0.4cm;
        }

        td.right {
            padding-left: 0.4cm;
        }

        .signatures {
            margin-top: 0.8em;
        }

        .signatures td {
            height: 2.2em;
        }

        .muted {
            color: #555;
            font-size: 0.85em;
        }
    </style>
</head>

<body>
    <img class="letterhead" src="{{ $letterhead }}" alt="">
    @yield('content')
</body>

</html>
