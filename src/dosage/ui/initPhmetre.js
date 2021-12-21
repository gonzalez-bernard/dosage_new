/** initPhmetre.js 
 * 
 * @module dosage/ui/initPhmetre
 * @description 
 * - Crée le phmètre et définit les events
 * - Positionne et actualise l'afiichage
 * ***
 * ***export initPhmetre ***
*/

import * as cPHmetre from "./classes/phmetre.js";
import { PHMETRE } from "./interface.js"
import {cts} from"../../environnement/constantes.js";
import * as txt from "./lang_fr.js";
import { isObject } from "../../modules/utils/type.js";
import * as e from "../../modules/utils/errors.js";
import {updateGraph} from "../dosage.graph.js"
import { setButtonState, setButtonVisible } from "../dosage.ui.js";
import {updateAppareil} from "../../dosage/ui/initAppareil.js"

/**
 * @typedef {import('../../../types/types').tLab} tLab
 * @typedef {import('../../../types/classes').Dosage} Dosage
 * @typedef {import('../../../types/classes').Phmetre} Phmetre
 * @typedef {import('../../../types/classes').Becher} Becher
 * 
 */

/** Crée le Phmètre
 * 
 * Définit les events
 * 
 * @param {tLab} lab Labo
 * @param {Dosage} G 
 * @returns {Phmetre} Phmetre
 * @use updGraph, displayGraph
 * @public
 * @file initPhmetre.js
 */
function initPhmetre( lab, G ) {
    if (!isObject(lab.canvas) || !isObject(lab.tooltip) || !isObject(lab.becher)) throw new TypeError(e.ERROR_OBJ)

    // Crée phmetre
    var phmetre = new cPHmetre.Phmetre( PHMETRE, lab.canvas, cts.ETAT_PHMETRE, "" );
    lab.canvas.addChild( phmetre.fond );

    // survol pHmetre
    phmetre.fond.bind( "mouseenter", function( ) {
        if (G.type & cts.TYPE_ACIDEBASE){
            lab.canvas.mouse.cursor( "pointer" );
            lab.tooltip.dspText( txt.DO_PHMETRE );
        } else {
            lab.canvas.mouse.cursor( "not-allowed" );
        }
    });

    // Quitte survol pHmetre
    phmetre.fond.bind( "mouseleave", function( ) {
        lab.canvas.mouse.cursor( "default" );
        if (G.type & cts.TYPE_ACIDEBASE){
            lab.tooltip.dspText();
        } 
    } );

    /* Installe le pHmètre ou le positionne à sa place.
      Gère la création et l'affichage de la courbe */
    phmetre.fond.bind( "dblclick", function() {

        if (updateAppareil(phmetre, lab.becher)) {
            // met à jour le graphe
            //if ( G.test('etat',cts.ETAT_PHMETRE )) {  
                updateGraph(lab.canvas)
            //}

            // actualise les boutons
            setButtonVisible(true)
            setButtonState(true)
        }
    })

    return phmetre
}

export { initPhmetre }