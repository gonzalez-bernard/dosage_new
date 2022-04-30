import * as ui from "./ui/html_cts.js";

import { gDosages, gGraphs, gGraphMenu } from "../environnement/globals.js";
import { getEltID } from "../modules/utils/html.js";
import { dspTabEspeces } from "../especes/especes.ui.js";
import { cts } from "../environnement/constantes.js";
import {Dialog} from "../modules/dom.js"
import {ListMenu} from "../modules/listmenu.js"

import {toggleDisplayGraph, removeGraphMenu} from "./dosage.graph.js"
import { dgForm } from "./ui/html.js";
import { DOS_TOOLTIP_OEIL, DOS_TOOLTIP_TRASH } from "./ui/lang_fr.js";


/** Action à faire en cas de fermeture du dialogue "dspErrorMessage"
 *  On bascule sur l'onglet Especes
 * @returns void
 * @public
 * @file dosage_ui.js
 */
function displayEspece() {
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
    const C = gGraphs.currentChart

    let bts = [ui.DOS_BT_COTH, ui.DOS_BT_DERIVEE, ui.DOS_BT_TAN1, ui.DOS_BT_TAN2, ui.DOS_BT_PERP, ui.DOS_BT_SAVE_GRAPH]
    let _this = C

    // désactive tous les boutons
    if (clear) {
        bts.forEach((item) => {
            getEltID(item).prop("disabled", true);
        })
    }

    // activation de graphe théorique
    getEltID(ui.DOS_BT_COTH).prop("disabled", G.getState('APPAREIL_ON') != 1)


    // on active tan2 si tan1 existe ou tan2 déjà tracée
    if (_this.indiceTangentes[0] != 0 || _this.indiceTangentes[1] != 0)
        getEltID(ui.DOS_BT_TAN2).prop("disabled", false);

    // on active perp si tan1 et tan2 tracées
    if (_this.indiceTangentes[0] != 0 && _this.indiceTangentes[1] != 0)
        getEltID(ui.DOS_BT_PERP).prop("disabled", false);

    if (G.titrant.vol > cts.DOS_TITRANT_MIN) {
        getEltID(ui.DOS_BT_DERIVEE).prop("disabled", false);
        getEltID(ui.DOS_BT_TAN1).prop("disabled", false);
        getEltID(ui.DOS_BT_SAVE_GRAPH).prop("disabled", false)
    }
}

/** Ferme la boite de dialogue d'ajout graphe
 * 
 * @file dosage.ui.js
 */
function closeDialog(){
    gGraphMenu.dialog.hide()
}

/** Actions lors de la validation du dialogue ajout d'un graphe
 * On ajoute la courbe à la liste déroulante
 * On affiche la liste
 * On ferme le dialogue
 * @file dialog.ui.js
 */
function saveDialog(){
    // @ts-ignore
    // Ajoute un item du graphe courant à la liste des graphes
    addGraphMenuItem($("#graphName").val(), gGraphs.idCurrentChart)
    // Affiche le menu
    gGraphMenu.menu.displayMenu(gGraphMenu.idRootMenu, true)
    // ferme le dialogue
    closeDialog();
}

/** Crée un object Dialog pour saisie du nom de la courbe
 * 
 * @returns {Dialog}
 * @file dialog.ui.js
 */
function initDialog(){
    const dgPrm = {
        autoOpen: false,
        height: 'auto',
        width: 'auto',
        position: {my: 'center', at: "center"},
        modal: true,
        title: "Nom de la courbe",
        classes: {
            "ui-dialog": "ui-corner-all",
            "ui-dialog-titlebar": "ui-corner-all",
        },
        buttons: [
            {
                text: "Enregistre",
                click: saveDialog,
                class: 'button-success'
            },
            {
                text: "Annule",
                click: closeDialog,
                class: 'button-close'
            }
        ],
        close: {
            click: closeDialog,
            class: 'bt-close'
        }
    }
    return new Dialog("dialog-form", dgForm, dgPrm)
}

/** Menu des graphes initial
 * Crée le menu et la boite de dialogue
 * 
 * @file dialog.ui.js
 */
 function initGraphMenu(){
    const prop = {
        label: gGraphMenu.label, 
        idBtMenu:gGraphMenu.idButton, 
        idMenu: gGraphMenu.idMenu, 
        idRootMenu:gGraphMenu.idRootMenu, 
        width: gGraphMenu.width, 
        enabled: false
    }

    const rows = []

    gGraphMenu.menu = new ListMenu(prop, rows)
    gGraphMenu.menu.createMenu()
    gGraphMenu.menu.displayMenu("#"+gGraphMenu.idMenu)
    gGraphMenu.dialog = initDialog()
}

/** Ajoute une courbe à la liste
 * La fonction vérifie que l'idGraph est unique
 * @param {string} label nom de la courbe
 * @param {string} idGraph ID de la courbe
 * @file dialog.ui.js
 */
function addGraphMenuItem(label, idGraph){
    if (gGraphMenu.menu.getPosByID(idGraph) == -1){
        const row = []
        row.push({type:'label', content: [idGraph], width:0, visible:false})
        row.push({type:'label', content: [label], class:'text-overflow'})
        row.push({
        type:'img', 
        content:[gGraphMenu.imgVisible, gGraphMenu.imgNoVisible],
        idx: 0, 
        action: toggleDisplayGraph, 
        id: 'imgVisible_'+gGraphMenu.menu.getRows().length, 
        width: 2, 
        tooltip:DOS_TOOLTIP_OEIL

    })
        row.push({
        type:'img', 
        content: [gGraphMenu.imgTrash], 
        action: removeGraphMenu, 
        id: 'imgTrash_'+gGraphMenu.menu.getRows().length, 
        width:2, 
        tooltip: DOS_TOOLTIP_TRASH
    })
        gGraphMenu.menu.addItem(row, true)
    }
}

/** Active ou désactive l'affichage de menu graphe
 * 
 */
function dspGraphMenu(state = false){
    if (state)
        $("#" + gGraphMenu.idButton).show()
    else
        $("#" + gGraphMenu.idButton).hide()
}

/** Bascule l'état de visibilité des boutons des courbes pH
 * 
 * @param {boolean} visible true si boutons visibles
 * @file dialog.ui.js
 */
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

/** Active ou désactive l'onglet Dosage
 * 
 * @param {boolean} display indique si on active ou non
 * @file dialog.ui.js
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

export { setButtonState, setButtonClass, dspTabDosage, displayEspece, setButtonVisible, initGraphMenu, dspGraphMenu }