<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport de Vérification Matériel</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12px;
            line-height: 1.3;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 20px;
        }

        .page {
            padding: 25px;
            min-height: calc(100vh - 40px);
            page-break-after: always;
            margin: 0 auto;
            background: #fff;
            box-sizing: border-box;
            width: 90%;
            max-width: 750px;
        }

        .page:last-child {
            page-break-after: avoid;
        }

        .header {
            text-align: center;
            margin-bottom: 25px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
        }

        .header h1 {
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #333;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .header-info {
            display: table;
            width: 100%;
            margin-bottom: 12px;
        }

        .header-info .left {
            display: table-cell;
            text-align: left;
            width: 50%;
            font-weight: bold;
            font-size: 13px;
        }

        .header-info .right {
            display: table-cell;
            text-align: right;
            width: 50%;
            font-weight: bold;
            font-size: 13px;
        }

        .reference-row {
            text-align: left;
            font-weight: bold;
            margin-top: 12px;
            font-size: 13px;
        }

        .section {
            margin-bottom: 20px;
        }

        .section-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 12px;
            color: black;
        }

        .reservation-info {
            background-color: #f8f9fa;
            padding: 15px;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            margin-bottom: 20px;
        }

        .info-row {
            display: flex;
            margin-bottom: 8px;
        }

        .info-label {
            font-weight: bold;
            width: 120px;
        }

        .info-value {
            flex: 1;
        }

        .equipment-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            border: 2px solid #000;
        }

        .equipment-table th {
            background-color: #000;
            color: white;
            font-weight: bold;
            padding: 12px 8px;
            text-align: center;
            font-size: 13px;
            border: 1px solid #000;
        }

        .equipment-table td {
            border: 1px solid #000;
            padding: 12px 8px;
            text-align: center;
            font-size: 12px;
            vertical-align: middle;
        }

        .equipment-table tbody tr:nth-child(odd) {
            background-color: #fff;
        }

        .equipment-table tbody tr:nth-child(even) {
            background-color: #f8f8f8;
        }

        .status-good {
            color: #28a745;
            font-weight: bold;
        }

        .status-damaged {
            color: #dc3545;
            font-weight: bold;
        }

        .status-not-returned {
            color: #ff8c00;
            font-weight: bold;
        }

        .notes-section {
            margin-top: 25px;
            padding: 15px;
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 5px;
        }

        .notes-title {
            font-weight: bold;
            margin-bottom: 10px;
            font-size: 14px;
        }

        .notes-content {
            font-size: 12px;
            line-height: 1.4;
            min-height: 60px;
            padding: 10px;
            background-color: white;
            border: 1px solid #ced4da;
            border-radius: 3px;
        }

        .signature-section {
            margin-top: 30px;
            display: table;
            width: 100%;
        }

        .signature-box {
            display: table-cell;
            width: 48%;
            text-align: center;
            vertical-align: top;
            padding: 0 12px;
        }

        .signature-box:first-child {
            border-right: 1px solid #333;
        }

        .signature-title {
            font-weight: bold;
            margin-bottom: 12px;
            font-size: 12px;
        }

        .signature-line {
            border-bottom: 1px solid #000;
            height: 50px;
            margin: 12px 0;
        }

        .signature-date {
            font-weight: bold;
            font-size: 11px;
        }

        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="header">
            <h1>Rapport de Vérification Matériel</h1>
            <div class="header-info">
                <div class="left">Vérifié par: {{ $reservation['user_name'] }}</div>
                <div class="right">Date: {{ \Carbon\Carbon::now()->format('Y-m-d H:i') }}</div>
            </div>
            <div class="reference-row">
                Référence Réservation N° : {{ $reservation['id'] }}
            </div>
        </div>

        <div class="reservation-info">
            <div class="section-title">Détails de la Réservation</div>
            <div class="info-row">
                <div class="info-label">Titre:</div>
                <div class="info-value">{{ $reservation['title'] ?? 'N/A' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Date:</div>
                <div class="info-value">{{ $reservation['day'] ?? 'N/A' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Heure:</div>
                <div class="info-value">{{ $reservation['start'] ?? 'N/A' }} - {{ $reservation['end'] ?? 'N/A' }}</div>
            </div>
            @if($reservation['description'])
            <div class="info-row">
                <div class="info-label">Description:</div>
                <div class="info-value">{{ $reservation['description'] }}</div>
            </div>
            @endif
        </div>

        <div class="section">
            <div class="section-title">État des Équipements</div>
            <table class="equipment-table">
                <thead>
                    <tr>
                        <th>Matériel</th>
                        <th>Référence</th>
                        <th>Type</th>
                        <th>Bon État</th>
                        <th>Mauvais État</th>
                        <th>Non Retourné</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($verificationData['equipments'] as $equipment)
                    <tr>
                        <td>{{ $equipment['mark'] ?? 'N/A' }}</td>
                        <td>{{ $equipment['reference'] ?? 'N/A' }}</td>
                        <td>{{ $equipment['type_name'] ?? 'N/A' }}</td>
                        <td class="{{ $equipment['goodCondition'] ? 'status-good' : '' }}">
                            {{ $equipment['goodCondition'] ? '✓' : '' }}
                        </td>
                        <td class="{{ $equipment['badCondition'] ? 'status-damaged' : '' }}">
                            {{ $equipment['badCondition'] ? '✓' : '' }}
                        </td>
                        <td class="{{ $equipment['notReturned'] ? 'status-not-returned' : '' }}">
                            {{ $equipment['notReturned'] ? '✓' : '' }}
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="6">Aucun équipement vérifié</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="notes-section">
            <div class="notes-title">Notes Supplémentaires</div>
            <div class="notes-content">
                @if(!empty($verificationData['notes']))
                    {{ $verificationData['notes'] }}
                @else
                    Aucune note fournie.
                @endif
            </div>
        </div>

        <div class="signature-section">
            <div class="signature-box">
                <div class="signature-title">Signature Utilisateur:</div>
                <div class="signature-line"></div>
                <div class="signature-date">Le {{ \Carbon\Carbon::now()->format('d/m/Y') }}</div>
            </div>
            <div class="signature-box">
                <div class="signature-title">Signature Responsable:</div>
                <div class="signature-line"></div>
                <div class="signature-date">Le</div>
            </div>
        </div>

        <div class="footer">
            <p>Rapport généré automatiquement le {{ \Carbon\Carbon::now()->format('d/m/Y à H:i') }}</p>
            <p>LionsGeek - Système de Gestion des Réservations</p>
        </div>
    </div>
</body>
</html>
