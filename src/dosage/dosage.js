/** dosage.js
 *
 * @module dosage
 * @description
 * - Initialise les composants du dosage et affiche la page
 * - Gère le vidage de la burette et les couleurs
 */

import * as cts from "../environnement/constantes.js";
import * as ui from "./ui/html_cts.js";

import * as labo from "./ui/interface.js";
import { G } from "../environnement/globals.js";
import { ES_BT_DSPINFO_OX,MNU_ESPECES, ESPECES, ES_DIV_INFO, ES_BT_DSPINFO_AC } from "./../especes/html_cts.js"

// utils
import * as e from "../modules/utils/errors.js";
import { uArray } from "../modules/utils/array.js";
import { mixColors } from "../modules/utils/color.js";
import { hasKey } from "../modules/utils/object.js";
import { isNumeric, isObject } from "../modules/utils/type.js";
import { getEltID, getElt } from "../modules/utils/html.js";

import { dspContextInfo, dspInfo } from "../infos/infos.js";

// labo
import { initBecher } from "./ui/initBecher.js";
import { initTooltip } from "./ui/initTooltip.js";
import { initBurette } from "./ui/initBurette.js";
import { initFlacon } from "./ui/initFlacon.js";
import { initPhmetre } from "./ui/initPhmetre.js";
import { initConductimetre } from "./ui/initConductimetre.js";
import { initPotentiometre } from "./ui/initPotentiometre.js";
import { ERR_DOSAGE } from "./ui/lang_fr.js";
import { ES_BTCLOSE_LABEL, ES_MSG_INFO_ERR } from "../especes/lang_fr.js";

import { setEvents, setEventsClick } from "./dosage.events.js";
import { setClassMenu, dspTabDosage } from "./dosage.ui.js";
import { dspTabEspeces } from "../especes/especes.ui.js";
import { resetMesures, setDosageValues, updValues, getDosage } from "./dosage.datas.js";
import { defGraphCD, defGraphPH, defGraphPT } from "./dosage.graph.js";
import { html } from "./ui/html.js";

/**
 * @typedef {import("../../types/classes").Dosage} Dosage
 * @typedef {import("../../types/types").tLab} tLab
 */

/** Met  à jour les informations du formulaire
 * 
 * - Lance la routine python et récupère les points des courbes 
 * - Initialise le dosage (Crée le graphe sans affichage)
 * @param {Dosage} G global
 * @returns void
 * @public
 * @file dosage.js
 */
 async function initDosage( G ) {

    // Lance calcul dosage
    getDosage(G.type).then( function( data ) {

        // si dosage impossible data est une constante affiche message d'erreur
        if ( data == "pyError" ) {
            if (G.type == cts.TYPE_ACIDEBASE)
                dspMessage( ES_BT_DSPINFO_AC )
            else 
                dspMessage( ES_BT_DSPINFO_OX )
        } else {

            // initialise la constante dosage avec data
            setDosageValues( G, data )

            // modifie l'état
            G.setState( cts.ETAT_DOS, 1 )

            // Affiche page
            getEltID( ui.DOSAGE ).html( html );
            getElt( ".title" ).html( G.title )

            // On bascule sur dosage
            dspTabEspeces(false)
            dspTabDosage(true)
            getEltID( MNU_ESPECES ).removeClass( 'active' )
            getEltID( ESPECES ).removeClass( 'active show' )
        
            /** Initialisation du dosage (dosage.js)  */
            //if (isObject(G.lab)) {
            //    updateLab(G)
            //    G.lab.canvas.redraw();
            //} else {
                createLab(G)
            //}
            
        }
    })
}

function updateLab(G) {
    
    G.lab.becher.remplir(0, G.solution.vol, 0);
    G.lab.becher.setColor(getColor(0));
    G.lab.phmetre.dispose(G.lab.becher);
    G.lab.conductimetre.dispose(G.lab.becher);
    G.lab.potentiometre.dispose(G.lab.becher);

    // met à jour les graphes
    G.charts.chartPH.setOptions(G);
    G.charts.chartCD.setOptions(G);
    G.charts.chartPT.setOptions(G);
    
    // définition des événements
    setEvents(G);
}

/** Initialise les composants du dosage
 *
 * Crée les instances des différents éléments du canvas et le canvas.
 * Définit les événements
 *
 * @access public
 * @param {Dosage} G objet global
 *
 * @use Becher#remplir, Becher#setColor
 * @use Appareil#dispose
 * @use initBecher=>initBecher, initPhmetre=>initPhmetre
 * @use Graphx#setOptions
 * @use dosage.graph=>defGraphPH, dosage.graph=>defGraphCD, dosage.graph=>defGraphPT
 *
 * @requires Graphx
 * @returns {Promise} Objet contenant les éléments du dosage
 * @file dosage.js
 */
async function createLab(G) {

    // création canvas
    // @ts-ignore
    // eslint-disable-next-line no-undef
        await oCanvas.domReady(function () {

            var _lab = {}

            // @ts-ignore
            // eslint-disable-next-line no-undef
            _lab.canvas = oCanvas.create({
                canvas: "#" + ui.DOS_CANVAS,
                fps: 40,
                background: "./" + cts.FILE_BACKGROUND_LABO,
            });
            _lab.canvas.width = labo.CANVAS.width;
            _lab.canvas.height = labo.CANVAS.height;

            // fond écran
            _lab.canvas.background.set("image(" + cts.FILE_BACKGROUND_LABO + ")");

            // création des éléments
            _lab.becher = initBecher(G, _lab.canvas, labo.BECHER);
            _lab.tooltip = initTooltip(_lab.canvas);
            _lab.flacons = initFlacon(G, _lab.canvas, _lab.tooltip, _lab.becher, labo.FLACON);
            _lab.burette = initBurette(G, _lab.canvas, _lab);
            _lab.phmetre = initPhmetre(_lab, G);
            _lab.conductimetre = initConductimetre(_lab, G);
            _lab.potentiometre = initPotentiometre(_lab, G);
            G.lab = _lab

    });

    if (isObject(G.lab)) {

        /** création des instances de graphes */

        // Création graphe pH
        G.charts.chartPH = defGraphPH()
        G.charts.chartPH.setEvent("onHover", setEventsClick);

        // Création graphe conductance
        G.charts.chartCD = defGraphCD()

        // Création graphe potentiometre
        G.charts.chartPT = defGraphPT()

        // Modifie affichage pHmetre et graph
        G.lab.phmetre.setText(G.sph);

        // définition des événements
        setEvents(G);

        // Affiche info
        dspContextInfo("init")
    } else {
        getEltID(ui.DOS_DIV_GRAPH).hide()
    }
}
    

/********************************************************** */

/** fonction de vidage burette
 *
 * met à jour la burette et le bécher
 * met à jour le graphe et l'affichage du texte des phmetre et conductimètre
 *
 * @param {tLab} lab
 * @param {Dosage} G
 * @returns void
 * @use dosage.datas=>updValues
 * @use burette#vidange, becher#setColor
 * @use potentiometre#setText, conductimetre#setText, phmetre#setText
 * @use Graphx#changeData
 * @public
 * @file dosage.js
 */
function vidage( lab, G ) {
    // change état
    lab.burette.vidage = lab.burette.vidage == 0 ? 1 : 0;

    // vidage de la burette
    lab.burette.vidange( lab.burette.debit, lab.becher );

    // Mise à jour des valeurs
    if ( !updValues( lab.burette ) ) return false;

    // Modifie la couleur du bécher en fonction du dosage
    lab.becher.setColor( getColor( 0 ) );

    // si dosage pH
    // définit le texte et actualise le graphe
    if ( G.test( "etat", cts.ETAT_PHMETRE ) ) {
        lab.phmetre.setText( G.sph );
        G.charts.chartPH.changeData( G.charts.chartPH.data );

        // Boutons
        // Active les boutons si volume titrant supérieur à 10 mL
        if ( G.titrant.vol > 5 ) {
            getEltID( ui.DOS_BT_DERIVEE ).removeAttr( "disabled" );
            getEltID( ui.DOS_BT_TAN1 ).removeAttr( "disabled" );
            getEltID( ui.DOS_BT_COTH ).removeAttr( "disabled" );
        }
    }
    // dosage ox
    else if ( G.test( "etat", cts.ETAT_COND ) ) {
        lab.conductimetre.setText( G.scond );
        G.charts.chartCD.changeData( G.charts.chartCD.data );
    }

    // dosage potentiomètrique
    else if ( G.test( "etat", cts.ETAT_POT ) ) {
        lab.potentiometre.setText( G.spot );
        G.charts.chartPT.changeData( G.charts.chartPT.data );
    }
}

/********************************************************** */

/** Récupère la couleur du bécher ou de la burette
 *
 * @param {number} container: type du récipient 0 : bécher , 1 : burette
 * @returns {string} couleur
 * @public
 * @file dosage.js
 */
function getColor( container ) {
    if ( !isNumeric( container ) ) throw new TypeError( e.ERROR_NUM );

    function _getColorPH() {
        // Modification couleur du bécher
        if ( G.indic == null ) {
            return cts.COLOR_INIT;
        }
        var indic = labo.INDICATEURS[ G.indic ];

        // ajuste la couleur en fonction du pH et de l'indicateur coloré
        if ( G.titre.vol > 0 ) {
            const col = parseFloat( indic.values[ 0 ] );
            if ( G.ph < col - 0.5 ) return indic.values[ 1 ];
            else if ( G.ph > col + 0.5 ) return indic.values[ 3 ];
            else return indic.values[ 2 ];
        }
    }

    function _getColorOX() {
        // suivant le type de dosage (simple, retour ou ) on cherche la concentration du titré ou celle du réactif
        // on récupère l'indice du tableau 'vols' avec le volume théorique le plus proche du volume en cours

        var ind = new uArray( G.vols ).getArrayNearIndex( G.titrant.vol );
        var idTitle = [ 0, 0, 3, 7 ]; // indice de l'espèce titrée

        // récupère la concentration
        var concentration = G.concs[ ind ][ idTitle[ G.typeDetail ] ];

        // changement de couleur - On commence à modifier si la concentration est inférieure à 1/100 de la concentration initiale en mixant les couleurs.
        var indic = labo.INDICATEURS[ G.indic ];
        let firstColor, endColor;
        let currentColor = null;

        if ( G.indic == null || G.indic == undefined ) {
            firstColor = G.titre.color;
            endColor = G.colProduit.endColor;
            if ( hasKey( G.colProduit, "currentColor" ) ) currentColor = G.colProduit.currentColor;
        } else {
            firstColor = indic.values[ 1 ];
            currentColor = indic.values[ 2 ];
            endColor = indic.values[ 3 ];
        }

        if ( concentration > 0 ) {
            let initialConcentration = G.concs[ 0 ][ idTitle[ G.typeDetail ] ];
            if ( concentration < initialConcentration / 20 ) {
                var proportion = 1 - ( 20 * concentration ) / initialConcentration;

                if ( currentColor )
                    return mixColors( currentColor, endColor, 1 - proportion, proportion );
                else return mixColors( G.titre.color, endColor, 1 - proportion, proportion );
            } else {
                if ( currentColor ) return currentColor;
                else return firstColor;
            }
        } else {
            return endColor;
        }
    }

    if ( container == 0 ) {
        // si dosage pH
        if ( G.type == cts.TYPE_ACIDEBASE ) return _getColorPH();
        // dosage oxydo
        else if ( G.type == cts.TYPE_OXYDO ) return _getColorOX();
    }
}

/********************************************************** */

/** Affiche le message d'erreur
 *
 * @param {string} idButton ID du bouton
 * @returns void
 * @public
 * @file dosage.js
 */
function dspMessage( idButton ) {
    const data = {
        idmodal: "idModal",
        idcontainer: ES_DIV_INFO,
        labelbtclose: ES_BTCLOSE_LABEL,
        title: ES_MSG_INFO_ERR,
        actionbtclose: setClassMenu,
        idbtclose: idButton,
        msg: ERR_DOSAGE,
    };
    dspInfo( data );
}

export {
    createLab, updValues,vidage, getColor,setClassMenu,dspMessage,
    resetMesures,setDosageValues,setEvents,setEventsClick, updateLab
    ,initDosage
};