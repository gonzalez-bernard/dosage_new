
/** FORMS 
 * 
 * @module modules/utils/utilsForm
 * @description 
 * Fonctions utiles pour les formulaires
 * ***
 * ***export formSetFeedback, formSetOptions, formValidButtons
*/



import { isEvent, isString, isArray, isUndefined } from "./type.js"
import * as e from "./errors.js"
import { getEltID } from "./html.js"

/** Affiche le message de feedback
 * 
 * @param {event} event : permet de cibler l'objet objet.data contient les informations
 * data.feedback pointe sur l'élément qui affiche le message sous la forme *_xxx 
 * l'étoile sera remplacé par l'id du champ input
 * xxx sera n'importe quoi. ex : id input = 'es_espece', id feedback = 'es_espece_feed' et msg = '*_feed'
 * @param {string} msg : message de feedback 
 * @param {string} id : ID du champ
 * @returns {void}
 */
function formSetFeedback(event, msg, id = null) {

  if (!isEvent(event)) throw new TypeError(e.ERROR_EVT)
  if (!isString(msg) || !isString(id) && id !== null) throw new TypeError(e.ERROR_STR)
  let field

  if (!id) {
    // on vérifie la présence des champs IDChamp_valid_feedback et IDChamp_error_feedback
    let idChamp = event.currentTarget.id
    let idError = $("#" + idChamp + "_error_feedback")
    let idValid = $("#" + idChamp + "_valid_feedback")

    // si champ valid_feedback et error_feedback existent
    if (idError.length > 0) {
      // erreur
      if (msg != "") {
        idError.show()
        if (idValid.length > 0) idValid.hide()
      } else {
        idError.hide()
        if (idValid.length > 0) idValid.show()
      }

      // si seul feedback existe
    } else {

      if (event.data.feedback.indexOf('*') == 0)
        field = "#" + event.data.feedback.replace("*", event.currentTarget.id)
      else if (event.data.feedback.indexOf('#') == 0)
        field = event.data.feedback

      if (msg != "")
        $(field).html(msg).show()
      else
        $(field).html(msg).hide()

    }
  }
  else {
    field = "#" + id
    if (msg != "")
      $(field).html(msg).show()
    else
      $(field).html(msg).hide()
  }
}

const ERROR_MESSAGE = "Valeur non conforme"
const VALID_MESSAGE = "Valeur conforme"

class Form {
  
  constructor(form){
    this.idForm = form
    this.form = undefined       // jQuery formulaire
    this.idField = undefined             // id du champ courant
    this.field = undefined        // jQuery element
    this.mark = false           // indique si on doit marquer les champs
    this.pass = false           // indique si mot de passe à vérifier
    this.callback = undefined   // fonction de callback
    this.isValidPasswords = false  // flag
    this.isValidCurrentField = false
    this.isValidAllFields = false
    this.feedbackMessage = ""
    this.oValidation = {}
    this.oValidator = {}
    this.buttons = []
    this.display = false  // indique si on doit afficher le message de feedback si valide
  }

  validButtons(event){

    if (!isEvent(event)) throw new TypeError(e.ERROR_EVT)

    this.idField = event.currentTarget.id
    this.field = getEltID(this.idField)
    this.form = getEltID(event.currentTarget.closest('form').id)
    this.mark = isUndefined (event.data.mark) ? true : event.data.mark
    this.pass = isUndefined (event.data.pass) ? true : event.data.pass
    this.pass = isUndefined (event.data.display) ? false : event.data.display
    if (! isUndefined (event.data.buttons)){
      if (isArray(event.data.buttons)) this.buttons = event.data.buttons
      else this.buttons = [event.data.buttons]
    }
    this.callback = isUndefined (event.data.callback) ? undefined : event.data.callback
    this.oValidator = isUndefined (event.data.validator) ? undefined : event.data.validator

    // test validité du champ courant (retourne un objet ou error)
    this.isValidCurrentField = this.validField(this.field, true)
    this.feedbackMessage = this._getFeedbackMessage(this.idField, this.isValidCurrentField)

    // on affiche message de feedback sinon on l'efface
    this._dspFeedback(this.idField, this.isValidCurrentField)
    // On marque le champ courant
    this._dspMark(this.idField, this.isValidCurrentField)

    // test les autres champs si champ courant valide
    if (this.isValidCurrentField){
      this.isValidAllFields = this._verifAllFields()
    }

    // test mot de passe
    if (this.isValidAllFields){
      this.isValidPasswords = this._valid_passwords()
    }

    // actualise les boutons
    this._setButtons()

    // Appel callback
    if (this.isValidCurrentField && this.isValidAllFields && this.isValidPasswords )
      this._callBack()

  }

  _callBack(){
      // Gestion du callback
    if (! isUndefined(this.callback)) {
      this.callback['fct'](this.callback['data'])
    }
  }

  _setButtons(){
    
    const valid = this.isValidCurrentField && this.isValidAllFields && this.isValidPasswords
     
    this.buttons.forEach(function (bt) {
      $(bt).prop("disabled", !valid);
    })
  }

  /** vérifie l'égalité entre les mots de passe saisis
     * 
     * @return {boolean}
     */
   _valid_passwords() {

    let pwd, result = true

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

  _verifAllFields(){
    // On parcourt tous les champs
    const _this = this
    let r, result = true
    getEltID(_this.idForm,":input").filter(':visible').each(function () {
    //$("#" + this.idField + " :input").filter(':visible').each(function () {
      let elt = $(this);
      // si champ actif et différent du champ courant
      if (!elt.prop('disabled') && elt != _this.field) {
        // on vérifie le champ
        r = _this.validField(elt)
        
        if (! r) result = false;

        _this._getFeedbackMessage(this.id, r)
        
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
  _dspMark(idField, valid){
    if (this.mark){
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
  _dspFeedback(idField, valid){
    const feed = valid ? "valid_feedback" : "error_feedback"
    // On inscrit le message dans la balise adéquate

    // On cache les messages si égal à ""
    if (this.feedbackMessage == "" || isUndefined(this.feedbackMessage)) {
      getFeedBack(idField, 'valid_feedback').hide()
      getFeedBack(idField, 'error_feedback').hide()
    }
    else {
      getFeedBack(idField, feed).html(this.feedbackMessage).show()
    }
      
  }

  /** Récupère message
   * 
   * @param {string} idField id du champ
   * @param {boolean} valid 
   * @returns 
   */
  _getFeedbackMessage(idField, valid){
    let msg
    
    // Champ non renseigné si autre que courant on renvoie une chaine vide 
    let field = getEltID(idField) 
    if (field.val() == "" && field != this.field) return ""
    // si message dans validator
    const feed = valid ? "valid_feedback" : "error_feedback"
    if (valid)
      msg = this.display ? VALID_MESSAGE : ""
    else
      msg = ERROR_MESSAGE
    if (this.oValidator.hasOwnProperty(feed)) return this.oValidator[feed]
      else {
        let _elt = getFeedBack(idField, feed)[0]
        if (_elt && _elt.textContent != '')
          return _elt.textContent
        return msg
      }
    }

  /** Vérifie validité du champ
   * 
   * @returns {boolean} Vrai si champ valide
   */
  validField(field, isValidator = false){
    // si champ invalide
    // @ts-ignore
    if (! field[0].validity.valid) return false
    // si validateur
    if (isValidator && this.oValidator){
      if (this.oValidator.hasOwnProperty('verif'))
        return this.oValidator.verif(this.field[0])
    }
    return true
  }

}


/** Remplit une liste déroulante
* 
* @param {Array} data liste des options sous forme d'objet {id|value : ..., label: ...}
* @param {String} label titre de la liste
* @returns {string}
*/
function formSetOptions(data, label = "") {

  if (!isArray(data)) throw new TypeError(e.ERROR_ARRAY)
  if (!isString(label)) throw new TypeError(e.ERROR_STR)

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
 * @returns {JQuery | undefined}
 */
function getFeedBack(idField, name) {
  return getEltID(idField).parent().find("p").filter(function (index) {
    return (this.className == name)
  })
}

export {Form, formSetOptions}



