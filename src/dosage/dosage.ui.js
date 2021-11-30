import * as ui from "./ui/html_cts.js";
import {G} from "../environnement/globals.js";
import { getEltID } from "../modules/utils/html.js";
import { MNU_ESPECES, ESPECES } from "./../especes/html_cts.js"
import { MNU_DOSAGE, DOSAGE } from "./ui/html_cts.js";

/** Action à faire en cas de fermeture du dialogue "dspMessage"
 *
 * @returns void
 * @public
 * @file dosage_ui.js
 */
 function setClassMenu() {
  // On bascule sur espèces
  getEltID(MNU_ESPECES).addClass("active");
  getEltID(MNU_DOSAGE).removeClass("active");
  getEltID(DOSAGE).removeClass("active show");
  getEltID(ESPECES).addClass("active show");
}

/********************************************************** */

/** Gère l'état des boutons tan2 et perp en fonction de l'état
 * 
 * @returns void
 * @public
 * @file dosage.ui.js
 */
 function setButtonState() {
  let bts = [ui.DOS_BT_TAN2, ui.DOS_BT_PERP]
  let _this = G.charts.chartPH

  // désactive les 2 boutons
  bts.forEach((item) => {
      getEltID(item).prop("disabled", true);
  })

  // on active tan2 si tan1 existe ou tan2 déjà tracée
  if (_this.indiceTangentes[0] != 0 || _this.indiceTangentes[1] != 0)
      getEltID(bts[0]).prop("disabled", false);
  
      // on active perp si tan1 et tan2 tracées
  if (_this.indiceTangentes[0] != 0 && _this.indiceTangentes[1] != 0)
      getEltID(bts[1]).prop("disabled", false);

}

/********************************************************** */


/** Affiche bouton activé
* 
* @param {string} bt ID du bouton
* @param {number} state action 0 = désactive, 1 = active, -1 = bascule 
* @returns void
* @public
* @file dosage.ui.js
*/
function setButtonClass(bt, state = 1) {
  /*
    let bts = [ui.DOS_BT_TAN1, ui.DOS_BT_TAN2, ui.DOS_BT_COTH, ui.DOS_BT_PERP, ui.DOS_BT_DERIVEE]
  
  for (let e in bts) {
      if (bts[e] != bt)
          getEltID(bts[e]).removeClass("active-button");
  }
  */
  
  if (bt == "") return
  if (state == 0)
      getEltID(bt).removeClass("active-button")
  else if (state == 1)
      getEltID(bt).addClass("active-button")
  else if (state == -1)
      getEltID(bt).toggleClass("active-button")
}

/********************************************************** */

export {setButtonState, setButtonClass, setClassMenu}