/**
 * @module dosage/ui/initAgitateur
 * @description Crée un objet agitateur
 * ***
 * ***export initAgitateur***
 */


import * as cAgitateur from "./classes/agitateur.js";
import { AGITATEUR } from "./interface.js"
import { isObject } from "../../modules/utils/type.js";
import * as e from "../../modules/utils/errors.js"


/** Initie Agitateur
 *
 * @param {Canvas} canvas Canvas
 * @param {tAGITATEUR} sAgitateur
 * @returns {Agitateur}
 * @public
 * @file initAgitateur.js
 */
function initAgitateur( canvas, sAgitateur ) {
    if ( !isObject(canvas) )  throw new TypeError( e.ERROR_OBJ );

    const agitateur = new cAgitateur.Agitateur( sAgitateur, canvas );
    canvas.addChild( agitateur.sagitateur );
    return agitateur;
}

export { initAgitateur }