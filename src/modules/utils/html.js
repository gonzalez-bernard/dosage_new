/** HTML  
 * 
 * @module modules/utils/utilsHtml
 * @desc 
 * fonctions utiles à la création de pages html
 * ***
 * ***export getValue, getElt, getEltID, getValueID, setValue, setValueID***
*/

import { isString, isNumeric } from "./type.js"
import * as E from "./errors.js"

/** Lit la valeur d'un champ identifié par son ID
 * 
 * @param {String} id id du champ
 * @param {object} sym {string} : symbole à ajouter ex '#', type {string} : int, float ou str 
 * @returns {any}
 * @file 'modules/utils/html.js'
 */
function getValue(id, { sym = "", type = null } = {}) {

    if (!isString(id)) E.debugError(E.ERROR_STR)

    const s = $(sym + id).val()
    if (!type)
        return s
    else if (type == "int") {
        return parseInt(String(s))
    }
    else if (type == "float") {
        return parseFloat(String(s))
    }
    else if (type == "str") {
        return String(s)
    }
}

/** Retourne la valeur d'un champ identifié par son ID
 * 
 * @param {string} id ID du champ
 * @param {string|null} type 'int|float|string' 
 * @returns {any}
 * @file 'modules/utils/html.js'
 */
function getValueID(id, type = null) {
    if (!isString(id)) E.debugError(E.ERROR_STR)

    return getValue(id, { sym: "#", type: type })
}

/** Inscrit la valeur dans le champ
 * 
 * @param {string} id ID
 * @param {string|number} val valeur  
 * @returns {any}
 * @file 'modules/utils/html.js'
 */
function setValueID(id, val) {
    if (!isString(id)) E.debugError(E.ERROR_STR)
    if (!isString(val) && !isNumeric(val)) E.debugError(E.ERROR_STRNUM)

    return setValue(id, "#", val)
}

/** Inscrit la valeur dans le champ
 * 
 * @param {string} id ID
 * @param {string} sym symbole "#|."
 * @param {string|number} val valeur  
 * @returns {any}
 * @file 'modules/utils/html.js'
 */
function setValue(id, sym, val) {
    if (!isString(id) || !isString(sym)) E.debugError(E.ERROR_STR)
    if (sym !== "#" && sym !== ".") throw new RangeError(E.ERROR_RANGE)
    if (!isString(val) && !isNumeric(val)) E.debugError(E.ERRORTYPE)

    return $(sym + id).val(val)
}

/** Retourne l'élément JQuery
 * 
 * @param {String} id id ou expression
 * @param {object} sym {string} : symbole à ajouter ex '#', type {string} : int ou float 
 * @returns {JQuery}
 *@file 'modules/utils/html.js'
*/
function getElt(id, { sym = "", opt = null } = {}) {
    if (!isString(id)) E.debugError(E.ERROR_STR)

    if (!opt)
        return $(sym + id)
    else
        return $(sym + id + " " + opt)
}

/** Retourne l'élément JQuery identifié par id
 * 
 * @param {string} id 
 * @param {string|null} opt options de recherche
 * @return {JQuery}
 * @file 'modules/utils/html.js'
 */
function getEltID(id, opt = null) {
    if (!isString(id)) E.debugError(E.ERROR_STR)
    if (!isString(opt) && opt !== null) E.debugError(E.ERRORTYPE)

    let symbol = id.indexOf("#") == 0 ? "" : "#"
    return getElt(id, { sym: symbol, opt: opt })
}

export { getValue, getElt, getEltID, getValueID, setValue, setValueID }