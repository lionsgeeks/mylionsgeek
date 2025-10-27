<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport de Vérification Matériel</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
            margin: 20px;
            padding: 0;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
        }
        
        .header h1 {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
        }
        
        .info-section {
            margin-bottom: 25px;
            padding: 15px;
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
        }
        
        .info-row {
            margin-bottom: 8px;
        }
        
        .info-label {
            font-weight: bold;
            display: inline-block;
            width: 120px;
        }
        
        .section-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #333;
        }
        
        .equipment-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            border: 1px solid #000;
        }
        
        .equipment-table th {
            background-color: #333;
            color: white;
            font-weight: bold;
            padding: 10px 8px;
            text-align: center;
            font-size: 11px;
            border: 1px solid #000;
        }
        
        .equipment-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: center;
            font-size: 11px;
        }
        
        .equipment-table tbody tr:nth-child(even) {
            background-color: #f8f8f8;
        }
        
        .notes-section {
            margin-top: 25px;
            padding: 15px;
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
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
            padding: 0 10px;
        }
        
        .signature-box:first-child {
            border-right: 1px solid #333;
        }
        
        .signature-title {
            font-weight: bold;
            margin-bottom: 10px;
            font-size: 12px;
        }
        
        .signature-line {
            border-bottom: 1px solid #000;
            height: 40px;
            margin: 10px 0;
        }
        
        .signature-date {
            font-weight: bold;
            font-size: 10px;
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
    <div class="header">
        <h1>Rapport de Vérification Matériel</h1>
        <div style="font-weight: bold;">
            <span style="float: left;">Vérifié par: {{ $reservation['user_name'] }}</span>
            <span style="float: right;">Date: {{ \Carbon\Carbon::now()->format('d/m/Y H:i') }}</span>
            <div style="clear: both;"></div>
        </div>
        <div style="text-align: left; font-weight: bold; margin-top: 10px;">
            Référence Réservation N° : {{ $reservation['id'] }}
        </div>
    </div>

    <div class="info-section">
        <div class="section-title">Détails de la Réservation</div>
        <div class="info-row">
            <span class="info-label">Titre:</span>
            <span>{{ $reservation['title'] ?? 'N/A' }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Date:</span>
            <span>{{ $reservation['day'] ?? 'N/A' }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Heure:</span>
            <span>{{ $reservation['start'] ?? 'N/A' }} - {{ $reservation['end'] ?? 'N/A' }}</span>
        </div>
        @if($reservation['description'])
        <div class="info-row">
            <span class="info-label">Description:</span>
            <span>{{ $reservation['description'] }}</span>
        </div>
        @endif
    </div>

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
                <td>{{ $equipment['goodCondition'] ? '✓' : '' }}</td>
                <td>{{ $equipment['badCondition'] ? '✓' : '' }}</td>
                <td>{{ $equipment['notReturned'] ? '✓' : '' }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="6">Aucun équipement vérifié</td>
            </tr>
            @endforelse
        </tbody>
    </table>

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
</body>
</html>

