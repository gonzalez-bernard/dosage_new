/**
 * 
 * @module modules/utils/utilsType
 * @description
 * Gestion des types de données
 * ***
 * ***export isNumeric, isFloat, isInteger, isColor, isDefined, isUndefined, isString, isArray,isBoolean, isEvent, assert, isValidArgs, isStrNum, isObject, isPoint***
 */

/** Détecte si la chaine passée en arguments correspond à un code couleur CSS
 * 
 * #rvb, #rrvvbb, #rrvvbbaa, rgb(r,v,b), rgba(r,v,b,a) ou constante
 * @param {string} strColor 
 * @returns {boolean}
 * @file 'modules/utils/type.js'
 */
const isColor = function (strColor) {
  var s = new Option().style;
  strColor = strColor.toLowerCase();
  s.color = strColor;
  var test1 = s.color == strColor;
  var test2 = /^#([0-9a-f]{6}|[0-9a-f]{8})$/i.test(strColor);
  var test3 = /^rgba\(\d{1,3},\d{1,3},\d{1,3},[1,0]\.?\d*\)$/i.test(strColor)
  var test4 = /^rgb\(\d{1,3},\d{1,3},\d{1,3}\)$/i.test(strColor)
  return (test1 == true || test2 == true || test3 == true || test4 == true)
}

/** Détecte si un nombre est un réel
 * 
 * Attention si la partie décimale est nulle, la fonction renvoie false
 * @param {number} n 
 * @return {boolean}
 * @file 'modules/utils/type.js'
 */
const isFloat = function (n) {
  return Number(n) === n && n % 1 !== 0;
}

/** détecte si nombre entier */
const isInteger = function (n) {
  return !isNaN(n) && Number.isInteger(parseFloat(n));;
}

/** détecte si argument non défini
 * 
 * @param {any} arg 
 * @returns {boolean}
 * @file 'modules/utils/type.js'
 */
const isUndefined = function (arg) {
  return (typeof arg === 'undefined')
}

/** détecte si argument défini
 * 
 * @param {any} arg 
 * @returns {boolean}
 * @file 'modules/utils/type.js'
 */
const isDefined = function (arg) {
  return !(typeof arg === 'undefined')
}

/** détecte si argument chaîne
 * 
 * @param {any} arg 
 * @returns {boolean}
 * @file 'modules/utils/type.js'
 */
const isString = function (arg) {
  return (typeof arg === 'string')
}

const isMap = function (arg) {
  return (arg instanceof Map)
}

/** détecte si argument tableau
 * 
 * @param {any} arg 
 * @returns {boolean}
 * @file 'modules/utils/type.js'
 */
const isArray = function (arg) {
  return Array.isArray(arg)
}

/** Détecte si un nombre ou une chaine est numérique
* 
* @param {number | *} n - nombre
* @returns {boolean}
*/
const isNumeric = function (n) {
  if (!isInteger(n))
    return isFloat(n)
  return true
}

/** détecte si argument booléen
 * 
 * @param {any} arg 
 * @returns {boolean}
 * @file 'modules/utils/type.js'
 */
const isBoolean = function (arg) {
  return (typeof arg === 'boolean')
}

/** détecte si argument est un événement
 * 
 * @param {any} arg 
 * @returns {boolean}
 * @file 'modules/utils/type.js'
 */
const isEvent = function (arg) {
  const isObject = typeof arg === 'object'
  if (isObject && arg.hasOwnProperty('originalEvent'))
    return true
  return false;
}

/** détecte si argument est un objet
 * 
 * @param {any} arg 
 * @returns {boolean}
 * @file 'modules/utils/type.js'
 */
const isObject = function (arg) {
  if (arg === null) return false
  return (typeof arg === "object")
}

/** détecte si argument une chaîne ou  un nombre 
 * @param {any} arg 
 * @returns {boolean}
 * @file 'modules/utils/type.js'
 */
const isStrNum = function (arg) {
  if (isString(arg) || isNumeric(arg)) return true
  return false
}

/** détecte si argument est un point
 * 
 * @param {any} arg 
 * @returns {boolean}
 * @file 'modules/utils/type.js'
 */
const isPoint = function (arg) {
  if (!isObject(arg)) return false
  if (!arg.hasOwnProperty('x') || !arg.hasOwnProperty('y')) return false
  return true
}

/** détecte si argument est une fonction
 * 
 * @param {any} arg 
 * @returns {boolean}
 * @file 'modules/utils/type.js'
 */
const isFunction = function (arg) {
  return typeof arg === 'function'
}

/** Teste la validité des paramètres
 * 
 * Vérifie que les paramètres sont non nuls ou undefined
 * 
 * @param  {object[]} args liste des arguments à tester
 * [{'type': types possibles (voir ci-dessous) séparés par pipe,'arg': argument}, {...}, {...}]
 * types : ["undefined","object","boolean","number","string","symbol","function"]
 * ex: [{'type': "string|number", 'arg': toto},{...}]
 * @returns {boolean}
 * @file 'modules/utils/type.js'
 */
const isValidArgs = function (args) {
  let elt
  for (var k in args) {
    elt = args[k]
    // Analyse du type (on traite le cas ou on utilise le pipe pour le coix entre plusieurs types )
    let types = elt['type'].split('|')
    for (let key in types) {
      if (typeof elt['arg'] == types[key])
        return true
    }
    if (undefined === elt['arg'] || null === elt['arg'])
      return false;

  }
  return false;
}

/** Vérification validité paramètre
 * 
 * @param {boolean} condition   test  
 * @param {string} message message 
 * @file 'modules/utils/type.js'
*/
const assert = function (condition, message) {
  if (!condition)
    throw Error('Assert failed: ' + (message || ''));
};

/**
 * 
 * @param {any} arg variable à transformer
 * @param {string} type type à obtenir ex. "string", "int", "float"
 */
const parseType = function (arg, type) {
  switch (type) {
    case 'string':
      if (!isString(arg) && isNumeric(arg))
        return arg.toString();
      break;
    case 'int':
      if (isInteger(arg))
        return parseInt(arg);
      break;
    case 'float':
      if (isFloat(arg))
        return parseFloat(arg);
    default:
      return arg
  }
}

/**
 * 
 * @param {object} obj  objet contenant les propriétés à modifier 
 * @param {string[]} list liste des propriétés à traiter 
 * @param {string} type 
 */
const parseObjectType = function (obj, list, type) {
  for (const prop in obj) {
    if (list.includes(prop)) {
      obj[prop] = parseType(obj[prop], type)
    }
  }
}

export { isNumeric, isFloat, isInteger, isColor, isDefined, isUndefined, isString, isArray, isBoolean, isEvent, assert, isValidArgs, isStrNum, isObject, isPoint, isFunction, parseType, parseObjectType, isMap }