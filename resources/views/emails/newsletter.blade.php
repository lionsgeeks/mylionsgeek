@extends('emails.layouts.customMail')

@section('content')
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #f9f9f9; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <style>
            .newsletter-body h2,
            .newsletter-body h3 {
                color: #2c3e50;
                margin-top: 25px;
                margin-bottom: 15px;
                font-weight: 600;
            }

            .newsletter-body h2 {
                font-size: 20px;
            }

            .newsletter-body h3 {
                font-size: 18px;
            }

            .newsletter-body p {
                margin: 12px 0;
                line-height: 1.8;
                color: #333333;
            }

            .newsletter-body ul,
            .newsletter-body ol {
                margin: 15px 0;
                padding-left: 25px;
            }

            .newsletter-body li {
                margin: 8px 0;
                line-height: 1.8;
                color: #333333;
            }

            .newsletter-body hr {
                border: none;
                border-top: 2px solid #e0e0e0;
                margin: 30px 0;
            }

            .newsletter-body strong {
                color: #2c3e50;
                font-weight: 600;
            }

            .newsletter-body em {
                font-style: italic;
            }

            .newsletter-body a {
                color: #007bff;
                text-decoration: none;
            }

            .newsletter-body a:hover {
                text-decoration: underline;
            }
        </style>

        <h2 style="color: #2c3e50; margin-bottom: 20px;">LionsGeek Newsletter</h2>

        <div class="newsletter-body" style="color: #333333; font-size: 16px; line-height: 1.8;">
            @if(isset($body_fr) || isset($body_ar) || isset($body_en))
                {{-- Multi-language format --}}
                @if(!empty($body_fr))
                    <div class="language-section" style="margin-bottom: 40px;">
                        <div class="newsletter-body" style="direction: ltr; text-align: left;">
                            {!! $body_fr !!}
                        </div>
                    </div>
                @endif

                @if(!empty($body_fr) && (!empty($body_ar) || !empty($body_en)))
                    <hr style="border: none; border-top: 3px solid #e0e0e0; margin: 40px 0;">
                @endif

                @if(!empty($body_ar))
                    <div class="language-section" style="margin-bottom: 40px;">
                        <div class="newsletter-body" style="direction: rtl; text-align: right;">
                            {!! $body_ar !!}
                        </div>
                    </div>
                @endif

                @if(!empty($body_ar) && !empty($body_en))
                    <hr style="border: none; border-top: 3px solid #e0e0e0; margin: 40px 0;">
                @endif

                @if(!empty($body_en))
                    <div class="language-section" style="margin-bottom: 40px;">
                        <div class="newsletter-body" style="direction: ltr; text-align: left;">
                            {!! $body_en !!}
                        </div>
                    </div>
                @endif
            @else
                {{-- Legacy single body format --}}
                {!! $body !!}
            @endif
        </div>

        <p style="margin-top: 40px; font-size: 15px; color: #555;">
            Best regards,<br>
             <strong>LionsGeek</strong> Team
        </p>
    </div>
@endsection

