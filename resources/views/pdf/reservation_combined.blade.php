<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bon Sortie & Retour Matériel</title>
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

        .section-info {
            margin-bottom: 15px;
        }

        .section-info div {
            margin-bottom: 8px;
            font-weight: normal;
            font-size: 12px;
        }

        .section-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 12px;
            color: black;
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
            padding: 12px 10px;
            text-align: center;
            font-size: 13px;
            border: 1px solid #000;
        }

        .equipment-table td {
            border: 1px solid #000;
            padding: 14px 10px;
            text-align: center;
            font-size: 12px;
            vertical-align: middle;
            min-height: 40px;
        }

        .equipment-table tbody tr:nth-child(odd) {
            background-color: #fff;
        }

        .equipment-table tbody tr:nth-child(even) {
            background-color: #f8f8f8;
        }

        .signature-section {
            margin-top: 25px;
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

        .type-section {
            margin: 20px 0;
            text-align: left;
        }

         .type-row {
             display: inline-block;
             width: 100%;
         }

        .type-title {
            font-weight: bold;
            font-size: 12px;
            display: inline-block;
            margin-right: 30px;
        }

        .type-item {
            display: inline-block;
            margin-right: 30px;
        }

        .checkbox {
            width: 14px;
            height: 14px;
            border: 1px solid #000;
            display: inline-block;
            margin-right: 8px;
            vertical-align: middle;
        }

        .type-label {
            font-weight: bold;
            font-size: 12px;
            display: inline-block;
            vertical-align: middle;
        }

        .project-section {
            margin-top: 20px;
            border-top: 1px solid #333;
            padding-top: 15px;
        }

        .project-row {
            margin-bottom: 10px;
            font-weight: bold;
            font-size: 12px;
        }

        .project-row span {
            font-weight: bold;
        }

        .team-members {
            margin-left: 0;
            margin-top: 5px;
        }

        .member-item {
            margin-bottom: 3px;
            font-weight: normal;
            font-size: 11px;
        }
    </style>
</head>
<body>
    <!-- PAGE 1: Bon Sortie Matériel -->
    <div class="page">
        <div class="header">
            <h1>Bon Sortie Matériel</h1>
            <div class="header-info">
                <div class="left">Demandeur: {{ $reservation['user_name'] }}</div>
                <div class="right">Date: {{ \Carbon\Carbon::parse($reservation['date'])->format('Y-m-d') }}</div>
            </div>
            <div class="reference-row">
                Référence N° : {{ $reservation['id'] }}
            </div>
        </div>

         <div class="section">
             <div class="section-title">
                 Mise à disposition le {{ $reservation['start'] }}
             </div>
            <div class="section-info">
                <div>Projet: {{ $reservation['title'] ?? 'N/A' }}</div>
                <div>Demandé Approuvé par: {{ $reservation['approver_name']}}</div>
                <div>Sortie approuvée par:</div>
            </div>
        </div>

        <table class="equipment-table">
            <thead>
                <tr>
                    <th>Matériel</th>
                    <th>Référence</th>
                    <th>Check</th>
                </tr>
            </thead>
            <tbody>
                @forelse($reservation['equipments'] as $equipment)
                <tr>
                    <td>{{ $equipment['mark'] ?? 'N/A' }}</td>
                    <td>{{ $equipment['reference'] ?? 'N/A' }}</td>
                    <td></td>
                </tr>
                @empty
                <tr>
                    <td colspan="3">Aucun équipement</td>
                </tr>
                @endforelse
            </tbody>
        </table>

        <div class="signature-section">
            <div class="signature-box">
                <div class="signature-title">Signature Responsable Studio:</div>
                <div class="signature-line"></div>
                <div class="signature-date">Le</div>
            </div>
            <div class="signature-box">
                <div class="signature-title">Signature Responsable Admin:</div>
                <div class="signature-line"></div>
                <div class="signature-date">Le</div>
            </div>
        </div>

        <div class="type-section">
            <div class="type-row">
                <span class="type-title">Type :</span>
                <div class="type-item">
                    <span class="checkbox"></span>
                    <span class="type-label">Extern</span>
                </div>
                <div class="type-item">
                    <span class="checkbox"></span>
                    <span class="type-label">Intern</span>
                </div>
            </div>
        </div>

        <div class="project-section">
            <div class="project-row">
                <span>Members:</span>
                <div class="team-members">
                    @forelse($reservation['team_members'] as $member)
                        <div class="member-item">{{ $member['name'] }}</div>
                    @empty
                        <div class="member-item"></div>
                    @endforelse
                </div>
            </div>
            <div class="project-row">
                <span>Project Title</span>&nbsp;&nbsp;&nbsp;&nbsp;{{ $reservation['title'] ?? 'N/A' }}
            </div>
            <div class="project-row">
                <span>Project Description</span>&nbsp;&nbsp;&nbsp;&nbsp;{{ $reservation['description'] ?? 'N/A' }}
            </div>
        </div>
    </div>

    <!-- PAGE 2: Bon Retour Matériel -->
    <div class="page">
        <div class="header">
            <h1>Bon Retour Matériel</h1>
            <div class="header-info">
                <div class="left">Demandeur: {{ $reservation['user_name'] }}</div>
                <div class="right">Date: {{ \Carbon\Carbon::parse($reservation['date'])->format('Y-m-d') }}</div>
            </div>
            <div class="reference-row">
                Référence N° : {{ $reservation['id'] }}
            </div>
        </div>

         <div class="section">
             <div class="section-title">
                 Matériels Retournés le {{ $reservation['end'] }}
             </div>
            <div class="section-info">
                <div>Projet: {{ $reservation['title'] ?? 'N/A' }}</div>
                <div>Demandé Approuvé par: {{ $reservation['approver_name']}}</div>
                <div>Retour Approuvé par:</div>
            </div>
        </div>

        <table class="equipment-table">
            <thead>
                <tr>
                    <th>Matériel</th>
                    <th>Référence</th>
                    <th>État</th>
                    <th>Check</th>
                </tr>
            </thead>
            <tbody>
                @forelse($reservation['equipments'] as $equipment)
                <tr>
                    <td>{{ $equipment['mark'] ?? 'N/A' }}</td>
                    <td>{{ $equipment['reference'] ?? 'N/A' }}</td>
                    <td></td>
                    <td></td>
                </tr>
                @empty
                <tr>
                    <td colspan="4">Aucun équipement</td>
                </tr>
                @endforelse
            </tbody>
        </table>

        <div class="signature-section">
            <div class="signature-box">
                <div class="signature-title">Signature Responsable Studio:</div>
                <div class="signature-line"></div>
                <div class="signature-date">Le</div>
            </div>
            <div class="signature-box">
                <div class="signature-title">Signature Responsable Admin:</div>
                <div class="signature-line"></div>
                <div class="signature-date">Le</div>
            </div>
        </div>
    </div>
</body>
</html>

