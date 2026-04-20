<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
            @page {
                margin: 0;
            }
            html,
            body {
                margin: 0;
                padding: 0;
            }
            .page {
                position: relative;
                width: 1122px;
                height: 794px;
                overflow: hidden;
                font-family: DejaVu Sans, sans-serif;
            }
            .bg {
                position: absolute;
                inset: 0;
                width: 1122px;
                height: 794px;
            }
            .text {
                position: absolute;
                left: 0;
                width: 100%;
                text-align: center;
                color: #2c2c2c;
            }
            .name {
                top: 410px;
                font-size: 56px;
                font-weight: 700;
            }
            .title {
                top: 480px;
                font-size: 36px;
                font-weight: 400;
                color: #555555;
            }
            .training {
                top: 545px;
                font-size: 28px;
                font-weight: 400;
                color: #777777;
            }
            .date {
                position: absolute;
                left: 120px;
                top: 665px;
                font-size: 24px;
                color: #555555;
            }
        </style>
    </head>
    <body>
        <div class="page">
            <img class="bg" src="{{ $templateDataUri }}" alt="Certificate template" />

            <div class="text name">{{ $studentName }}</div>

            @php
                $normalized = strtolower((string) $field);
                $resolvedTitle = '';
                if (str_contains($normalized, 'coding') || str_contains($normalized, 'code') || str_contains($normalized, 'dev')) {
                    $resolvedTitle = 'Full Stack Developer';
                } elseif (str_contains($normalized, 'media') || str_contains($normalized, 'content') || str_contains($normalized, 'studio')) {
                    $resolvedTitle = 'Content Creator';
                } else {
                    $resolvedTitle = (string) $field;
                }
            @endphp

            @if (!empty($resolvedTitle))
                <div class="text title">{{ $resolvedTitle }}</div>
            @endif

            <div class="text training">{{ $trainingTitle }}</div>
            <div class="date">{{ $issuedDate }}</div>
        </div>
    </body>
</html>

