/** COLORS 
 * 
 * @module modules/utils/utilsColor
 * @description 
 * Gestion de la couleur
 * ***
 * ***export mixColors, StringColorToValues, rgbToHex, valuesToRgba***
*/

import { isColor, isString, isInteger } from "./type.js"
import * as e from "./errors.js"

/** Calcule la couleur obtenue par mixage de deux couleurs
 *
 * @param {String} col1 couleur 1 hexa
 * @param {String} col2 couleur 2 
 * @param {Number} val1 pourcentage de couleur 1 (entre 0 et 1)
 * @param {Number} val1 pourcentage de couleur 2 (entre 0 et 1)
 * 
 * @return {String} couleur mixée
 */
function mixColors(col1, col2, val1, val2) {

    // on teste la validité des paramètres
    if (!isColor(col1) || !isColor(col2)) throw new TypeError(e.ERROR_STR)
    if (isNaN(val1) || isNaN(val2)) throw new TypeError(e.ERROR_NUM)
    if (val1 < 0 || val1 > 1 || val2 < 0 || val2 > 1) throw new RangeError(e.ERROR_RANGE)

    // Cas où val1 + val2 = 1, on ne prend pas la moyenne
    var div = val1 + val2 == 1 ? 1 : 2

    // Récupère les valeurs
    var c1 = StringColorToValues(col1)
    var c2 = StringColorToValues(col2)

    // On mixe les couleurs
    var r = (val1 * c1.r + val2 * c2.r) / div
    var g = (val1 * c1.g + val2 * c2.g) / div
    var b = (val1 * c1.b + val2 * c2.b) / div
    var a = (val1 * c1.a + val2 * c2.a) / div

    // renvoie
    return valuesToRgba(r, g, b, a)
}

/** Convertit une couleur hexadécimale en rgb
* 
* @param {String} str couleur en hexadécimal de type RRGGBB ou RRGGBBAA   
* @returns {Object} avec les valeurs pour r,g,b et a
*/
function StringColorToValues(str) {

    if (!isString(str)) throw new TypeError(e.ERROR_STR)

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(str);
    if (result) {
        result[4] = result[4] === undefined ? "ff" : result[4]
        return {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
            a: parseInt(result[4], 16) / 255,
        }
    } else {
        result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(str);
        if (result) {
            return {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
                a: 1,
            }
        } else {
            result = /^rgba?\((\d{1,3}),(\d{1,3}),(\d{1,3}),?(\d?.?\d?)\)$/i.exec(str)
            if (result) {
                return {
                    r: parseInt(result[1]),
                    g: parseInt(result[2]),
                    b: parseInt(result[3]),
                    a: parseFloat(result[4]),
                }
            } else
                return null
        }
    }
}

/** Transforme 3 valeurs numériques en couleur hexadécimale 
* @param {Number} r rouge (entre 0 et 255)
* @param {Number} g vert
* @param {Number} b bleu
* @returns {String} couleur en hexa
*/
function rgbToHex(r, g, b) {

    if (isNaN(r) || isNaN(g) || isNaN(b) ) throw new TypeError(e.ERROR_NUM)
    if (r<0 || r>255 || g<0 || g>255 || b<0 || b>255) throw new RangeError(e.ERROR_RANGE)

    r = Math.round(r)
    g = Math.round(g)
    b = Math.round(b)
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/** Transforme 4 valeurs numériques en couleur rgba 
* 
* @param {Number} r rouge (entre 0 et 255)
* @param {Number} g vert
* @param {Number} b bleu
* @patam {Number} a transparence
* @returns {String} couleur en hexa
*/
function valuesToRgba(r, g, b, a) {

    if (isNaN(r) || isNaN(g) || isNaN(b) ) throw new TypeError(e.ERROR_NUM)
    if (r<0 || r>255 || g<0 || g>255 || b<0 || b>255) throw new RangeError(e.ERROR_RANGE)
    
    r = Math.round(r)
    g = Math.round(g)
    b = Math.round(b)
    return "rgba(" + r + "," + g + "," + b + "," + a + ")"
}

export { mixColors, StringColorToValues, rgbToHex, valuesToRgba }

