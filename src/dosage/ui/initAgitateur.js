/**
 * @module dosage/ui/initAgitateur
 * @description Crée un objet agitateur
 * ***
 * ***export initAgitateur***
 */

import * as cAgitateur from "./classes/agitateur.js";
import { isObject } from "../../modules/utils/type.js";
import * as e from "../../modules/utils/errors.js"
import { Agitateur } from "./classes/agitateur.js";

/**
 * Initie Agitateur
 * @param {import("../../../types/classes").Canvas} canvas Canvas
 * @param {import("../../../types/types").tAGITATEUR} sAgitateur
 * @returns {Agitateur}
 *
 * @file initAgitateur.js
 */
function initAgitateur( canvas, sAgitateur ) {
    if ( !isObject(canvas) )  throw new TypeError( e.ERROR_OBJ );

    const agitateur = new cAgitateur.Agitateur( sAgitateur, canvas );
    canvas.addChild( agitateur.sagitateur );
    return agitateur;
}

export { initAgitateur }