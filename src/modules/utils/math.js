/**  
 * @module modules/utils/utilsMath
 * @description 
 * Fonctions de calculs
 * ***
 * ***export calcDistanceOrtho, calcDistance2Pts, getMedium, getCoordsTangente***
*/

import {hasKey} from "./object.js"
import * as e from "./errors.js"
import {isArray, isNumeric, isObject} from "./type.js"

/**
 * @typedef {import ("../../../types/types").tPoint} tPoint 
 */

/** Calcule la distance entre 2 points
 * 
 * @param {tPoint} p1 point N°1   
 * @param {tPoint} p2 point N°2
 * @throws {error}
 * @returns {number} distance
 * @file 'modules/utils/math.js'
 */
function calcDistance2Pts( p1, p2, factor = 1 ) {
    if ( !isObject(p1) || !isObject(p2) ) throw new TypeError(e.ERROR_OBJ)
    if (!hasKey( p1, 'x' ) || !hasKey( p1, 'y' ) ) throw new e.NotElementException()
    if (!hasKey( p2, 'x' ) || !hasKey( p2, 'y' ) ) throw new e.NotElementException()

    return Math.sqrt( Math.pow( factor*(p2.y - p1.y), 2 ) + Math.pow( p2.x - p1.x, 2 ) )
}

/** Calcul des distances entre points
 *
 * Calcule la distance entre la droite formée par p1 et p2 et le point p
 * @param {tPoint} p1
 * @param {tPoint} p2
 * @param {tPoint} p
 * @returns {number} distance
 * @file 'modules/utils/math.js'
 */
 function calcDistanceOrtho( p1, p2, p ) {
    if ( !isObject(p1) || !isObject(p2) || !isObject(p)) throw new TypeError(e.ERROR_OBJ)

    var a = Math.pow( p1.x - p.x, 2 ) + Math.pow( p1.y - p.y, 2 );
    var b = Math.pow( p2.x - p.x, 2 ) + Math.pow( p2.y - p.y, 2 );
    var c = Math.pow( p1.x - p2.x, 2 ) + Math.pow( p1.y - p2.y, 2 );
    var d = Math.sqrt( a - Math.pow( a + c - b, 2 ) / ( 4 * c ) );
    return d;
}

/** Calcule le point milieu
 * 
 * @param {tPoint} p1 premier point 
 * @param {tPoint} p2 second point
 * @returns {tPoint} Point milieu
 * @file 'modules/utils/math.js'
 */
function getMedium( p1, p2 ) {
    if ( !isObject(p1) || !isObject(p2) ) throw new TypeError(e.ERROR_OBJ)
    if (!hasKey( p1, 'x' ) || !hasKey( p1, 'y' ) ) throw new e.NotElementException()
    if (!hasKey( p2, 'x' ) || !hasKey( p2, 'y' ) ) throw new e.NotElementException()
    
    return ( {
        'x': ( p1.x + p2.x ) / 2,
        'y': ( p1.y + p2.y ) / 2
    } )
}

/** Calcule les coordonnées de la tangente en tenant compte de limites
 * 
 * @param {tPoint} point point initial
 * @param {number[]} xlim tableau des valeurs limites sur x
 * @param {number[]} ylim idem
 * @param {number} pente donc arctan(angle)
 * @param {number} dep incrément (default = 0.1)
 * @returns {tPoint[]} tableau des points, le point initial étant celui d'indice 1
 * @file 'modules/utils/math.js'
 */
 function getCoordsTangente(point, xlim, ylim, pente, dep = 0.1){
    if ( !isObject(point) ) throw new TypeError(e.ERROR_OBJ)
    if (!hasKey( point, 'x' ) || !hasKey( point, 'y' ) ) throw new e.NotElementException()
    if (!isArray(xlim) || !isArray(ylim)) throw new TypeError(e.ERROR_ARRAY)
    if (!isNumeric(pente) || !isNumeric(dep)) throw new TypeError(e.ERROR_NUM)
    

    let x =  point.x
    let y = point.y
    let xc, yc
    let pts = []
    do {
        yc = y
        xc = x
        x = Math.min(xlim[1], x+dep)
        y = point.y + (x - point.x)*pente
        
    } while(y<ylim[1] && xc < x)
    pts.push({'x':xc, 'y': yc})
    pts.push(point)
    x = point.x
    y = point.y
    do {
        yc = y
        xc = x
        x = Math.max(xlim[0], x-dep)
        y = point.y + (x - point.x)*pente
        
    } while(y > ylim[0] && xc > x)
    pts.push({'x':xc, 'y': yc})

    return pts
}

export {calcDistanceOrtho, calcDistance2Pts, getMedium, getCoordsTangente}