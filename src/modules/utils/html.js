/** HTML  
 * 
 * @module modules/utils/utilsHtml
 * @desc 
 * fonctions utiles à la création de pages html
 * ***
 * ***export getValue, getElt, getEltID, getValueID, setValue, setValueID***
*/

import { isString, isNumeric } from "./type.js"
import * as e from "./errors.js"

/** Lit la valeur d'un champ identifié par son ID
 * 
 * @param {String} id id du champ
 * @param {object} sym {string} : symbole à ajouter ex '#', type {string} : int, float ou str 
 * @returns {any}
 * @file 'modules/utils/html.js'
 */
function getValue(id, { sym = "", type = null } = {}) {

    if (!isString(id)) throw new TypeError(e.ERROR_STR)

    if (!type)
        return $(sym + id).val()
    else if (type == "int") {
        return parseInt(String($(sym + id).val()))
    }
    else if (type == "float") {
        return parseFloat(String($(sym + id).val()))
    }
    else if (type == "str") {
        return String($(sym + id).val())
    }
}

/** Retourne la valeur d'un champ identifié par son ID
 * 
 * @param {string} id ID du champ
 * @param {string} type 'int|float|string' 
 * @returns {any}
 * @file 'modules/utils/html.js'
 */
function getValueID(id, type = null) {
    if (!isString(id)) throw new TypeError(e.ERROR_STR)
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
    if (!isString(id) || !isString(sym)) throw new TypeError(e.ERROR_STR)
    if (sym !== "#" && sym !== ".") throw new RangeError(e.ERROR_RANGE)
    if (!isString(val) && !isNumeric(val)) throw new TypeError(e.ERRORTYPE)

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
    if (!isString(id)) throw new TypeError(e.ERROR_STR)
    if (!opt)
        return $(sym + id)
    else
        return $(sym + id + " " + opt)
}

/** Retourne l'élément JQuery identifié par id
 * 
 * @param {string} id 
 * @param {string} opt options de recherche
 * @return {JQuery}
 * @file 'modules/utils/html.js'
 */
function getEltID(id, opt = null) {
    let symbol = id.indexOf("#") == 0 ? "" : "#"
    return getElt(id, { sym: symbol, opt: opt })
}

export { getValue, getElt, getEltID, getValueID, setValue, setValueID }