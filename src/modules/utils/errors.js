/**
 * @module modules/utils/utilsErrors
 * @description 
 * -Gestion des erreurs
 * -class NotElementException
 * ***
 * ***export NotElementException***
 */

const ERRORTYPE = "Mauvais type de paramètre"
const ERROR_STR = "Une chaine de caractère est attendue"
const ERROR_NUM = "Un nombre est attendu"
const ERROR_RANGE = "Le paramètre n'est pas dans l'intervalle"
const ERROR_ABS = "Le paramètre est absent ou non défini"
const ERROR_BOOL = "Un booléen est attendu"
const ERROR_ARRAY = "Un tableau est attendu"
const ERROR_OBJ = "Un objet est attendu"
const ERROR_EVT = "Un événement est attendu"
const ERROR_STRNUM = "Un nombre ou une chaine est attendue"
const ERROR_ELT = "Le paramètre n'est pas un élément de l'objet"
const ERROR_COLOR = "Le paramètre n'est pas une chaine transposable en couleur"
const ERROR_PRM = "Les paramètres fournis ne sont pas conformes"
const ERROR_RETURN = "Erreur au retour de fonction"

/**
 * @class NotElementException
 * @param {string} msg message
 * @property {string} name
 */
class NotElementException extends Error {
  constructor(msg = "Un paramètre fourni n'est pas présent dans une structure"){
    super(msg)
    this.name = "NotElementException"
  } 
}

export {ERRORTYPE, ERROR_STR, ERROR_ABS, ERROR_BOOL, ERROR_NUM, ERROR_RANGE, ERROR_OBJ, ERROR_ARRAY, ERROR_EVT, ERROR_STRNUM, NotElementException, ERROR_ELT, ERROR_COLOR, ERROR_PRM, ERROR_RETURN}