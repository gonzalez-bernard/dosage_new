/** OBJECT 
 * 
 * @module modules/utils/utilsObject
 * @description 
 * fonctions utiles gestion object
 * ***
 * ***export haskey***
 */

import { isArray, isObject, isString, isBoolean } from "./type.js"
import * as e from "./errors.js"

const INVALID_KEY = "Clé absente dans l'objet"

/** Fonction permettant d'enregistrer un objet avec référence circulaire avec stringify
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

/** Détecte si un objet est vide
 * 
 * @param {Object} o 
 * @returns 
 */
const isEmpty = (o) => {
    return Object.keys(o).length == 0 && o.constructor === Object
}

/** Initie les propriétés d'une classe à partir d'un objet
 * 
 * @param {object} obj
 * @returns {object}
 * @file 'modules/utils/object.js'
 */
function createClassByObject(obj) {
    if (!isObject(obj)) throw new TypeError(e.ERROR_OBJ)

    let c = {}
    for (let key in obj) {
        c[key] = obj[key]
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
function hasKey(obj, key, format = false) {
    if (!isObject(obj)) throw new TypeError(e.ERROR_OBJ)
    if (!isString(key)) throw new TypeError(e.ERROR_STR);
    if (format)
        key = key.toLowerCase()

    return Object.keys(obj).indexOf(key) !== -1
}

/** Met en minuscule toutes les propriétés
 * 
 * @param {object} obj objet 
 * @returns {object}
 * @file 'modules/utils/object.js'
 */
function propLower(obj) {
    if (!isObject(obj)) throw new TypeError(e.ERROR_OBJ)

    let elt
    Object.keys(obj).forEach((key) => {
        elt = key.toLowerCase()
        if (key !== elt)
            delete Object.assign(obj, { [elt]: obj[key] })[key];
    });
    return obj
}

/** Remplace les valeurs des propriétés
 * 
 * @param {{}} obj objet initial
 * @param {{}} oChange objet contenant les propriétés à modifier
 * @param {boolean} add indique si on doit ajouter les propriétés si absente dans objet initial
 * @returns {object}
 * @file 'modules/utils/object.js'
 */
function replace(obj, oChange, path = '', add = true) {
    if (!isObject(obj) || !isObject(oChange)) throw new TypeError(e.ERROR_OBJ)
    if (!isBoolean(add)) throw new TypeError(e.ERROR_BOOL)

    let o = obj

    // positionne sur le dossier défini par path
    if (path != '') {
        const paths = path.split('/')
        paths.forEach(p => {
            if (hasKey(o, p))
                o = o[p]
            else if (add) {
                o[p] = {}
                o = o[p]
            }

            else return false
        })
    }

    if (add) {
        Object.keys(oChange).forEach(key => {
            o[key] = oChange[key]
        })
    } else {
        Object.keys(oChange).forEach(key => {
            if (hasKey(obj, key))
                o[key] = oChange[key]
        })
    }
    return obj
}

/** Supprime un item dans un objet
 * Seul le premier item rencontré est supprimé 
 * @param {string} keys séquence du parcours de l'arbre séparé par '/' ex: "personel/user/name" 
 * @param {{}} obj objet sur lequel s'effectue la recherche
 * @returns {boolean} true si la suppression est réalisée
 */
function removeItem(keys, obj) {
    if (!isString(keys)) throw new TypeError(e.ERROR_STR)
    if (!isObject(obj)) throw new TypeError(e.ERROR_OBJ)

    const result = _search("r", keys.split("/"), obj, 0)
    if (!result) {
        throw new e.serverError(new Error(INVALID_KEY))
    }
    return result
}

/** Met à jour un item dans un objet
 * Seul le premier item rencontré est modifié
 * ATTENTION : L'objet doit posséder les propriétés définies dans keys
 * 
 * @param {string} keys séquence du parcours de l'arbre séparé par '/' ex: "personel/user/name" 
 * @param {{}} obj objet sur lequel s'effectue la recherche
 * @param {any} value valeur de remplacement 
 * @returns {boolean} true si la mise à jour est réalisée
 */
function updateItem(keys, obj, value) {
    if (!isString(keys)) throw new TypeError(e.ERROR_STR)
    if (!isObject(obj)) throw new TypeError(e.ERROR_OBJ)

    const result = _search("u", keys.split("/"), obj, 0, value)
    if (!result) {
        throw new e.serverError(new Error(INVALID_KEY))
    }

    return result
}

/** Retourne la valeur d'un item dans un objet
 * Seul le premier item rencontré est retourné 
 * 
 * @param {string} keys séquence du parcours de l'arbre séparé par '/' ex: "personel/user/name" 
 * @param {{}} obj objet sur lequel s'effectue la recherche
 * @returns {any} la valeur de l'item ou undefined
 */
function getItem(keys, obj) {
    if (!isString(keys)) throw new TypeError(e.ERROR_STR)
    if (!isObject(obj)) throw new TypeError(e.ERROR_OBJ)

    const result = _search("g", keys.split("/"), obj, 0)
    if (!result) {
        throw new e.serverError(new Error(INVALID_KEY))
    }
    return result
}

/** Effectue une copie (clone)
 * 
 * @param {object} obj 
 * @returns {object}
 */
function copyDeep(obj) {
    if (!isObject(obj)) throw new TypeError(e.ERROR_OBJ)

    const deepCopy = JSON.parse(JSON.stringify(obj));

    // Une petite récursivité 
    function deepProto(obj, deepCopy) {
        deepCopy.__proto__ = Object.create(obj.constructor.prototype);
        for (var attribute in obj) {
            if (typeof obj[attribute] === 'object' && obj[attribute] !== null) {
                deepProto(obj[attribute], deepCopy[attribute]);
            }
        }
    }
    deepProto(obj, deepCopy);

    return deepCopy;
}

function createObjectFromString(path, value) {
    let o = {}
    let keys = path.split("/")
    _createObj(o, keys, value)
    return o

    function _createObj(o, keys, value) {
        if (keys.length == 1) {
            o[keys[0]] = value
            return o
        }
        o[keys[0]] = {}
        return _createObj(o[keys[0]], keys.slice(1), value)
    }
    
}


/**
 * 
 * @param {string} type indique le type d'opération à effectuer ('r': remove, 'u': update, 'g': get) 
 * @param {string[]} keys séquence du parcours de l'arbre sous forme de tableau
 * @param {{}} obj objet sur lequel s'effectue la recherche
 * @param {any} k valeur en cours
 * @returns {any} dépend du type d'opération 
 * */
function _search(type, keys, obj, k = 0, value = undefined) {
    if (!isString(type)) throw new TypeError(e.ERROR_STR)
    type = type.toLowerCase()

    if (!(['r', "u", 'g'].includes(type))) throw new TypeError(e.ERROR_STR)
    if (!isArray(keys)) throw new TypeError(e.ERROR_ARRAY)
    if (!isObject(obj)) throw new TypeError(e.ERROR_OBJ)

    // récupère clés de 'obj'
    let props = Object.keys(obj)

    // la clé existe dans objet
    if (props.indexOf(keys[0]) != -1) {
        let k = keys[0]
        // si clé unique
        if (keys.length == 1) {
            switch (type.toLowerCase()) {
                case 'r':
                    delete obj[k]
                    return true
                case 'u':
                    obj[k] = value
                    return true
                case 'g':
                    return obj[k]
            }
        }
        // si clé multiple on pass au suivant
        let x = _search(type, keys.slice(1), obj[k], keys[0], value)
        if (type == 'd' || type == 'u')
            return x == true ? true : false
        else
            return x
    } else {
        for (let o in obj) {
            let x = _search(type, keys, obj[o], 0, value)
            if (x) {
                if (type == 'd' || type == 'u')
                    return x == true ? true : false
                else
                    return x
            }
        }
    }
}

export { hasKey, propLower, replace, createClassByObject, getCircularReplacer, removeItem, updateItem, getItem, copyDeep, isEmpty, createObjectFromString }