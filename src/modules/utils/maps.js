import { isArray, isMap } from "./type.js"
import * as E from "./errors.js"
import { DEBUG } from "../../environnement/globals.js"

/**
 * 
 * @param {Map} map map
 * @param {any} value valeur à chercher
 * @returns 
 */
function getKeyFromValue(map, value) {
  if (!isMap(map)) E.debugError(E.ERROR_PRM)

  // @ts-ignore
  const o = [...map].find(([, val]) => val == value)
  if (o && isArray(o))
    return o[0]
  else {
    E.debugInformation(E.ERROR_RETURN)
  }
}

/**
 * 
 * @param {Map} map map
 * @param {string} prop une propriété de valeur
 * @param {any} value valeur de la propriété
 * @returns 
 */
function getKeyFromPropertyValue(map, prop, value) {
  if (!isMap(map)) E.debugError(E.ERROR_PRM)

  // @ts-ignore
  const o = [...map].find(([, val]) => val[prop] == value)
  if (o && isArray(o))
    return o[0]
  else {
    E.debugInformation(E.ERROR_RETURN)
  }
}

export { getKeyFromValue, getKeyFromPropertyValue }