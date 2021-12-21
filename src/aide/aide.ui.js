/**
 * 
 * @module aide/aide_ui
 * @description Affiche page aide
 */

import {getEltID} from "../modules/utils/html.js";
import * as cts from"./html_cts.js"
import {html} from "./html.js"

/** Affiche la page Aide
 * 
 * @param {string} html structure html
 * @function initHelp
 */
function initHelp(html) {

  // Affichage global
  getEltID(cts.AIDE).html(html);

}

initHelp(html)