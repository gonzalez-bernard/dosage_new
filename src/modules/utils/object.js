/** OBJECT 
 * 
 * @module modules/utils/utilsObject
 * @description 
 * fonctions utiles gestion object
 * ***
 * ***export haskey***
 */

import { isObject, isString } from "./type.js"
import * as e from "./errors.js"

/** Fonction permettant d'enregsitrer un objet avec référence circulaire avec stringify
 *  Ex : JSON.stringify(objet, getCircularReplacer())
 * 
 */
const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
};

/** Initie les propriétés d'une classe à partir d'un objet
 * 
 * @param {object} o 
 * @returns {object}
 * @file 'modules/utils/object.js'
 */
function createClassByObject( o ) {

    let c = {}
    for ( let key in o ) {
        c[ key ] = o[ key ]
    }
    return c
}

/** Recherche présence de la clé dans l'objet
 * 
 * @param {object} obj Object à analyser
 * @param {string} key Clé à chercher
 * @param {boolean?} format si vrai on ne tient pas compte de la casee
 * @returns {boolean}
 * @file 'modules/utils/object.js'
 */
function hasKey( obj, key, format = false ) {
    if ( !isObject( obj ) ) throw new TypeError( e.ERROR_OBJ )
    if ( !isString( key ) ) throw new TypeError( e.ERROR_STR );
    if (format)
        key = key.toLowerCase()

    return Object.keys( obj ).indexOf( key ) !== -1
}

/** Met en minuscule toutes les propriétés
 * 
 * @param {object} obj objet 
 * @returns {object}
 * @file 'modules/utils/object.js'
 */
function propLower( obj ) {
    let e
    Object.keys( obj ).forEach( ( key ) => {
        e = key.toLowerCase()
        if ( key !== e )
            delete Object.assign( obj, {
                [ e ]: obj[ key ]
            } )[ key ];
    } );
    return obj
}

/** Remplace les valeurs des propriétés
 * 
 * @param {object} obj objet initial
 * @param {object} obj objet contenant les propriétés à modifier
 * @param {boolean} add indique si on doit ajouter les propriétés si absente dans objet initial
 * @returns {object}
 * @file 'modules/utils/object.js'
 */
function replace( obj, oChange, add = true ) {
    if ( add ) {
        Object.keys( oChange ).forEach( key => {
            obj[ key ] = oChange[ key ]
        } )
    } else {
        Object.keys( oChange ).forEach( key => {
            if ( hasKey( obj, key ) )
                obj[ key ] = oChange[ key ]
        } )
    }
    return obj
}

export { hasKey, propLower, replace, createClassByObject, getCircularReplacer }