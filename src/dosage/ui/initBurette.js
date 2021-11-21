/** initBurette.js 
 * 
 * @module dosage/ui/initBurette
 * @description 
 * - Création burette
 * - Définition events
 * ***
 * ***export initBurette***
*/

import * as cts from "../../environnement/constantes.js";
import * as cBurette from "./classes/burette.js";
import { BURETTE } from "./interface.js"
import {G} from "../../environnement/globals.js";
import {vidage} from "../dosage.js";
import { isObject } from "../../modules/utils/type.js"
import { ERROR_OBJ } from "../../modules/utils/errors.js"


/** Crée une burette
 * 
 * Définit les events
 * 
 * @param {Canvas} canvas
 * @param {tLab} lab 
 * @param {Dosage} G
 * @returns {Burette}
 * @public
 * @file initBurette.js
 */
function initBurette( canvas, lab, G ) {

    if ( !isObject(canvas) ) throw new TypeError(ERROR_OBJ)

    // crée burette
    const burette = new cBurette.Burette( BURETTE, canvas );
    canvas.addChild( burette.fond );

    // Vidage de la burette
    /**
     * @event mousedown
     */
    burette.burette_f.bind( "mousedown", function() {
        if ( G.test('etat',cts.ETAT_ESPECES )) {
            vidage(lab, G);
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