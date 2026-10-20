@extends('pdf.layouts.letterhead')

@section('title', "Mise à disposition d'un ordinateur portable")

@section('content')
    <h1>Mise à disposition d'un ordinateur portable pendant la période de formation</h1>
    <table>
        <tr>
            <td class="left">
                <p>Lions Geek, association à but non lucratif située à Casablanca, 4ème étage, Ain Sebaa Center, Km 8, route de Rabat, ci-après dénommée "l'Association", met à la disposition de :</p>
                <p><strong>Nom du Bénéficiaire : {{ $user->name }}</strong></p>
                <p><strong>CIN : {{ $user->cin ?: 'Non renseigné' }}</strong></p>
                <p>ci-après dénommé(e) "le Bénéficiaire", un ordinateur portable, dont les caractéristiques sont les suivantes :</p>
                <p><strong>{{ $computer->mark }} {{ $computer->reference }}<br>Numéro de série : {{ $computer->cpu }}</strong></p>

                <h2>Article I. Objet de la mise à disposition</h2>
                <p>L'Association met à disposition du Bénéficiaire un ordinateur portable pour la durée de la formation.</p>

                <h2>Article II. Conditions de mise à disposition</h2>
                <p>Le Bénéficiaire s'engage à utiliser l'ordinateur portable uniquement dans le cadre de la formation pour laquelle il a été mis à disposition. Toute utilisation à des fins personnelles est strictement interdite. Le Bénéficiaire s'engage également à ne pas sortir l'ordinateur portable de l'enceinte de Lions Geek sans autorisation expresse du coach formateur.</p>

                <h2>Article III. Restitution de l'ordinateur portable</h2>
                <p>Le Bénéficiaire s'engage à restituer l'ordinateur portable à l'Association à la fin de la formation, dans un état de fonctionnement satisfaisant et sans aucune dégradation ou perte de ses composants.</p>

                <h2>Article IV. Responsabilité du Bénéficiaire</h2>
                <p>Le Bénéficiaire est entièrement responsable de l'ordinateur portable durant la période de mise à disposition et s'engage à en prendre soin, à ne pas l'endommager intentionnellement et à ne pas le prêter ou le louer à des tiers. Le Bénéficiaire s'engage également à protéger la confidentialité des données contenues dans l'ordinateur portable et à ne pas installer de logiciel sans autorisation expresse du coach formateur, sauf ceux qui rentrent dans le cadre de la formation.</p>
            </td>
            <td class="right">
                <h2>Article V. Autorisation expresse du coach formateur</h2>
                <p>Le Bénéficiaire s'engage à ne pas sortir l'ordinateur portable de l'enceinte de Lions Geek sans autorisation expresse du coach formateur. Cette autorisation doit être demandée par écrit et signée par le coach formateur.</p>

                <h2>Article VI. Installation de logiciels</h2>
                <p>Le Bénéficiaire s'engage à ne pas installer de logiciels sur l'ordinateur portable mis à disposition, sauf s'ils rentrent dans le cadre de la formation pour laquelle l'ordinateur a été prêté et s'ils ont été approuvés préalablement par le coach formateur.</p>

                <h2>Article VII. Utilisation, protection et autorisation de sortie de l'ordinateur portable</h2>
                <p>Le Bénéficiaire s'engage à utiliser l'ordinateur portable exclusivement dans le cadre de la formation pour laquelle il a été mis à disposition. Toute utilisation à des fins personnelles est strictement interdite. Le Bénéficiaire est entièrement responsable de l'ordinateur portable durant la période de mise à disposition et s'engage à en prendre soin et à en protéger la confidentialité des données. Le Bénéficiaire s'engage à ne pas sortir l'ordinateur portable de l'enceinte de Lions Geek sans une autorisation expresse du coach formateur.</p>

                <h2>Article VIII. Clause de résolution amiable / Loi applicable</h2>
                <p>Tout différend découlant de la présente mise à disposition sera soumis à une procédure de résolution amiable avant tout recours judiciaire. La présente mise à disposition est régie par la loi marocaine et sera interprétée en conformité avec celle-ci.</p>

                <h2>Article IX. Résiliation</h2>
                <p>La présente mise à disposition peut être résiliée à tout moment en cas de violation de l'une quelconque des dispositions du contrat. En cas de résiliation, le Bénéficiaire s'engage à restituer immédiatement l'ordinateur portable à l'Association, dans un état de fonctionnement satisfaisant et sans aucune dégradation ou perte de ses composants.</p>
            </td>
        </tr>
    </table>

    <p class="signatures">Fait en deux exemplaires, à Casablanca, le {{ optional($computer->start)->format('d/m/Y') ?? now()->format('d/m/Y') }}</p>
    <table>
        <tr>
            <td class="left"><strong>LionsGeek</strong></td>
            <td class="right"><strong>Signature du Bénéficiaire</strong><br>{{ $user->name }}</td>
        </tr>
    </table>
@endsection
