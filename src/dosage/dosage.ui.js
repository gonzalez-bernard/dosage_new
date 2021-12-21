import * as ui from "./ui/html_cts.js";
import { gDosages, gGraphs } from "../environnement/globals.js";
import { getEltID } from "../modules/utils/html.js";
import { dspTabEspeces } from "../especes/especes.ui.js";
import { cts } from "../environnement/constantes.js";

// const G = gDosages.getCurrentDosage()

/** Action à faire en cas de fermeture du dialogue "dspMessage"
 *
 * @returns void
 * @public
 * @file dosage_ui.js
 */
function setClassMenu() {
    // On bascule sur espèces
    dspTabEspeces(true)
    dspTabDosage(false)
}

/********************************************************** */

/** Gère l'état des boutons du graphe en fonction de l'état
 * 
 * Le bouton graphe théorique est actif quand le pHmètre est branché
 * Les boutons dérivée et tan1 s'activent quand au moins 10 points de mesure sont faits
 * Le bouton tan2 s'active quand la tangente 1 est tracée
 * Le bouton perpendiculaire s'active si tan1 et tan2 sont tracées   
 * @param {boolean} clear désactive tous les boutons si true
 * @returns void
 * @public
 * @file dosage.ui.js
 */
function setButtonState(clear = true) {
    const G = gDosages.getCurrentDosage()
    const C = gGraphs.charts[gDosages.currentDosage]

    let bts = [ui.DOS_BT_COTH, ui.DOS_BT_DERIVEE, ui.DOS_BT_TAN1, ui.DOS_BT_TAN2, ui.DOS_BT_PERP]
    let _this = C.chartPH

    // désactive tous les boutons
    if (clear) {
        bts.forEach((item) => {
            getEltID(item).prop("disabled", true);
        })
    }

    // activation de graphe théorique
    getEltID(ui.DOS_BT_COTH).prop("disabled", !G.test("etat", cts.ETAT_PHMETRE))


    // on active tan2 si tan1 existe ou tan2 déjà tracée
    if (_this.indiceTangentes[0] != 0 || _this.indiceTangentes[1] != 0)
        getEltID(ui.DOS_BT_TAN2).prop("disabled", false);

    // on active perp si tan1 et tan2 tracées
    if (_this.indiceTangentes[0] != 0 && _this.indiceTangentes[1] != 0)
        getEltID(ui.DOS_BT_PERP).prop("disabled", false);

    if (G.titrant.vol > 5) {
        getEltID(ui.DOS_BT_DERIVEE).prop("disabled", false);
        getEltID(ui.DOS_BT_TAN1).prop("disabled", false);
    }

}

function setButtonVisible(visible = true){
    const bts = [ui.DOS_BT_COTH, ui.DOS_BT_DERIVEE, ui.DOS_BT_PERP, ui.DOS_BT_TAN1, ui.DOS_BT_TAN2]
    if (visible)
        bts.forEach((elt) => {
            getEltID(elt).css('visibility','visible') 
        })
    else
        bts.forEach((elt) => {
            getEltID(elt).css('visibility','hidden')
        })
}

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

/** Active ou désactive l'onglet
 * 
 * @param {boolean} display indique si on active ou non 
 */
function dspTabDosage(display) {
    if (display) {
        getEltID(ui.MNU_DOSAGE).addClass('active')
        getEltID(ui.DOSAGE).addClass('active show')
    } else {
        getEltID(ui.MNU_DOSAGE).removeClass('active')
        getEltID(ui.DOSAGE).removeClass('active show')
    }
}

/********************************************************** */

export { setButtonState, setButtonClass, dspTabDosage, setClassMenu, setButtonVisible }