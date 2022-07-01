import { isString, isUndefined } from "./type.js";
import * as E from "./errors.js"

/** Retourne le nom du fichier
 * 
 * @param {string} str chemin complet du fichier
 * @returns string
 * @file 'modules/utils/file.js'
 */
const getFileName = function (str) {
    if (!isString(str)) E.debugError(E.ERROR_STR)
    if (isUndefined(str)) throw new ReferenceError(E.ERROR_ABS)

    // @ts-ignore
    return str.split('\\').pop().split('/').pop();
}

/** Retourne le chemin complet
 * 
 * @param {string} str url fichier
 * @returns 
 */
const getDirName = function (str) {
    if (!isString(str)) E.debugError(E.ERROR_STR)
    if (isUndefined(str)) throw new ReferenceError(E.ERROR_ABS)

    return str.match(/.*\//);
}

export { getFileName, getDirName }