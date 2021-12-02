/**
 * @module problem/problem.ui
 * @description
 * - Affiche page problem
 */
import * as txt from "./lang_fr.js"
import * as ui from "./html_cts.js"
import {G} from "../environnement/globals.js"
import { getHtml } from "./html.js";
import { getEltID, getValueID, setValueID } from "../modules/utils/html.js";

import { mathArrondir } from "../modules/utils/number.js";
import { uString, dspHtmlLatex } from "../modules/utils/string.js";
import { FILE_ZOOM_IN, FILE_ZOOM_OUT } from "../environnement/constantes.js";
import {dspMessage as displayMessage} from "../modules/dom.js"
import { updEspeces } from "../especes/especes.ui.js";
import { MNU_ESPECES, ESPECES, ES_TITRE_CONC, ES_ACIDEBASE_TITRE_SELECT, ES_AUTREDOS_SELECT } from "../especes/html_cts.js";
import { PROBLEM } from "./html_cts.js";
import { getProblem, initProblem } from "./problem.data.js";


var valeur
var numEssais = 0 // nombre d'essais
var nbEssais = 3 
var precision

function initPage(data){
  let context = new uString(data.context).convertExpoIndice().html
  let question = new uString(data.question).convertExpoIndice().html
  var html = getHtml(data.id, data.objectif, context, question, data.inconnu, data.img)
  $("#problem").html(html)
}

/** Active le zoom
 * 
 * @param {event} event
 */
function zoomIn(event) {
  let img = $(event.currentTarget).children[0]
  if (img.src.indexOf('zoom-in') == -1) {
    // @ts-ignore
    img.src = FILE_ZOOM_IN
    getEltID(ui.PB_IMG).css("transform", "scale(1)")
    getEltID(ui.PB_ENONCE).animate({ 'zoom': 1 }, 400)
  } else {
    img.src = FILE_ZOOM_OUT
    getEltID(ui.PB_IMG).css("transform", "scale(0.5)")
    getEltID(ui.PB_ENONCE).animate({ 'zoom': 2 }, 100)
  }
}

/** Agrandit l'image
 * 
 */
function zoomImgOn() {
  getEltID(ui.PB_IMG).css("transform", "scale(1.5)")
}

/** réduit l'image
 * 
 */
function zoomImgOut() {
  getEltID(ui.PB_IMG).css("transform", "scale(1)")
}

/** Affiche la solution ou l'aide
 * 
 * @param {object} event 
 * @file problem.ui.js
 */
function dspInfo(event) {

  // Efface contenu précédent
  if (event.data['idModal'] == "#"+ui.PB_HELP) {
    getEltID(ui.PB_SOLUTION).html('')
  } else {
    getEltID(ui.PB_HELP).html('')
  }

  let html = event.data.infos.msg + "<hr/>"
  dspHtmlLatex(html, event.data.infos.idmodal)
}

/** Affiche les messages en cas de succés ou d'erreur
 * 
 * @param {boolean} result true si OK 
 * @param {number} mode 1 = approximatif, 2 = faux
 * @private
 */
function dspMessage( result, mode = 0 ) {
  if ( result ) {
    displayMessage(ui.PB_ALERT_SUCCESS, txt.PB_FEED_OK, 2000)
  } else {
    if (mode == 1)
      displayMessage(ui.PB_ALERT_ERROR, txt.PB_FEED_PROX, 2000)
    else 
      displayMessage(ui.PB_ALERT_ERROR, txt.PB_FEED_NO, 2000)
  }
}

/**  Vérifie la saisie, lance affichage message
 * 
 * @use dspMessage
 */
 function validProblem() {

  // On arrondit la valeur en tenant compte du nombre de CS (precision)
  let roundValue = parseFloat(mathArrondir( G.inconnu.field[0].value, 10 ))
  let reponse = getValueID( ui.PB_PROBLEM_REPONSE,'float')
  let r = Math.abs( 1 - reponse/roundValue )
  let prec = new uString(G.inconnu.field[0].precision).strListToArray().array
  if ( r < parseFloat(prec[0]) ) {
    dspMessage( true )
  } else if ( r < parseFloat(prec[1]) )
    dspMessage( false, 1 )
  else {
    numEssais++ // incrémente le nombre d'essais
    if ( numEssais == nbEssais ) {
      getEltID( ui.PB_BT_SOLUTION ).removeAttr('disabled')
    }
    dspMessage( false, 2 )
  }
}

/** Annule les actions sur les champs
 * 
 * @param {event} e event
 * @private
 * @use dspTabProblem
 * @file problem.ui.js
 */
function cancelProblem(e) {
  //dspTabProblem()

  setValueID(ES_TITRE_CONC, 0.01)
  getEltID(ES_TITRE_CONC).removeAttr('disabled').prop('type','text')
  getEltID(ES_ACIDEBASE_TITRE_SELECT).val(1)
  getEltID(ES_ACIDEBASE_TITRE_SELECT).removeAttr('disabled')
  getEltID(ES_AUTREDOS_SELECT).val(1)
  getEltID(ES_AUTREDOS_SELECT).removeAttr('disabled')
}

/** Initialise les champs du formulaire espèce
 * 
 * @param {event} e event
 * @use updEspeces, dspTabProblem
 * @private
 * @file problem.ui.js
 */
function experiment(e){
  updEspeces(G)
  dspTabProblem()
  /*
  if (formValid(ES_FORM))
    getEltID(ES_BT_VALID).removeAttr('disabled')
  else
    getEltID(ES_BT_VALID).prop('disabled', false)}
  */
}

/** Active la fenêtre espèces
 * 
 * @private
 * @file problem.ui.js
 */
function dspTabProblem(){
  getEltID(MNU_ESPECES).addClass('active').trigger('add_class')
  getEltID(ui.MNU_PROBLEM).removeClass('active')
  getEltID(PROBLEM).removeClass('active show')
  getEltID(ESPECES).addClass('active show')
}



getProblem()
initProblem(G)

export {zoomImgOn, zoomImgOut, zoomIn, initPage, experiment, validProblem, cancelProblem }