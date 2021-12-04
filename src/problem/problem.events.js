/**
 * @module problem.events.js
 * @description gestion des événements
 */

 import * as ui from "./html_cts.js"
 import {Form} from "../modules/utils/form.js" 
 import { getEltID } from "../modules/utils/html.js";
 import { zoomIn, zoomImgOn, zoomImgOut, experiment, validProblem, cancelProblem } from "./problem.ui.js";
 import {initProblem} from "./problem.ui.js"
 import { uString} from "../modules/utils/string.js";
 import {dspInfo} from "../infos/infos.js"

function setEvents(G, data) {

  // zoom et image
  getEltID(ui.PB_ZOOM).on('click', zoomIn)
  getEltID(ui.PB_IMG).hover(zoomImgOn, zoomImgOut)

  // affiche aide
  getEltID(ui.PB_BT_HELP).on('click', {
    infos:
    {
      type: 2,
      msg: new uString(data.help).convertExpoIndice().convertArrow().html,
      idmodal: '#' + ui.PB_HELP,
      title: 'Problème',
      idbtclose: ""
    }
  },
    dspInfo)

  // affiche solution
  getEltID(ui.PB_BT_SOLUTION).on('click', {
    infos:
    {
      type: 2,
      msg: data.solution + data.inconnu.label + " " + data.inconnu.value + " " + data.inconnu.unit, idmodal: '#' + ui.PB_SOLUTION,
      title: 'Problème',
      idbtclose: ""
    }
  },
    dspInfo)

  // contrôle réponse
  var frm = new Form(ui.PB_PROBLEM_REPONSE)
  getEltID(ui.PB_PROBLEM_REPONSE).on('input', {
    feedback: '#' + ui.PB_FEEDBACK,
    buttons: '#' + ui.PB_BT_VALID,
    pass: false
  }, frm.validButtons.bind(frm));

  // bouton expérimenter
  getEltID(ui.PB_EXPERIMENT).on('click', experiment)

  // bouton validation
  getEltID(ui.PB_BT_VALID).on('click', validProblem)

  // bouton abandon
  getEltID(ui.PB_BT_CANCEL).on('click', cancelProblem)

  // Clics sur boutons problèmes
  for (var i = 0; i < 12; i++) {
    getEltID(ui.PB_QU[i]).on('click', {G: G, data: { 'indice': i }}, initProblem)
  }
}


export { setEvents }