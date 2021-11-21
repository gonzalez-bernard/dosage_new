/** initPotentiometre.js 
 * @module dosage/ui/initPotentiometre
 * @description
 * - Crée l'objet Potentiometre
 * - Définit les events
 * ***
 * ***export initPotentiometre***
*/

import * as cPotentiometre from "./classes/potentiometre.js";
import { POTENTIOMETRE } from "./interface.js";
import * as cts from "../../environnement/constantes.js";
import * as txt from "./lang_fr.js";
import {G} from "../../environnement/globals.js";
import * as e from "../../modules/utils/errors.js";
import { isObject } from "../../modules/utils/type.js";
import { displayGraph, updateGraph } from "../dosage.graph.js"


/** Crée le potentiomètre
 *
 * Définit les events
 * @param {tLab} lab
 * @param {Dosage} G
 * @returns {Potentiometre} Conductimetre
 * @use updGraph, displayGraph
 * @public
 * @file initPotentiometre.js
 */
function initPotentiometre( lab, G ) {
    if (!isObject(lab.canvas) || !isObject(lab.tooltip) || !isObject(lab.becher)) throw new TypeError(e.ERROR_OBJ)

    // Crée potentiometre
    var potentiometre = new cPotentiometre.Potentiometre(
        POTENTIOMETRE,lab.canvas,cts.ETAT_POT,"V"
    );
    lab.canvas.addChild( potentiometre.fond );

    // survol potentiometre
    potentiometre.fond.bind( "mouseenter", function( e ) {
        if (G.type == cts.TYPE_OXYDO && G.test('mesure',4)){
            lab.canvas.mouse.cursor( "pointer" );
            lab.tooltip.dspText( txt.DO_POTENTIOMETRE );
        } else
            lab.canvas.mouse.cursor( "not-allowed" );
    } );

    // Quitte survol potentiometre
    potentiometre.fond.bind( "mouseleave", function( e ) {
        lab.canvas.mouse.cursor( "default" );
        lab.tooltip.dspText();
    } );

    /* Installe le potentiometre ou le positionne à sa place.
    Gère la création et l'affichage de la courbe */
    potentiometre.fond.bind( "dblclick", function() {
        if (G.test('etat',cts.ETAT_PHMETRE) || G.test('etat',cts.ETAT_COND))
            return
        if (G.type == cts.TYPE_OXYDO && G.test('mesure',4)) {
            if ( ! G.test('etat',cts.ETAT_ESPECES ) ) return false;

            // change l'état de branchement du potentiomètre
            G.setState(cts.ETAT_POT,-1)
    
            // Positionne le potentiomètre
            potentiometre.dispose( lab.becher, potentiometre.offsetX, potentiometre.offsetY );
            potentiometre.setText( G.spot);

            // met à jour le graphe
            updateGraph(lab.canvas)
                    
            // Affiche
            displayGraph()
        }
        
    } );

    return potentiometre;
}

export { initPotentiometre };