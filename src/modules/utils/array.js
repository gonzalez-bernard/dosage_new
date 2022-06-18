/** 
 * @module modules/utils/utilsArray
 * @description 
 * - Gestion des tableaux
 * - Classe uArray
 * ***
 * ***export uArray***
  */

import { isNumeric, isUndefined, isString, isBoolean, isArray } from "./type.js"
import * as e from "./errors.js"


/**
 *  @class uArray
 */
class uArray extends Array {

    /**
     * 
     * @param {any[]} arr tableau
     */
    constructor(arr) {
        super()
        this.val = arr
    }

    /** Calcule le pas entre deux valeurs du tableau pour avoir le nombre d'intervalles souhaités
     * 
     * @param {Number} numInterval (int): nombre d'intervalles
     * @return {Number} (float) pas
     * @file 'modules/utils/array.js'
     */
    getInterval(numInterval) {
        if (! isNumeric(numInterval)) throw new TypeError(e.ERROR_NUM)
        if (numInterval <=0) throw new RangeError(e.ERROR_RANGE)

        return (Math.max(...this.val) - Math.min(...this.val)) / numInterval
    }

    /** Retourne la valeur extrémale d'un attribut numérique dans un tableau d'objets
    * 
    * ex : this.val = [{'attr1': val11, 'attr2':val12},{'attr1': val21, 'attr2':val22}]
    * x = get_arrayObject_extremum_value('attr1', 'max') 
    * @param {string} attr  : nom de l'attribut
    * @param {'max' | 'min'} mode  max | min
    * @return {number} valeur de 'attr1' maximale parmi les objects du tableau
    * @file 'modules/utils/array.js'
    */
    getArrayObjectExtremumValues(attr, mode) {

        if (!isString(attr) || attr == "" || !isString(mode)) throw new TypeError(e.ERROR_STR)
        if (mode !== "min" && mode != "max") throw new RangeError(e.ERROR_RANGE)
        
        if (mode == 'max')
            return Math.max(...this.val.map(o => o[attr]), 0);
        else
            return Math.min(...this.val.map(o => o[attr]), 0);
    }

    /** Recherche la valeur la plus proche d'un attribut dans un tableau d'objets trié
    * 
    * @param {string} attr  attribut de l'objet
    * @param {number} value valeur à chercher
    * @return {number} index
    * @file 'modules/utils/array.js'
    */
    getArrayObjectNearIndex(attr, value) {

        if (!isString(attr) || attr == "") throw new TypeError(e.ERROR_STR)
        if (!isNumeric(value)) throw new TypeError(e.ERROR_NUM)

        var i = 1
        var long = this.val.length;
        while (i < long-1 && value > this.val[i][attr]) {
            i++
        }
        var a = Math.abs(value - this.val[i][attr])
        var b = Math.abs(value - this.val[i - 1][attr])
        if (a == b) 
            return i-1 
        else
        return a > b ? i - 1 : i
    }

    /** Recherche la valeur la plus proche d'un élément dans un tableau
    * 
    * @param {number} value valeur à chercher
    * @param {number} sorted indique si le tableau est trié 1=trié, -1: trié inverse 2=trié après inversion 0: non trié  
    * @return {number} index
    * @file 'modules/utils/array.js'
    */
    getArrayNearIndex(value, sorted = 0) {

        if (!isNumeric(value) || !isNumeric(sorted)) throw new TypeError(e.ERROR_NUM)

        var len = this.val.length;
        var ecarts = []
        if (len == 0)
            return -1

        // tri inverse
        if (sorted == -1) {
            this.val = this.val.reverse() // on inverse le tableau pour une recherche normale
            sorted = 2
        }
        if (sorted == 1 || sorted == 2) {
            var a = 0
            var b = len
            var m, x, mini, maxi, result

            // recherche dichotomique
            while (true) {
                m = (a + b) / 2 >> 0
                x = a - b
                if (a == m && this.val[m] == value) {
                    return m
                }
                // si encadrement de la valeur cherchée
                if (Math.abs(x) == 1) {
                    mini = Math.max(0, m - 1) // nécessaire pour effet de bord
                    maxi = Math.min(len - 1, m + 1)

                    // on cherche les écarts
                    ecarts.push(Math.abs(this.val[mini] - value))
                    ecarts.push(Math.abs(this.val[m] - value))
                    ecarts.push(Math.abs(this.val[maxi] - value))

                    // On cherche l'écart minimal
                    let min = Math.min(...ecarts)

                    // On ajoute à l'indice courant m le décalage (-1,0 ou +1)
                    result = Math.max(0, Math.min(len - 1, m + ecarts.indexOf(min) - 1))

                    // inversion de l'index si tableau en tri inverse
                    return sorted == 2 ? len - result - 1 : result
                }
                // modification des bornes
                if (this.val[m] > value)
                    b = m
                else
                    a = m
            }
        }
        // tableau non trié
        else {

            // On cherche les écarts pour chaque élément
            for (var i = 0; i < len; i++) {
                ecarts.push(Math.abs(this.val[i] - value))
            }

            // On renvoie l'indice de celui qui a l'écart le plus faible.
            return ecarts.indexOf(Math.min(...ecarts))
        }
    }

    /** Supprime un élément d'un tableau
    * 
    * @param {any} elt élément que l'on veut supprimer
    * @param {boolean} copy - true on crée un nouveau tableau sinon on travaille sur le tableau initial
    * @return {array} tableau modifié
    * @file 'modules/utils/array.js'
    */
    delArrayElement(elt, copy = false) {

        if (isUndefined(elt)) throw new ReferenceError(e.ERROR_ABS)
        if (! isBoolean(copy)) throw new TypeError(e.ERROR_BOOL)


        let index = this.val.indexOf(elt);
        if (index == -1) throw new e.NotElementException()
        if (copy) {
            let ctab = [...this.val]
            this.array = ctab.slice(0,index).concat(ctab.slice(index+1));
        } else
            this.array = this.val.slice(0,index).concat(this.val.slice(index+1)); 
        return this.array
    }

    /** Recherche l'index de l'élément (objet) de tableau identifié par la clé et la valeur 
     * 
     * @param {string} key clé
     * @param {any} value valeur
     * @return {number} index ou -1 si échoue
     * @file 'modules/utils/array.js'
     */
    getIndexObjectValue(key, value){

        if ( !isString( key ) ) throw new TypeError( e.ERROR_STR )
        if ( isUndefined( value) ) throw new ReferenceError( e.ERROR_OBJ )
        
        for (const [index, o] of this.val.entries()) {
            if (o.hasOwnProperty(key) && o[key] == value)
                return index
        }
        return -1
    }

    /**
     * 
     * @param {*} condition 
     */
    getNumberElts(condition){}


    /** Extrapole pour trouver la valeur dans tab_y correpondante à x de tab_x 
     * 
     * @param {number} x valeur à chercher du tableau X
     * @param {number} indice de X ayant la valeur la plus proche
     * @param {number[]} tab_x  tableau des valeurs X    
     * @param {number[]} tab_y  tableau des valeurs Y    
     * @returns {number} la valeur de tab_y extrapolée 
     * @file 'modules/utils/array.js'
     */
    static extrapolate(x, indice, tab_x, tab_y ) {


    if (!isNumeric(x) || !isNumeric(indice)) throw new TypeError(e.ERROR_NUM)
    if (!isArray(tab_x) || !isArray(tab_y)) throw new TypeError(e.ERROR_ARRAY)

    if (x == tab_x[indice] || (x > tab_x[indice] && tab_x.length < indice + 2) || (indice == 0 && x < tab_x[indice]))
        return tab_y[indice]
    else if (x > tab_x[indice]) {
        return tab_y[indice] + (tab_y[indice + 1] - tab_y[indice]) * (x - tab_x[indice]) / (tab_x[indice + 1] - tab_x[indice])
    } else {
        return tab_y[indice] + (tab_y[indice] - tab_y[indice - 1]) * (x - tab_x[indice]) / (tab_x[indice] - tab_x[indice - 1])
    }
    }

    /** Convertit un tableau de nombres en chaines
     * 
     * @returns {string[]}
     * @file 'modules/utils/array.js'
     */
    int2str(){
        return this.val.map(e => e.toString())
    }

    /** Extrait les valeurs correspondante à la clé
     * 
     * @param {string} key clé
     * @return [] tableau avec les valeurs de array correspondante à la clé
     */
    extract(key){
        const l = this.val.length;
        const tab = []
        for(let i=0; i<l; i++){
            tab.push(this.val[i][key])
        }
        return tab
    }

}



export {uArray }