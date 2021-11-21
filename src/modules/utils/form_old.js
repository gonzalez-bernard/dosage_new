/** FORMS */

/**
 * @typedef event
 * @property data
 * @property currentTarget
 */

import { isEvent, isUndefined, isString, isArray } from "./type.js"
import * as e from "./errors.js"

/** Affiche le message de feedback
 * 
 * @param {event} event : permet de cibler l'objet. objet.data contient les informations
 * data.feedback pointe sur l'élément qui affiche le message sous la forme *_xxx 
 * l'étoile sera remplacé par l'id du champ input
 * xxx sera n'importe quoi. ex : id input = 'es_espece', id feedback = 'es_espece_feed' et msg = '*_feed'
 * @param {String} msg : message de feedback 
 * @param {string} id : ID du champ
 * @returns {void}
 */
var formSetFeedback = function (event, msg, id = null) {

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

/** Vérifie que tous les champs sont remplis 
* 
* On teste d'abord la validité du champ qui a générer l'événement
* Puis les autres si succès.
* dans ce cas on teste aussi si les mots de passe concordent.
* 
* @param {event} event 
* event contient les champs suivants :
* - feedback : id du l'élément feedback (voir form_set_feedback)
* - button : id du bouton à valider ou tableau des boutons
* - pass : true/false indique si on doit traiter les mots de passe
* - mark : true/false indique si on doit marquer les champs
* - validator : none/obj objet validator {'fct': fonction, ['data': data, 'msg': message]}
* - callback : none/obj fonction si réussite. Même structure que validator
* @returns {void}
**/
var formValidButtons = function (event) {

  if (!isEvent(event)) throw new TypeError(e.ERROR_EVT)

  const INVALID_VERIF_PASSWORD = "Les mots de passe ne concordent pas"
  const INVALID_INPUT = "La valeur ne correspond pas aux critères"

  let field = "#" + event.currentTarget.closest('form').id
  let mark = (typeof (event.data.mark) != undefined ? event.data.mark : true)
  let pass = (typeof (event.data.pass) != 'undefined' ? event.data.pass : true)
  let callback = (typeof (event.data.callback) != 'undefined' ? event.data.callback : undefined)

  let isValidPasswords = true
  let isCurrentFieldValid = false      // validité du champ courant
  let isFieldsValid = false    // validité de tous les champs
  let msg // message de feedback
  let validation
  let gValid = { 'valid': true }

  var _valid_class = function (obj, valid, display = true) {
    /**
        Met à jour les objets en fonction de la validité des champs
        @param obj : champ
        @param valid {boolean} : indique si valide ou pas
        @param display {boolean} : indique si on doit marquer valide ou pas
    */
    if (obj.value != "") {
      if (display) {
        if (valid) {
          obj.classList.add("is-valid");
          obj.classList.remove("is-invalid");
        } else {
          obj.classList.add("is-invalid");
          obj.classList.remove("is-valid");
        }
      }

    } else {
      obj.classList.remove("is-valid")
      obj.classList.remove("is-invalid")
    }
  }

  var _verif_inputfields = function (field, mark = true) {
    /** test la validité de tous les champs input
     * 
     * @param {String} field : id du formulaire
     * @param {Boolean} mark : indique s'il faut marquer les champs
     * @returns true | false
     */
    let valid = true
    $(field + " :input").filter(':visible').each(function () {
      let elt = $(this);
      // si champ actif
      if (!elt.prop('disabled')) {
        // efface 
        _valid_class(elt[0], true, false)
        // si valide
        // @ts-ignore
        if (elt[0].validity.valid) {
          if (mark)
            _valid_class(elt[0], true)
        } else
          valid = false;
      }
    })
    return valid;
  }

  /**
   * test la validité d'un champ input
   * @param elt {any} : champ
   * @param validator {object} 
   * La structure l'objet validator est la suivante {'fct' : pointeur sur fonction, 
   * ['msg' : message feedback global, 'data' : arguments]}
   * Si validator est un pointeur, on ne passe que la fonction
   * @return {object} objet contenant les items 'valid' (boolean), msg (string) et [id] (string)
   */
  var _valid_inputfield = function (elt, validator = undefined) {

    // Création des messages de feedback par défaut
    const errorMessage = validator !== undefined ? validator.errorMessage || "Valeur non conforme" : "Valeur non conforme"
    const successMessage = validator !== undefined ? validator.successMessage || "Valeur conforme" : "Valeur conforme"

    // si champ invalide
    if (elt.validity.valid == false) {
      return { 'valid': false, 'msg': errorMessage }
    }
    // si validator existe
    if (undefined != validator) {
      if (typeof (validator) == "object" && validator.fct != undefined) {
        let fct = validator.fct
        return fct(elt, validator.data)
      } else
        return validator(elt)
    }
    return { 'valid': true, 'msg': successMessage }
  }

  /** vérifie l'égalité entre les mots de passe saisis
     * 
     * @param {event} event
     * @retun {boolean}
     */
  var _valid_passwords = function (event) {

    let pwd
    let valid = false

    $(":password").each(function () {
      if (pwd == "undefined") {
        pwd = $(this).val()
      } else {
        if (pwd == $(this).val()) {
          valid = true
        }
        _valid_class($(this)[0], valid)
        return false
      }
    })
    return valid
  }

  // test validité du champ courant
  validation = _valid_inputfield(event.currentTarget, event.data.validator)

  // si validation est un objet
  if (typeof validation == "object") {
    if (validation.valid != undefined)
      isCurrentFieldValid = validation.valid
    if (validation.msg != undefined)
      msg = validation.msg
    else
      msg = event.data.validator.msg != undefined ? event.data.validator.msg : INVALID_INPUT
  } else
    isCurrentFieldValid = validation

  // si champ non valide on affiche message de feedback sinon on l'efface
  if (!isCurrentFieldValid) {
    formSetFeedback(event, msg)
  } else {  // champ courant valide
    formSetFeedback(event, "")

    /* test de tous les champs */
    isFieldsValid = _verif_inputfields(field, mark)

    // si echec on affiche message de feedback sinon on l'efface
    if (!isFieldsValid) {
      formSetFeedback(event, msg, validation.id)
    } else {
      formSetFeedback(event, "", validation.id)
    }

    if (isFieldsValid) {
      /* Utilisation du validator si existe */
      if (event.data.validator !== undefined && event.data.validator.hasOwnProperty('verif')) {
        gValid = event.data.validator.verif(event.currentTarget)

        /* test identité des mots de passe */
        if (gValid && pass) {
          isValidPasswords = _valid_passwords(event)
          if (!isValidPasswords) {
            formSetFeedback(event, INVALID_VERIF_PASSWORD)
          }
        }
      }
    }
  }

  // On marque le champ courant
  if (mark)
    _valid_class(event.currentTarget, isCurrentFieldValid, true)


  /* Actualisation des boutons */
  if (typeof event.data.button == "object") {
    event.data.button.forEach(function (bt) {
      let valid = ! (isValidPasswords && isFieldsValid && gValid.valid)
      $(bt).prop("disabled", valid);
    })
  } else {
    let valid = ! (isValidPasswords && isFieldsValid && gValid.valid)
    $(event.data.button).prop("disabled", valid);
  }

  // Gestion du callback
  if (event.data.callback != undefined && !$(event.data.button).prop('disabled')) {
    callback = event.data.callback['fct']
    callback(event.data.callback['data'])
  }

}

/** Remplit une liste déroulante
* 
* @param {Array} data liste des options sous forme d'objet {id|value : ..., label: ...}
* @param {String} label titre de la liste
* @returns {string}
*/
var formSetOptions = function (data, label = "") {

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

export { formSetFeedback, formSetOptions, formValidButtons }