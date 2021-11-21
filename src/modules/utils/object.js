/** OBJECT 
 * 
 * @module modules/utils/utilsObject
 * @description 
 * fonctions utiles gestion object
 * ***
 * ***export haskey***
*/

import {isObject, isString} from "./type.js"
import * as e from "./errors.js"

/** Recherche présence de la clé dans l'objet
 * 
 * @param {object} obj Object à analyser
 * @param {string} key Clé à chercher
 * @returns {boolean}
 */
function hasKey( obj, key ) {
  if (!isObject(obj)) throw new TypeError( e.ERROR_OBJ )
  if (!isString(key)) throw new TypeError(e.ERROR_STR);

  return Object.keys( obj ).indexOf( key ) !== -1
}

/** Met en minuscule toutes les propriétés
 * 
 * @param {object} obj objet 
 */
function propLower(obj){
  let e
  Object.keys(obj).forEach((key) => {
    e = key.toLowerCase()
    if (key !== e)
      delete Object.assign(obj, {[e]: obj[key] })[key];
  });
  return obj
}

/** Remplace les valeurs des propriétés
 * 
 * @param {object} obj objet initial
 * @param {object} obj objet contenant les propriétés à modifier
 * @param {boolean} add indique si on doit ajouter les propriétés si absente dans objet initial
 */
function replace(obj, oChange, add = true){
  if (add){
    Object.keys(oChange).forEach(key =>{
      obj[key] = oChange[key]
    })
  } else {
    Object.keys(oChange).forEach(key =>{
      if (hasKey(obj, key))
        obj[key] = oChange[key]
    })
  }
  return obj
}

export {hasKey, propLower, replace}