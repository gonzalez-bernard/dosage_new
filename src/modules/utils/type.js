/**
 * 
 * @module modules/utils/utilsType
 * @description
 * Gestion des types de données
 * ***
 * ***export isNumeric, isFloat, isInteger, isColor, isDefined, isUndefined, isString, isArray,isBoolean, isEvent, assert, isValidArgs, isStrNum, isObject, isPoint***
 */ 

/** Détecte si la chaine passée en raguments correspond à un code couleur CSS
 * 
 * #rvb, #rrvvbb, #rrvvbbaa, rgb(r,v,b), rgba(r,v,b,a) ou constante
 * @param {string} strColor 
 * @returns {boolean}
 */
 const isColor = function( strColor ) {
  var s = new Option().style;
  strColor = strColor.toLowerCase();
  s.color = strColor;
  var test1 = s.color == strColor;
  var test2 = /^#([0-9a-f]{6}|[0-9a-f]{8})$/i.test( strColor );
  var test3 = /^rgba\(\d{1,3},\d{1,3},\d{1,3},[1,0]\.?\d*\)$/i.test( strColor )
  var test4 = /^rgb\(\d{1,3},\d{1,3},\d{1,3}\)$/i.test( strColor )
  return ( test1 == true || test2 == true || test3 == true || test4 == true )
}

/** Détecte si un nombre est un réel
 * 
 * Attention si la martie décimale est nulle, la fonction renvoie false
 * @param {number} n 
 * @return {boolean}
 */
const isFloat = function( n ) {
  return Number( n ) === n && n % 1 !== 0;
}

const isInteger = function( n ) {
  return !isNaN(n) && Number.isInteger(parseFloat(n));;
}

const isUndefined = function(arg){
  return (typeof arg === 'undefined' )
}

const isDefined = function (arg){
  return ! (typeof arg === 'undefined' )
}

const isString = function(arg){
  return (typeof arg === 'string')
}

const isArray = function(arg){
  return Array.isArray(arg)
}

/** Détecte si un nombre ou une chaine est numérique
* 
* @param {number | *} n - nombre
* @returns {boolean}
*/
const isNumeric = function( n ) {
  if ( !isInteger( n ) )
      return isFloat( n )
  return true
}

const isBoolean = function(arg){
  return (typeof arg === 'boolean' )
}

const isEvent = function(arg){
  const isObject = typeof arg  === 'object'
  if (isObject && arg.hasOwnProperty('originalEvent'))
    return true
  return false; 
}

const isObject = function(arg){
  return (typeof arg === "object")
}

const isStrNum = function(arg){
  if ( isString(arg) || !isNumeric(arg)) return true
  return false
}

const isPoint = function (arg){
  if (! isObject(arg)) return false
  if (!arg.hasOwnProperty('x') || !arg.hasOwnProperty('y')) return false
  return true
}

const isFunction = function(arg){
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
 */
const isValidArgs = function( args ) {
  let elt
  for ( var k in args ) {
      elt = args[ k ]
          // Analyse du type (on traite le cas ou on utilise le pipe pour le coix entre plusieurs types )
      let types = elt[ 'type' ].split( '|' )
      for ( let key in types ) {
          if ( typeof elt[ 'arg' ] == types[ key ] )
              return true
      }
      if ( undefined === elt[ 'arg' ] || null === elt[ 'arg' ] )
          return false;

  }
  return false;
}

/** Vérification validité paramètre
* 
* @param {boolean} condition   test  
* @param {string} message message 
*/
const assert = function( condition, message ) {
  if ( !condition )
      throw Error( 'Assert failed: ' + ( message || '' ) );
};


export {isNumeric, isFloat, isInteger, isColor, isDefined, isUndefined, isString, isArray,isBoolean, isEvent, assert, isValidArgs, isStrNum, isObject, isPoint, isFunction}