/** 
 * @module modules/utils/utilsNumber
 * @description 
 * Fonctions gestion des nombres
 * ***
 * ***export mathArrondir, roundDecimal, getDecimal, isInInterval***
 */

import { isBoolean, isNumeric, isUndefined } from "./type.js";
import * as e from "./errors.js"

/** Arrondit un nombre en tenant compte du nombre de CS
 * 
 * Si la partie entière a au moins autant de chiffres que precision on arrondit à l'entier
 * Sinon on garde un nombre de décimal égal à nombre de digits - precision
 * @param {number} nombre : nombre à arrondir
 * @param {number} precision : nombre de chiffres significatifs
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

/** Arrondit un nombre avec le nombre de décimale
 * 
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

export { mathArrondir, roundDecimal, getDecimal, isInInterval }