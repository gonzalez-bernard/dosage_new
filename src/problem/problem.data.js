/**
 *  @desc Module problem.data
 *  
 */

 import { uString} from "../modules/utils/string.js";
 import {initPage} from "./problem.ui.js"
 import { ETAT_PROBLEM } from "../environnement/constantes.js";
 import {setEvents} from "./problem.events.js"

// @ts-ignore
var socket = io();


/** Récupère un problème à partir du fichier problems.xml
 * 
 * @param {event} [event] 
 */
 function getProblem(event){

  /**
  * @typedef event
  * @property data
  */
 // Chargement des problèmes
 var datas =  (event !== undefined) ? {'indice': event.data.indice} : {'indice': 0}
 
 var data = {
   func: "get_problems",
   datas: datas 
 }
 socket.emit("getProblems", data)
}

function initProblem(G) {

  // si requete réussie
  socket.on("getProblems_ok", function (data) {

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

  socket.on("pyerror", function (err) {
    console.log(err)
  })
}

export {initProblem, getProblem}