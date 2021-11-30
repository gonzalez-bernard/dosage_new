/** initBecher.js 
 * 
 * @module dosage/ui/initBecher
 * @description 
 * - Création bécher
 * - définition events
 * ***
 * ***export initBecher***
*/

import * as cBecher from "./classes/becher.js";
import { isObject } from "../../modules/utils/type.js";
import { ERROR_OBJ } from "../../modules/utils/errors.js"; 
import { getColor } from "../dosage.js";

/**
 * @typedef {import ('../../../types/classes').Canvas} Canvas
 * @typedef {import ('../../../types/classes').Becher} Becher
 * @typedef {import ('../../../types/classes').Dosage} Dosage
 * @typedef {import ('../../../types/types').tBECHER} tBECHER
 */

/** Initialise bécher
 * 
 * Crée le bécher, le remplit et l'ajoute au canvas
 * Définit les évents
 * @param {Dosage} G
 * @param {Canvas} canvas 
 * @param {tBECHER} sBECHER
 * @returns {Becher} Becher
 * @public
 * @file initBecher.js
 */
function initBecher( G, canvas, sBECHER ) {

    if ( !isObject(canvas) ) throw ERROR_OBJ

    // création becher
    const becher = new cBecher.Becher( sBECHER, canvas );

    // ajoute fond au canvas
    canvas.addChild( becher.fond );

    // remplissage et colorise
    becher.remplir( 0, G.solution.vol, 0 );
    becher.setColor( getColor(0) );

    // EVENTS

    // Affiche zoom
    becher.fond.bind( "mouseenter", function() {
        becher.showDetail( 1 );
    } );
    becher.fond.bind( "mouseleave", function() {
        becher.showDetail( 0 );
    } );

    return becher;
}

export { initBecher }