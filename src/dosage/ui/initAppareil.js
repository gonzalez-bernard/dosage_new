/**
 * initAppareil.js
 * 
 * @module dosage/ui/initAppareil
 * @description
 * - définit les fonctions utiles au différents appareils
 * ***
 * ***export display***
 * @typedef {import("../../../types/classes").Potentiometre} Potentiometre
 * @typedef {import("../../../types/classes").Phmetre} Phmetre
 * @typedef {import("../../../types/classes").Conductimetre} Conductimetre
 * @typedef {import("../../../types/classes").Becher} Becher
 */

import {gDosages} from "../../environnement/globals.js"
import {cts} from"../../environnement/constantes.js";
import {ERROR_STR} from "../../modules/utils/errors.js"
import {isString} from "../../modules/utils/type.js"
import {getEltID} from "../../modules/utils/html.js"
import { DOS_CHART, DOS_DIV_GRAPH } from "./html_cts.js";



/** Affiche ou cache les graphes
 * 
 * @param {string} app nom de l'appareil (ph, cd ou pt) 
 * @returns void
 * @public
 * @file initAppareil.js
 * 
 */
function display(app){
  if (! isString(app)) throw new TypeError(ERROR_STR)
  /*
  switch(app){
    case "ph":
        getEltID(DOS_GRAPH_CD ).hide();
        getEltID(DOS_GRAPH_PT ).hide();
        getEltID(DOS_GRAPH_PH ).show();
        break
    case "cd":
      getEltID(DOS_GRAPH_PH ).hide();
      getEltID(DOS_GRAPH_PT ).hide();
      getEltID(DOS_GRAPH_CD ).show();
      break
    case "pt":
      getEltID(DOS_GRAPH_PH ).hide();
      getEltID(DOS_GRAPH_CD ).hide();
      getEltID(DOS_GRAPH_PT ).show();
      break
    default:
      getEltID(DOS_DIV_GRAPH ).hide();  
      return  
  }
  */
  getEltID(DOS_DIV_GRAPH ).show();
  getEltID(DOS_CHART ).show();
}

function updateAppareil(app, becher){
  const G = gDosages.getCurrentDosage()
  const etats = [cts.ETAT_PHMETRE, cts.ETAT_COND, cts.ETAT_POT]
  const mesures = [cts.MESURE_PH, cts.MESURE_COND, cts.MESURE_POT]
  let type = 0
  if (app.constructor.name == 'Phmetre') type = 0
  else if (app.constructor.name == 'Conductimetre') type = 1
  else if (app.constructor.name == 'Potentiometre') type = 2

  if ( G.test('etat', etats[(type+1) % 3]) || G.test('etat', etats[(type+2) % 3] ))  return false
  if (! G.test('mesure', mesures[type])) return false
  if (! G.test('etat', cts.ETAT_ESPECES)) return false

  // change l'état de branchement de l'appareil
  G.setState(etats[type], -1)

  // Positionne l'appareil
  setAppareil(app, becher)

  return true

}

/** Mise en place de l'appareil
  
  Initie le graphe ou le met à jour, affiche le pH, update le bouton
  @param {Phmetre|Potentiometre|Conductimetre} app
  @param {Becher} becher
  @returns void
  @public
  @file initPhmetre.js
*/
function setAppareil(app, becher ) {

  const G = gDosages.getCurrentDosage()

  // Positionne le phmetre ou le remet en place
  app.dispose( becher );

  // actualise le texte
  let text = ""
  if (app.constructor.name == 'Phmetre') text = G.sph
  else if (app.constructor.name == 'Conductimetre') text = G.scond
  else if (app.constructor.name == 'Potentiometre') text = G.spot
  
  app.setText(text);
}

export {display, updateAppareil}