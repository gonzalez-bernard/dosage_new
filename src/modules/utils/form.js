/** FORMS 
 * 
 * @module modules/utils/utilsForm
 * @description 
 * Fonctions utiles pour les formulaires
 * ***
 * ***export formSetFeedback, formSetOptions, formValidButtons
 */

import { isEvent, isString, isArray, isUndefined, isFunction, isDefined } from "./type.js"
import * as E from "./errors.js"
import { getEltID } from "./html.js"

/** Affiche le message de feedback
 * @typedef {import("../../../types/interfaces").iFrmData} iFrmData
 * //@param {event|iFrmData} event : permet de cibler l'objet objet.data contient les informations
 * data.feedback pointe sur l'élément qui affiche le message sous la forme *_xxx 
 * l'étoile sera remplacé par l'id du champ input
 * xxx sera n'importe quoi. ex : id input = 'es_espece', id feedback = 'es_espece_feed' et msg = '*_feed'
 * @param {string} msg : message de feedback 
 * @param {string} id : ID du champ
 * @returns {void}
 */
/*
function formSetFeedback( event, msg, id = null ) {

    if ( !isEvent( event ) ) E.debugError( E.ERROR_EVT )
    if ( !isString( msg ) || !isString( id ) && id !== null ) E.debugError( E.ERROR_STR )
    let field

    if ( !id ) {
        // on vérifie la présence des champs IDChamp_valid_feedback et IDChamp_error_feedback
        let idChamp = event.currentTarget.id
        let idError = $( "#" + idChamp + "_error_feedback" )
        let idValid = $( "#" + idChamp + "_valid_feedback" )

        // si champ valid_feedback et error_feedback existent
        if ( idError.length > 0 ) {
            // erreur
            if ( msg != "" ) {
                idError.show()
                if ( idValid.length > 0 ) idValid.hide()
            } else {
                idError.hide()
                if ( idValid.length > 0 ) idValid.show()
            }

            // si seul feedback existe
        } else {

            if ( event.data.feedback.indexOf( '*' ) == 0 )
                field = "#" + event.data.feedback.replace( "*", event.currentTarget.id )
            else if ( event.data.feedback.indexOf( '#' ) == 0 )
                field = event.data.feedback

            if ( msg != "" )
                $( field ).html( msg ).show()
            else
                $( field ).html( msg ).hide()

        }
    } else {
        field = "#" + id
        if ( msg != "" )
            $( field ).html( msg ).show()
        else
            $( field ).html( msg ).hide()
    }
}
*/

const ERROR_MESSAGE = "Valeur non conforme"
const VALID_MESSAGE = "Valeur conforme"

/**
 * @class Form
 * @classdesc Gestion des formulaires
 * @property {string} idForm - nom formulaire
 * @property {jQueryElement} form - élément jQuery
 * @property {string} idField - id du champ courant
 * @property {jQueryElement} field - élément du champ
 * @property {boolean} mark - indique si on doit marquer les champs
 * @property {boolean} pass - indique si mot de passe à vérifier
 * @property {function} callback - fonction de callback
 * @property {string[]} buttons - id des boutons
 * @property {Record<string, ()=>void>} oValidator - fonction de validation
 */
class Form {

    /** Constructor
     * 
     * @param {string} form nom du formulaire 
     */
    constructor(form) {
        this.idForm = form
        this.form = undefined // jQuery formulaire
        this.idField = undefined // 
        this.field = undefined // jQueryElement 
        this.mark = false // 
        this.pass = false // 
        this.buttons = []
        this.oValidator = {}
        this.feedback = []
        this.callback = undefined // fonction de callback
        this._isValidPassword = false // flag
        this._isValidCurrentFile = false
        this._isValidAllFields = false
        this._feedbackMessage = ""
        this.display = false // indique si on doit afficher le message de feedback si valide
    }

    /** Méthode de validation des champs
     * 
     * @param {object} event évenement avec propriété 'data'
     * @description la propriété 'data' peut contenir les propriétés suivantes :
     * - mark? {boolean} indique si on doit marquer les champs (true)
     * - pass? {boolean} true si password (true)
     * - display? {boolean} indique si on doit afficher le message de feedback si valide (false)
     * - buttons? {string[]} liste des id des boutons concernés
     * - callback? {function} fonction de callback (undefined)
     * - validator? {function} fonction de validation (undefined)
     * @file 'modules/utils/forms'
     */
    validButtons(event) {

        if (!isEvent(event) && !(event instanceof jQuery.Event)) E.debugError(E.ERROR_EVT)

        this.idField = event.currentTarget.id
        this.field = getEltID(this.idField)
        this.form = getEltID(event.currentTarget.closest('form').id)
        this.mark = isUndefined(event.data.mark) ? true : event.data.mark
        this.pass = isUndefined(event.data.pass) ? true : event.data.pass
        this.pass = isUndefined(event.data.display) ? false : event.data.display
        if (!isUndefined(event.data.buttons)) {
            if (isArray(event.data.buttons)) this.buttons = event.data.buttons
            else this.buttons = [event.data.buttons]
        }
        this.callback = isUndefined(event.data.callback) ? {} : event.data.callback
        this.oValidator = isUndefined(event.data.validator) ? {} : event.data.validator

        // test validité du champ courant (retourne un objet ou error)
        this._isValidCurrentFile = this._validField(this.field, true)
        this._feedbackMessage = this._get_feedbackMessage(this.idField, this._isValidCurrentFile)

        // on affiche message de feedback sinon on l'efface
        this._dspFeedback(this.idField, this._isValidCurrentFile)
        // On marque le champ courant
        this._dspMark(this.idField, this._isValidCurrentFile)

        // test les autres champs si champ courant valide
        if (this._isValidCurrentFile) {
            this._isValidAllFields = this._verifAllFields()
        }

        // test mot de passe
        if (this._isValidAllFields) {
            this._isValidPassword = this._valid_passwords()
        }

        // actualise les boutons
        this._setButtons()

        // Appel callback
        if (this._isValidCurrentFile && this._isValidAllFields && this._isValidPassword)
            this._callBack()

    }

    /** Appel la fonction de callback si elle existe
     * 
     */
    _callBack() {
        // Gestion du callback
        if (!isUndefined(this.callback) && 'fct' in this.callback && 'data' in this.callback) {
            this.callback['fct'](this.callback['data'])
        }
    }

    /** Active ou désactive les boutons en fonction de la validité des champs
     * 
     */
    _setButtons() {

        const valid = this._isValidCurrentFile && this._isValidAllFields && this._isValidPassword

        this.buttons.forEach(function (bt) {
            $(bt).prop("disabled", !valid);
        })
    }

    /** vérifie l'égalité entre les mots de passe saisis
     * 
     * @return {boolean} résultat
     */
    _valid_passwords() {

        let pwd, result = true
        if (!this.pass)
            return result

        $("#" + this.idField + " :password").each(function () {
            // premier mot de passe
            if (pwd == "undefined") {
                pwd = $(this).val()
            } else {
                // comparaison
                if (pwd != $(this).val()) {
                    result = false
                }
            }
        })
        return result
    }

    /** Vérifie la validité de tous les champs
     * @returns {boolean} résultat
     */
    _verifAllFields() {
        // On parcourt tous les champs
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const _this = this
        let r, result = true
        getEltID(_this.idForm, ":input").filter(':visible').each(function () {
            //$("#" + this.idField + " :input").filter(':visible').each(function () {
            let elt = $(this);
            // si champ actif et différent du champ courant
            if (!elt.prop('disabled') && elt != _this.field) {
                // on vérifie le champ
                r = _this._validField(elt)

                if (!r) result = false;

                _this._get_feedbackMessage(this.id, r)

                // on affiche message de feedback sinon on l'efface
                _this._dspFeedback(this.id, r)

                // On marque le champ courant
                _this._dspMark(this.id, r)
            }
        })
        return result
    }

    /** Affiche la marque
     * 
     * @param {string} idField champ courant
     * @param {boolean} valid vrai si valide
     */
    _dspMark(idField, valid) {
        if (this.mark) {
            const field = getEltID(idField)
            if (field.val() != "") {
                if (valid) {
                    field[0].classList.add("is-valid");
                    field[0].classList.remove("is-invalid");
                } else {
                    field[0].classList.add("is-invalid");
                    field[0].classList.remove("is-valid");
                }
            } else {
                field[0].classList.remove("is-valid")
                field[0].classList.remove("is-invalid")
            }
        }
    }

    /** Affiche message de feedback
     * 
     * @param {string} idField id du champ
     * @param {boolean} valid
     */
    _dspFeedback(idField, valid) {
        if (!isString(idField)) E.debugError(E.ERROR_STR)
        if (isUndefined(idField)) throw new ReferenceError(E.ERROR_ABS)

        const feed = valid ? "valid_feedback" : "error_feedback"
        // On inscrit le message dans la balise adéquate

        // On cache les messages si égal à ""
        let elt
        if (idField !== undefined && (this._feedbackMessage == "" || isUndefined(this._feedbackMessage))) {
            elt = _getFeedBack(idField, 'valid_feedback')
            if (elt === null) return false
            elt.hide()
            elt = _getFeedBack(idField, 'error_feedback')
            if (elt === null) return false
            elt.hide()
        } else {
            elt = _getFeedBack(idField, feed)
            if (elt === null) return false
            elt.html(this._feedbackMessage).show()
        }

    }

    /** Récupère message de feedback
     * 
     * @param {string} idField id du champ
     * @param {boolean} valid résultat de la validation du premier champ
     * @returns {string} message
     */
    _get_feedbackMessage(idField, valid) {
        let msg

        // Champ non renseigné si autre que courant on renvoie une chaine vide 
        let field = getEltID(idField)
        if (field.val() == "" && field != this.field) return ""

        // message à afficher selon l'état de valid
        const feed = valid ? "valid_feedback" : "error_feedback"
        if (valid)
            msg = this.display ? VALID_MESSAGE : ""
        else
            msg = ERROR_MESSAGE

        if (feed in this.oValidator) return this.oValidator[feed]
        else {
            let _elt = _getFeedBack(idField, feed)
            if (_elt === null || _elt[0] === undefined) return ""
            return _elt[0].textContent
            return msg
        }
    }

    /** Vérifie validité du champ
     * 
     * @param {JQuery} field 
     * @returns {boolean} Vrai si champ valide
     */
    _validField(field, isValidator = false) {
        // si champ invalide
        // @ts-ignore
        if (!field[0].validity.valid) return false
        // si validateur
        if (isValidator && this.oValidator) {
            if ('verif' in this.oValidator) {
                if (isUndefined(this.field)) return false
                // @ts-ignore
                return this.oValidator.verif(this.field[0])
            }

        }
        return true
    }

    /** Déclence une action si les champs identifiés sont valides
     * 
     * @param {object} event évenement avec propriété 'data'
     * @file 'modules/utils/form.js'
     */
    actionFields(event) {
        if (!isEvent(event)) throw new Error(E.ERROR_EVT)
        if (isUndefined(event.data.fields)) throw new Error(E.ERROR_OBJ)
        if (isUndefined(event.data.action)) throw new Error(E.ERROR_OBJ)
        const context = this
        function _testFields(fields, context) {
            let r
            fields.every(field => {
                r = context._validField($(field))
                if (!r) return false
                else return true
            })
            return r
        }

        if (_testFields(event.data.fields, context)) {
            event.data.action(event.data.prm)
        }


    }

}


/** Remplit une liste déroulante
 * 
 * @param {Array} data liste des options sous forme d'objet {id|value : ..., label: ...}
 * @param {String} label titre de la liste
 * @returns {string} chaine html de la liste
 * @file 'modules/utils/form.js'
 */
function formSetOptions(data, label = "") {

    if (!isArray(data)) E.debugError(E.ERROR_ARRAY)
    if (!isString(label)) E.debugError(E.ERROR_STR)

    let txt = ""
    if (label != "")
        txt += "<option disabled value>" + label + "</option>"

    data.forEach(function (elt) {
        if (elt.label != undefined) {
            if (elt.id != undefined)
                txt += "<option value=" + elt.id + ">" + elt.label + "</option>"
            else if (elt.value != undefined)
                txt += "<option value=" + elt.value + ">" + elt.label + "</option>"
        } else
            txt += "<option>" + elt + "</option>"
    })
    return txt
}


/** Retourne l'élément HTML qui suit un input
 * 
 * @param {string} idField ID de l'élément courant
 * @param {string} name nom du feedback en général error_feedback ou success_feedback 
 * @returns {JQuery|null}
 * @file 'modules/utils/form.js'
 */
function _getFeedBack(idField, name) {
    if (!isString(idField)) E.debugError(E.ERROR_STR)
    if (isUndefined(idField)) throw new ReferenceError(E.ERROR_ABS)

    let elt = getEltID(idField).parent().find("p").filter(function () {
        return (this.className == name)
    })

    return elt || null
}

export { Form, formSetOptions }