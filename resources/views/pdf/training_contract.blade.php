@extends('pdf.layouts.letterhead')

@section('title', 'Contrat de formation LionsGeek')

@section('content')
    <h1>Contrat de formation LionsGeek</h1>
    <table>
        <tr>
            <td class="left">
                <h2>Préambule :</h2>
                <p>LionsGeek, Association à but non lucratif dispense des formations dans le domaine des nouvelles technologies, de la création de contenu digital et des métiers de l'audiovisuel, et propose une formation gratuite aux jeunes pour les aider à acquérir des compétences dans ce domaine. Cette formation dure six mois et se déroule en présentiel, du lundi au vendredi.</p>

                <h2>Objet</h2>
                <p>Le présent contrat a pour objet de définir les modalités de la formation proposée par LionsGeek aux bénéficiaires de ses formations.</p>
                <p><strong>Nom du Participant :</strong> {{ $studentName }}</p>
                <p><strong>CINE :</strong> {{ $cin ?: 'Non renseigné' }}</p>

                <h2>Durée de la formation</h2>
                <p>La formation débutera le {{ $startDate ?: 'Non renseigné' }} et se terminera le {{ $endDate ?: 'Non renseignée' }}.</p>

                <h2>Lieu de la formation</h2>
                <p>La formation se déroule en présentiel soit au siège de l'association situé à Ain Sebaa Center, Route de Rabat, Km 8, Ain Sbaa - Casablanca 20050, soit dans un endroit qui sera fixé par LionsGeek.</p>

                <h2>Intitulé de la formation</h2>
                <p>La formation proposée par LionsGeek comporte les modules suivants :</p>
                <p><strong>Nom de la formation :</strong> {{ $trainingName }}</p>

                <h2>Horaires de formation</h2>
                <p>Les horaires de formation sont fixés du lundi au vendredi, de 9h à 17h. Des événements ou activités peuvent être proposés durant les weekends.</p>

                <h2>Stage de formation</h2>
                <p>La formation comporte un ou plusieurs stages de formation d'une durée de 8 semaines. Les modalités de ce stage seront définies ultérieurement entre LionsGeek et le participant.</p>

                <h2>Implication et engagement du participant</h2>
                <p>Le participant s'engage à suivre la formation avec assiduité et à participer activement aux différentes activités proposées par LionsGeek. Il s'engage également à respecter le calendrier et les horaires de formation.</p>
            </td>
            <td class="right">
                <h2>Attestation de formation</h2>
                <p>À la fin de la formation, LionsGeek délivrera une attestation de formation au participant s'il a satisfait aux critères de participation et de réussite de la formation.</p>

                <h2>Responsabilités de LionsGeek</h2>
                <p>LionsGeek s'engage à dispenser la formation de manière professionnelle et à fournir les moyens nécessaires pour la réussite de la formation.</p>

                <h2>Respect des règlements intérieurs et chartes de LionsGeek</h2>
                <p>Le participant s'engage à respecter les règlements intérieurs et chartes de LionsGeek en vigueur durant la période de formation. En cas de non-respect de ces règles, LionsGeek se réserve le droit de prendre les mesures nécessaires, allant jusqu'à la résiliation du présent contrat.</p>

                <h2>Confidentialité</h2>
                <p>Le participant s'engage à ne pas divulguer les informations confidentielles auxquelles il aura accès durant la formation.</p>

                <h2>Propriété intellectuelle</h2>
                <p>Tous les supports pédagogiques, les outils, les logiciels, les bases de données, les programmes, les documents, les données et les œuvres originales de l'esprit fournis dans le cadre de la formation restent la propriété de LionsGeek ou de ses partenaires et sont protégés par les lois relatives à la propriété intellectuelle. Le participant s'engage à ne pas les utiliser à d'autres fins que pour la formation, ni à les reproduire, les diffuser, les communiquer, les céder, les vendre ou les mettre à disposition de tiers, sans l'autorisation préalable et écrite de LionsGeek ou de ses partenaires.</p>

                <h2>Résiliation</h2>
                <p>Chacune des parties peut mettre fin au présent contrat en cas de manquement grave de l'une des obligations prévues ci-dessus.</p>

                <h2>Entrée en vigueur et durée</h2>
                <p>Le présent contrat entre en vigueur à la date de signature des deux parties et est conclu pour une durée de six mois.</p>
            </td>
        </tr>
    </table>

    <p class="signatures">Fait en deux exemplaires à Casablanca, le {{ $signedAt }}</p>
    <table>
        <tr>
            <td class="left"><strong>LionsGeek</strong></td>
            <td class="right"><strong>Le participant</strong><br>{{ $studentName }}</td>
        </tr>
    </table>
    @if ($acceptedAt)
        <p class="muted">Accepté en ligne par le participant le {{ $acceptedAt }}.</p>
    @endif
@endsection
