<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Title</title>
</head>

<body>
    <style type="text/css" media="all">
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box !important;
            font-size: 14px !important;
            width: 100%;
            height: auto;
            font-family: Arial, Helvetica, sans-serif !important;
        }

        body {
            width: 100%;
            height: 100%;
        }

        .maindiv {
            position: relative;
            width: 100%;
            height: auto;
        }

        .maincenter {
            position: relative;
            width: 100%;
            margin-top: 30px;
        }

        .mainimg {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%)
        }

        .center {
            text-align: center;
        }

        .half {
            position: absolute;
            top: 80px;
            left: 20px;
            width: 45% !important;
        }

        .half2 {
            position: absolute;
            top: 80px;
            right: 20px;
            width: 45% !important;
        }

        .topm {
            margin-top: 8px !important;
        }

        .w100 {
            width: 50px !important;
            height: 50px !important;
        }

        img {
            width: 100% !important;
            height: 100% !important;
        }

        .btmdiv {
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%)
        }

        .headercenter {
            width: 100%;
            position: absolute;
            top: 50px;
            left: 50%;
            transform: translateX(-50%);
            margin-top: 20px;
            margin-bottom: 20px;

        }

        .topk {}
    </style>
    <div class="maincenter topm">
        <div class="mainimg w100">
            <img src={{asset("logo1.png") }} alt="logo1" srcset="" loading="lazy">
        </div>
    </div>


    <h3 class="center  headercenter">Mise à disposition d'un ordinateur portable pendant la période de formation</h3>
    <div class="maindiv">
        <div class="half topm">
            <p class="topm">Lions Geek, association à but non lucratif située à Casablanca, 4éme étage, Ain Sebâa
                Center, Km 8, route
                de
                Rabat, ci-après dénommée "l'association", met à la disposition de: </p>
            <p class="topm"><b>Nom de Bénéficiaire : {{ $user->name }} {{$user->cin}}</b></p>
            <p class="topm">ci-après dénommé(e) "le Bénéficiaire", un ordinateur portable, dont les caractéristiques
                sont les
                siovantes:
            </p>
            <p class="topm"><b>{{ $computer->mark }} {{ $computer->reference }} <br>
                    numéro de série: {{ $computer->cpu }}
                </b></p>
            <h4 class="topm">Article I.: Objet de la mise à disposition</h4>
            <p class="topm">L'Association met à disposition du Bénéficiaire un ordinateur portable pour la durée
                de la formation.</p>
            <h4 class="topm">Arcticle II. Conditions de mise à disposition</h4>
            <p class="topm">
                Le Bénéficiaire s'engage à utiliser l'ordinateur portable
                uniquement dans le cadre de la formation pour laquelle il a été
                mis à disposition. Toute utilisation à des fins personnelles est
                strictement interdite. Le Bénéficiaire s'engage également à ne
                pas sortir l'ordinateur portable de l'enceinte de Lions Geek sans
                autorisation expresse du coach formateur
            </p>
            <h4 class="topm">Article III. Restitution de l'ordinateur portable</h4>
            <p class="topm">
                Le Bénéficiaire s'engage à restituer l'ordinateur portable à
                I'Association à la fin de la formation, dans un état de
                fonctionnement satisfaisant et sans aucune dégradation ou
                perte de ses composants.
            </p>
            <h4 class="topm">Article IV. Responsabilité du Bénéficiaire</h4>
            <p class="topm">
                Le Bénéficiaire est entièrement responsable de l'ordinateur
                portable durant la période de mise à disposition et s'engage
                en prendre soin, à ne pas l'endommager intentionnellement et
                à ne pas le prêter ou le louer à des tiers. Le Bénéficiaire
                s'engage également à protéger la confidentialité des données
                contenues dans l'ordinateur portable et à ne pas installer de
                logiciel sans autorisation expresse du coach formateur, sauf
                ceux qui rentrent dans le cadre de la formation.
            </p>
            <h4 class="topm">Article V. Autorisation expresse du coach formateur</h4>
            <p class="topm">
                Le Bénéficiairre s'engage à ne pas sortir l'ordinateur portable de l'encainte de Lions Geek sans
                autorisation expresse du coach formateur. Cette autorisation doit être demandée par écrit et signée
                par
                le
                coach formateur.
            </p>
        </div>
        <div class="half2 topm">
            <h4 class="topm">Article VI. Installation de logiciels</h4>
            <p class="topm">
                Le Bénéficiaire s'engage à ne pas installer de logiciels sur l'ordinateur portable mis à
                disposition,
                sauf s'ils rentrent dans le cadre de la formation pour laquelle l'ordinateur a été prêté et s'ils
                ont
                été approuvés préalablement par le coach formateur.
            </p>
            <h4 class="topm">Article VII. Utilisation, protection et autorisation de sortie de l'ordinateur
                portable</h4>
            <p class="topm">
                Le Bénéficiaire s'engage à utiliser l'ordinateur portable exclusivement dans le cadre de la
                formation
                pour laquelle il a été mis à disposition. Toute utilisation ç des fins personnelles est strictement
                interdite. Le Bénéficiaire est entièrement responsable de l'ordinateur portable durant la période de
                mise à disposition et s'engage à en prendre soin et ç en protéger la confidentialité des données. Le
                Bénéficiaire s'engage à ne pas sortitr l'ordinateur portable de l'enceinte de Lions Feek sans une
                autorisation expresse du coach formateur.
            </p>
            <h4 class="topm">Article VIII. Clause de résolution amiable / Loi applicable</h4>
            <p class="topm">
                Tout différend découlant de la présente mise à disposition sera soumis à une procédure de résolution
                amiable avant tout recours judiciaire. La présente mise à disposition est régie par la loi marocaine
                et
                sera interprétée en conformité avec celle-ci.
            </p>
            <h4 class="topm">Article IX. Résiliation</h4>
            <p class="topm">
                La présente mise à disposition peut être résiliée à tout moment en cas de violation de l'une
                quelconque
                des dispositions du contract. En cas e résiliation, le Bénificiaire s'engage à restituer
                immédiatmement
                l'ordinateur portable à l'Association, dans un état de fonctionnement satisfaisant et sans aucune
                dégradation ou perte de ses composants.
            </p>
            <br>
            <p class="topm">Fait en deux exemplaires, à Casablanca, le</p>
            <h1>{{$computer->start}}</h1>
            <br>
            <p>Signature du Bénéficiaire:</p>
        </div>
    </div>
    <div class="center  btmdiv">
        <hr class="topm">

        <p class="topm"> Association à but non lucratif</p>
        <p>4éme étage, Ain Sebaa Center, Route de Rabat</p>
        <p>Km 8, Ain Sbaa - Casablanca</p>
        <p>Tel: +212 522 662 660 - Fax: +212 522 358 209</p>
        <p>contact@lionsgeek.ma - www.lionsgeek.ma</p>
    </div>

</body>

</html>