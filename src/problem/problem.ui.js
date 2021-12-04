/**
 * @module problem/problem.ui
 * @description
 * - Affiche page problem
 */
import * as txt from "./lang_fr.js"
import * as ui from "./html_cts.js"
import {G} from "../environnement/globals.js"
import { getHtml } from "./html.js";
import { getEltID, getValueID} from "../modules/utils/html.js";

import { mathArrondir } from "../modules/utils/number.js";
import { uString, dspHtmlLatex } from "../modules/utils/string.js";
import { FILE_ZOOM_IN, FILE_ZOOM_OUT, ETAT_PROBLEM, DATA_GET_PROBLEM, DATA_GET_PROBLEM_OK } from "../environnement/constantes.js";
import {dspMessage as displayMessage} from "../modules/dom.js"
import { updEspeces, resetForm, dspTabEspeces } from "../especes/especes.ui.js";
import { getProblem} from "./problem.data.js";
import {setEvents} from "./problem.events.js"
import { isEvent } from "../modules/utils/type.js";


var numEssais = 0 // nombre d'essais
var nbEssais = 3 

function initPage(data){
  let context = new uString(data.context).convertExpoIndice().html
  let question = new uString(data.question).convertExpoIndice().html
  var html = getHtml(data.id, data.objectif, context, question, data.inconnu, data.img)
  $("#problem").html(html)
}

/** Récupére un problème et crée la page 
 * 
 * Appel python 
 * arg est soit un event soit un objet du type {G:G, data:{indice:...}}
 * @param {event|object} arg 
 * @return {void}
 */
function initProblem(arg){
    const data = isEvent(arg) ? arg.data : arg

    getProblem(data.data).then(function(data){
    data.inconnu.label = new uString(data.inconnu.label).convertExpoIndice().html
    data.inconnu.value = data.inconnu.field[0].value
    G.type = data.type
    
    // Crée la page HTML
    initPage(data)

    G.setState(ETAT_PROBLEM,1)
    G.inconnu = data.inconnu
    
    // Définition des événements
    setEvents(G, data)
  })
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

/** Active ou désactive l'onglet
 * 
 * @param {boolean} display indique si on active ou non 
 */
 function dspTabProblem(display){
  if (display){
      getEltID( ui.MNU_PROBLEM ).addClass( 'active' )
      getEltID( ui.PROBLEM ).addClass( 'active show' )
  } else {
      getEltID( ui.MNU_PROBLEM ).removeClass( 'active' )
      getEltID( ui.PROBLEM ).removeClass( 'active show' )
  }
}

/** Annule les actions sur les champs
 * 
 * @param {event} e event
 * @private
 * @file problem.ui.js
 */
function cancelProblem(e) {
  resetForm()
  dspTabEspeces(true)
  dspTabProblem(false) 
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
  dspTabProblem(false)
  dspTabEspeces(true)
}

const data = {G: G, data: { 'indice': 1 }}

initProblem(data)

export {zoomImgOn, zoomImgOut, zoomIn, initPage, experiment, validProblem, cancelProblem, initProblem }