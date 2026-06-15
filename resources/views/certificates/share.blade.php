<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <title>{{ $title }}</title>
        <meta name="description" content="{{ $description }}" />

        <link rel="canonical" href="{{ $shareUrl }}" />

        <!-- Open Graph — LinkedIn requires width/height/type or it shows "Cannot display preview" -->
        <meta property="og:type" content="website" />
        <meta property="og:url" content="{{ $shareUrl }}" />
        <meta property="og:title" content="{{ $title }}" />
        <meta property="og:description" content="{{ $description }}" />
        <meta property="og:image" content="{{ $imageUrl }}" />
        <meta property="og:image:secure_url" content="{{ $imageUrl }}" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1122" />
        <meta property="og:image:height" content="794" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content="LionsGeek" />

        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="{{ $title }}" />
        <meta name="twitter:description" content="{{ $description }}" />
        <meta name="twitter:image" content="{{ $imageUrl }}" />

        <style>
            body {
                margin: 0;
                font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
                background: #0b0b0b;
                color: #fff;
                display: grid;
                place-items: center;
                min-height: 100vh;
                padding: 24px;
            }
            .wrap {
                width: min(980px, 96vw);
            }
            .card {
                border: 1px solid rgba(255, 255, 255, 0.12);
                border-radius: 14px;
                overflow: hidden;
                background: rgba(255, 255, 255, 0.06);
            }
            .header {
                padding: 16px 18px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.12);
            }
            .title {
                font-weight: 700;
                font-size: 16px;
                margin: 0;
            }
            .subtitle {
                margin: 6px 0 0;
                font-size: 13px;
                opacity: 0.8;
            }
            img {
                width: 100%;
                height: auto;
                display: block;
                background: #fff;
            }
        </style>
    </head>
    <body>
        <div class="wrap">
            <div class="card">
                <div class="header">
                    <p class="title">{{ $title }}</p>
                    <p class="subtitle">{{ $description }}</p>
                </div>
                @if (!empty($pdfUrl))
                    <object data="{{ $pdfUrl }}" type="application/pdf" class="h-[min(70vh,800px)] w-full">
                        <p class="p-6 text-center text-sm">
                            <a href="{{ $pdfUrl }}" class="font-semibold underline" target="_blank" rel="noopener">Ouvrir le certificat PDF</a>
                        </p>
                    </object>
                @elseif (!empty($imageUrl))
                    <img src="{{ $imageUrl }}" alt="Certificate" />
                @endif
            </div>
        </div>
    </body>
</html>

