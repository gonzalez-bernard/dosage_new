/** initBurette.js 
 * 
 * @module dosage/ui/initBurette
 * @description 
 * - Création burette
 * - Définition events
 * ***
 * ***export initBurette***
*/

import {cts} from"../../environnement/constantes.js";
import * as cBurette from "./classes/burette.js";
import { BURETTE } from "./interface.js"
import {vidage} from "../dosage.js";
import { isObject } from "../../modules/utils/type.js"
import { ERROR_OBJ } from "../../modules/utils/errors.js"

/**
 * @typedef {import ('../../../types/classes').Canvas} Canvas
 * @typedef {import ('../../../types/classes').Dosages} Dosages
 * @typedef {import ('../../../types/classes').Burette} Burette
 * @typedef {import ('../../../types/types').tLab} tLab 
 */

/** Crée une burette
 * 
 * Définit les events
 * 
 * @param {Canvas} canvas
 * @param {tLab} lab 
 * @param {Dosages} DS
 * @returns {Burette}
 * @public
 * @file initBurette.js
 */
function initBurette( DS, canvas, lab) {

    if ( !isObject(canvas) ) throw new TypeError(ERROR_OBJ)

    const G = DS.getCurrentDosage()

    // crée burette
    const burette = new cBurette.Burette( BURETTE, canvas );
    canvas.addChild( burette.fond );

    // Vidage de la burette
    /**
     * @event mousedown
     */
    burette.burette_f.bind( "mousedown", function() {
        if ( G.test('etat',cts.ETAT_ESPECES )) {
            // @ts-ignore
            vidage(lab, DS);
        }
    } );

    // fermeture burette
    burette.burette_o.bind( "mouseleave", function() {
        burette.leave( "burette_o" );
    } );

    burette.burette_f.bind( "mouseleave", function() {
        burette.leave( "burette_f" );
    } );

    // Fin vidage
    burette.burette_o.bind( "mouseup", function() {
        burette.leave( "burette_o" );
    } );

    // Zoom pour lecture burette
    burette.burette_f.bind( "mouseenter", function() {
        burette.showDetails();
    } );

    return burette
}

export { initBurette }