import { isString, isUndefined } from "./type.js";
import * as e from "./errors.js"

/** Retourne le nom du fichier
 * 
 * @param {string} str chemin complet du fichier
 * @returns string
 * @file 'modules/utils/file.js'
 */
const getFileName = function (str) {
    if ( !isString( str ) ) throw new TypeError( e.ERROR_STR )
    if (isUndefined(str)) throw new ReferenceError(e.ERROR_ABS)
    
    // @ts-ignore
    return str.split('\\').pop().split('/').pop();
}

/** Retourne le chemin complet
 * 
 * @param {string} str url fichier
 * @returns 
 */
const getDirName = function (str){
    if ( !isString( str ) ) throw new TypeError( e.ERROR_STR )
    if (isUndefined(str)) throw new ReferenceError(e.ERROR_ABS)
    
    return str.match(/.*\//);
}

export {getFileName, getDirName}