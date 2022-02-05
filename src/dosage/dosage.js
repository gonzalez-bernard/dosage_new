/** dosage.js
 *
 * @module dosage
 * @description
 * - Initialise les composants du dosage et affiche la page
 * - Gère le vidage de la burette et les couleurs
 */

import {cts} from "../environnement/constantes.js";
import * as ui from "./ui/html_cts.js";

import * as labo from "./ui/interface.js";
import { Dosages, gDosages, gGraphs} from "../environnement/globals.js";
import { ES_BT_dspINFO_OX, MNU_ESPECES, ESPECES, ES_BT_dspINFO_AC } from "./../especes/html_cts.js"

// utils
import * as e from "../modules/utils/errors.js";
import { uArray } from "../modules/utils/array.js";
import { mixColors } from "../modules/utils/color.js";
import { getCircularReplacer, hasKey } from "../modules/utils/object.js";
import { isNumeric, isObject } from "../modules/utils/type.js";
import { getEltID, getElt } from "../modules/utils/html.js";
import { dspContextInfo, dspErrorMessage } from "../infos/infos.js";

// labo
import { initBecher } from "./ui/becher.js";
import { initTooltip } from "./ui/tooltip.js";
import { initBurette } from "./ui/burette.js";
import { initFlacon, set_drag } from "./ui/flacon.js";
import { initPhmetre } from "./ui/phmetre.js";
import { initConductimetre } from "./ui/conductimetre.js";
import { initPotentiometre } from "./ui/potentiometre.js";

import { setEvents, setEventsClick, reset } from "./dosage.events.js";
import { dspTabDosage, setButtonClass, setButtonState, initGraphMenu, dspGraphMenu } from "./dosage.ui.js";
import { dspTabEspeces } from "../especes/especes.ui.js";
import { resetMesures, setDosageValues, updValues, getDosage } from "./dosage.datas.js";
import { manageGraph, showGraph } from "./dosage.graph.js";
import { html } from "./ui/html.js";
import {ES_MSG_DOSAGE_ERR, ES_MSG_INFO_ERR } from "../especes/lang_fr.js";

/**
 * @typedef {import("../../types/classes").Dosage} Dosage
 * @typedef {import("../../types/types").tLab} tLab
 */

/** Met  à jour les informations du formulaire
 * 
 * - Lance la routine python et récupère les points des courbes 
 * - Initialise le dosage (Crée le graphe sans affichage)
 * @param {Dosages} DS global
 * @returns void
 * @use dosage.datas~getDosage, dosage.datas~setDosageValues
 * @use dosage.graph~manageGraph, dosage.graph~displayGraph
 * @use infos~dspErrorMessage
 * @use dialog.ui~initGraphMenu
 * @use especes.ui~dspTabEspeces, especes.ui~dspTabDosage
 * @use createLab
 * @file dosage.js
 */
async function initDosage(DS, canvas) {

    try {

        const G = DS.getCurrentDosage()
        const C = gGraphs[DS.idCurrentDosage]

        // Lance calcul dosage
        getDosage(G.type).then(function (data) {

            // si dosage impossible, data est une constante on affiche message d'erreur
            if (data == cts.ERR_DOSAGE_IMPOSSIBLE) {
                if (G.type == cts.TYPE_ACIDEBASE)
                    dspErrorMessage(ES_MSG_INFO_ERR,ES_MSG_DOSAGE_ERR,ES_BT_dspINFO_AC, {img:"../../static/resources/img/titration2.jpg"})
                else
                    dspErrorMessage(ES_MSG_INFO_ERR,ES_MSG_DOSAGE_ERR,ES_BT_dspINFO_OX, {img:"../../static/resources/img/titration2.jpg"})
            
            // Erreur système
            } else if (data == "Error_system"){
                console.log("Erreur systeme")
            }
            
            // Dosage réussi
            else {

                // initialise la constante dosage avec data
                setDosageValues(G, data)

                // modifie l'état
                G.setState(cts.ETAT_DOS, 1)

                // Affiche page
                getEltID(ui.DOSAGE).html(html);
                getElt(".title").html(G.title)
                initGraphMenu()

                // On bascule sur dosage
                dspTabEspeces(false)
                dspTabDosage(true)
                getEltID(MNU_ESPECES).removeClass('active')
                getEltID(ESPECES).removeClass('active show')

                /** Initialisation du dosage (dosage.js)  */
                createLab(DS)
                manageGraph()
                dspTabEspeces(false)
                dspTabDosage(true)
                getEltID(MNU_ESPECES).removeClass('active')
                getEltID(ESPECES).removeClass('active show')
                
                // Affichage
                showGraph()
                //createGraph()

                reset( false )
                G.setState( cts.ETAT_INDIC, -1 )
        
                // désactive les boutons
                setButtonClass( "" )
                set_drag( G.lab.flacons, true )
            }
        })
    }
    catch (err) {
        console.log(err)
    }
}

/** Initialise les composants du dosage
 *
 * Crée les instances des différents éléments du canvas et le canvas.
 * Définit les événements
 *
 * @access public
 * @param {Dosages} DS objet global
 *
 * @use Becher#remplir, Becher#setColor
 * @use Appareil#dispose
 * @use initBecher~initBecher, initPhmetre~initPhmetre
 * @use Graphx#setOptions
 * @use dosage.graph~defGraphPH, dosage.graph~defGraphCD, dosage.graph~defGraphPT
 *
 * @requires Graphx
 * @returns {Promise} Objet contenant les éléments du dosage
 * @file dosage.js
 */
async function createLab(DS) {

    const G = DS.getCurrentDosage()


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
        _lab.burette = initBurette(DS, _lab.canvas, _lab);
        _lab.phmetre = initPhmetre(_lab, G);
        _lab.conductimetre = initConductimetre(_lab, G);
        _lab.potentiometre = initPotentiometre(_lab, G);
        G.lab = _lab

    });

    if (isObject(G.lab)) {

        /** création des instances de graphes */
        // createGraph()
        
        // Modifie affichage pHmetre et graph
        G.lab.phmetre.setText(G.sph);

        //DS.idCurrentDosage += 1

        // définition des événements
        setEvents();

        // Affiche info
        dspContextInfo("init")
    } else {
        getEltID(ui.DOS_DIV_GRAPH).hide()
    }
}

/** fonction de vidage burette
 *
 * met à jour la burette et le bécher
 * met à jour le graphe et l'affichage du texte des phmetre et conductimètre
 *
 * @param {tLab} lab
 * @param {Dosages} DS
 * @returns void
 * @use dosage.datas~updValues
 * @use burette#vidange, becher#setColor
 * @use potentiometre#setText, conductimetre#setText, phmetre#setText
 * @use Graphx#changeData
 * @file dosage.js
 */
function vidage(lab, DS ) {

    const G = DS.getCurrentDosage()
    const C = gGraphs.currentChart

    // change état
    lab.burette.vidage = lab.burette.vidage == 0 ? 1 : 0;

    // vidage de la burette
    lab.burette.vidange(lab.burette.debit, lab.becher);

    // Mise à jour des valeurs
    if (!updValues(lab.burette)) return false;

    // Modifie la couleur du bécher en fonction du dosage
    lab.becher.setColor(getColor(0));

    const etat = G.getMask("etat", cts.ETAT_COND + cts.ETAT_PHMETRE + cts.ETAT_POT)
    switch (etat){
        case cts.ETAT_PHMETRE:
            lab.phmetre.setText(G.sph);
        
            // Active les boutons si volume titrant supérieur à 5 mL
            if (G.titrant.vol > cts.DOS_TITRANT_MIN) {
                setButtonState(false)
                dspGraphMenu(true)
            }
            break
        case cts.ETAT_POT:
            lab.potentiometre.setText(G.spot);
            break
        case cts.ETAT_COND:
            lab.conductimetre.setText(G.scond);
    }
    //actualise le graphe
    C.changeData(C.data);    
}

/** Récupère la couleur du bécher ou de la burette
 *
 * @param {number} container: type du récipient 0 : bécher , 1 : burette
 * @returns {string} couleur
 * @file dosage.js
 */
function getColor(container) {
    const G = gDosages.getCurrentDosage()
    if (!isNumeric(container)) throw new TypeError(e.ERROR_NUM);

    function _getColorPH() {
        let resp = ""

        const G = gDosages.getCurrentDosage()
        const indic = labo.INDICATEURS[G.indic];

        // Modification couleur du bécher
        if (G.indic == null) {
            resp = cts.COLOR_INIT;
        } else {
            // ajuste la couleur en fonction du pH et de l'indicateur coloré
            if (G.titre.vol > 0) {

                const col = parseFloat(indic.values[0]);
                if (G.ph < col - 0.5)
                    resp = indic.values[1];
                else if (G.ph > col + 0.5)
                    resp = indic.values[3];
                else
                    resp = indic.values[2];
            }
        }
        return resp
    }

    function _getColorOX() {

        // suivant le type de dosage (simple, retour ou ) on cherche la concentration du titré ou celle du réactif
        // on récupère l'indice du tableau 'vols' avec le volume théorique le plus proche du volume en cours
        const G = gDosages.getCurrentDosage()
        var ind = new uArray(G.vols).getArrayNearIndex(G.titrant.vol);
        var idTitle = [0, 0, 3, 7]; // indice de l'espèce titrée

        // récupère la concentration
        var concentration = G.concs[ind][idTitle[G.typeDetail]];

        // changement de couleur - On commence à modifier si la concentration est inférieure à 1/100 de la concentration initiale en mixant les couleurs.
        var indic = labo.INDICATEURS[G.indic];
        let firstColor, endColor;
        let currentColor = null;

        if (G.indic == null || G.indic == undefined) {
            firstColor = G.titre.color;
            endColor = G.colProduit.endColor;
            if (hasKey(G.colProduit, "currentColor")) currentColor = G.colProduit.currentColor;
        } else {
            firstColor = indic.values[1];
            currentColor = indic.values[2];
            endColor = indic.values[3];
        }

        if (concentration > 0) {
            let initialConcentration = G.concs[0][idTitle[G.typeDetail]];
            if (concentration < initialConcentration / 20) {
                var proportion = 1 - (20 * concentration) / initialConcentration;

                if (currentColor)
                    return mixColors(currentColor, endColor, 1 - proportion, proportion);
                else return mixColors(G.titre.color, endColor, 1 - proportion, proportion);
            } else {
                if (currentColor) return currentColor;
                else return firstColor;
            }
        } else {
            return endColor;
        }
    }

    let resp = ""
    if (container == 0) {
        
        // si dosage pH
        if (G.type == cts.TYPE_ACIDEBASE) 
            resp = _getColorPH();
        // dosage oxydo
        else if (G.type == cts.TYPE_OXYDO) 
            resp = _getColorOX();
    }
        
    return resp
}

export { createLab, updValues, vidage, getColor, resetMesures, setDosageValues, setEvents, setEventsClick, initDosage };