@extends('pdf.layouts.letterhead')

@section('title', "Charte sur le droit d'image et les données personnelles")

@section('content')
    <h1>Charte sur le droit d'image et l'utilisation des données personnelles</h1>

    <p>En participant à une formation LionsGEEK, je m'engage à respecter les règles suivantes concernant le droit d'image et l'utilisation de mes données personnelles conformément à la loi marocaine n° 09-08 du 18 février 2009 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel, modifiée par la loi n° 43-20 du 14 décembre 2020 :</p>

    <h2>Droit d'image :</h2>
    <p>Je reconnais que des photographies, vidéos ou enregistrements audio peuvent être réalisés pendant les formations LionsGEEK et que ces supports peuvent contenir des données à caractère personnel, telles que mon image. Conformément à l'article 9 de la loi n° 09-08, je donne mon consentement libre, spécifique et éclairé à LionsGEEK pour utiliser mon image dans le cadre de la promotion de ses activités, sur ses supports de communication (site web, réseaux sociaux, publications papier, etc.), et ce pour une durée illimitée. Je peux cependant demander à tout moment le retrait de mes images en contactant LionsGEEK à l'adresse email suivante : contact@lionsgeek.ma.</p>

    <h2>Utilisation des données personnelles :</h2>
    <p>Je consens à ce que LionsGEEK collecte, traite et utilise mes données personnelles, telles que mon nom, mon prénom, mon adresse email et mon numéro de téléphone, dans le but exclusif de me communiquer des informations relatives aux formations LionsGEEK, à ses événements ou à ses offres promotionnelles, conformément à l'article 6 de la loi n° 09-08. Mes données personnelles ne seront pas transmises à des tiers sans mon consentement express. Je peux demander à tout moment la suppression de mes données personnelles en contactant LionsGEEK à l'adresse email suivante : contact@lionsgeek.ma.</p>

    <p>Je reconnais avoir pris connaissance de cette charte et m'engage à la respecter scrupuleusement. J'autorise LionsGEEK à collecter, traiter et utiliser mes données personnelles et mon image conformément aux termes de cette charte et à la loi marocaine sur la protection des données personnelles.</p>

    <p class="signatures">Fait à Casablanca, le {{ $signedAt }}</p>
    <p>Nom et prénom : <strong>{{ $studentName }}</strong> / CIN <strong>{{ $cin ?: 'Non renseigné' }}</strong></p>
    <p>Formation : {{ $trainingName }}</p>
    <p>Signature :</p>
    @if ($acceptedAt)
        <p class="muted">Accepté en ligne le {{ $acceptedAt }}.</p>
    @endif
@endsection
