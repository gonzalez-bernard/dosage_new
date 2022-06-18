/** 
 * @module modules/utils/utilsNumber
 * @description 
 * Fonctions gestion des nombres
 * ***
 * ***export mathArrondir, roundDecimal, getDecimal, isInInterval***
 */

import { isBoolean, isNumeric, isUndefined } from "./type.js";
import * as e from "./errors.js"

/** Arrondit un nombre en tenant compte du nombre de chiffres
 * 
 * Si la partie entière a au moins autant de chiffres que precision on arrondit à l'entier
 * Sinon on garde un nombre de décimal égal à nombre de digits - precision
 * - M.roundDecimal(0,043,3) -> 0,04
 * - M.roundDecimal(0,045,3) -> 0,05
 * - M.roundDecimal(12,43,3) -> 12,4
 * - M.roundDecimal(12,43,5) -> 12,430
 * @param {number} nombre : nombre à arrondir
 * @param {number} precision : nombre de chiffres total
 * @return {string}
 * @file 'modules/utils/number.js'
 */
var mathArrondir = function (nombre, precision) {

    if (isNaN(nombre) || isNaN(precision)) throw new TypeError(e.ERROR_NUM)

    // transforme le nombre en chaine
    const  _nombre = nombre.toString()
    let nInteger = parseInt(_nombre).toString().length
    if (nInteger >= precision)
        return parseFloat(_nombre).toFixed(0)
    else
        return parseFloat(_nombre).toFixed(precision - nInteger)
}

/** Arrondit un nombre avec le nombre de décimales
 *  - ex : roundDecimal(0,0564,2) -> 0,06 
 *  - roundDecimal(0,0564,3) -> 0,056 
 *  - roundDecimal(0,0365,3) -> 0,037 
 * @param {number} nombre 
 * @param {number} precision
 * @return {number} nombre
 * @file 'modules/utils/math.js'
*/
function roundDecimal(nombre, precision = 2) {

    if (!isNumeric(nombre) || !isNumeric(precision)) throw new TypeError(e.ERROR_NUM)
    
    const tmp = Math.pow(10, precision);
    return Math.round(nombre * tmp) / tmp;
}

/** Calcule le décalage nécessaire pour qu'un nombre soit supérieur à 1
 * 
 * elle permet de définir la précision d'affichage
 * @param {number} valeur
 * @return {number} décalage
 * @file 'modules/utils/math.js'
*/
function getDecimal(valeur) {

    if (! isNumeric(valeur)) throw new TypeError(e.ERROR_NUM)

    let offset = 0
    if (valeur == 0)
        return 0
    while (valeur <= 1) {
        valeur *= 10
        offset++
    }
    return offset
}

/** Arrondit un nombre en tenant compte du nombre de chiffres significatifs
 * - M.roundPrecision(0,0565,4) -> 0,05650
 * - M.roundPrecision(0,0565,2) -> 0,057
 * - M.roundPrecision(12,345,4) -> 12,35
 * 
 * @param {number} valeur nombre à modifier
 * @param {number} precision nombre de chiffres significatifs
 * @returns 
 */
function roundPrecision(valeur, precision){
    const offset = getDecimal(valeur)
    return mathArrondir(valeur, precision + offset)
}

/** Arrondit au dixième supérieur
 * - ex: 0,23 sera arrondi à 0,3 - 2,6 -> 3,0
 * - On peut utiliser cette fonction pour calculer l'ordonnée maximum pratique pour graduer
 * @param {number} valeur valeur à arrondir 
 * @returns nombre arrondi 
 */
function around(valeur){
    let offset = getDecimal(valeur)
    let v = valeur*Math.pow(10, offset)
    return Math.ceil(v)*Math.pow(10, -offset)
}

/** Détecte si une valeur est comprise dans un intervalle
 * 
 * @param {number} value valeur à tester
 * @param {number} min valeur min
 * @param {number} max valeur max
 * @param {boolean} strict si true les extremes sont exclus
 * @returns {boolean}
 * @file 'modules/utils/math.js'
*/
const isInInterval = function (value, min, max, strict = true) {
    if (!isNumeric(value) || !isNumeric(min) || !isNumeric(max)) throw new TypeError(e.ERROR_NUM)
    if (!isBoolean(strict)) throw new TypeError(e.ERROR_BOOL)
    if (min >= max) throw new RangeError(e.ERROR_RANGE)

    if (strict)
        return value > min && value < max ? true : false
    else
        return value >= min && value <= max ? true : false
}

export { mathArrondir, roundDecimal, getDecimal, isInInterval, around, roundPrecision }