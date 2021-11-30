/**
 * initAppareil.js
 * 
 * @module dosage/ui/initAppareil
 * @description
 * - définit les fonctions utiles au différents appareils
 * ***
 * ***export display***
 */

import {ERROR_STR} from "../../modules/utils/errors.js"
import {isString} from "../../modules/utils/type.js"
import {getEltID} from "../../modules/utils/html.js"
import { DOS_GRAPHE, DOS_GRAPH_CD, DOS_GRAPH_PH, DOS_GRAPH_PT, DOS_DIV_GRAPH } from "./html_cts.js";

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
  getEltID(DOS_DIV_GRAPH ).show();
  getEltID(DOS_GRAPHE ).show();
}

export {display}