/** WINDOWS 
 * 
 * @module modules/utils/utilsWindow
 * @description
 * Affichage fenêtre modale
 * ***
 * ***export dspModalInfo***
*/

/**
 * @typedef event
 * @property data
 */

import { isEvent } from "./type.js"
import * as e from "./errors.js"

/** Affiche une fenêtre modale
 *   
 * @param {event} event
 *  event.data : arguments
 *      - container : id du conteneur (div)
 *      - titre : titre de la fenêtre
 *      - info  : contenu à afficher
 *      - btclose : texte du bouton
 */
var dspModalInfo = function (event) {

    if (!isEvent(event)) throw new TypeError(e.ERROR_EVT)
    const id_container = event.data.container
    const idModal = 'idModal'
    const txt_titre = event.data.titre
    const txt_info = event.data.info
    const txt_bt_close = event.data.btclose
    const html = "<div data-dismiss = 'modal' class='modal fade' id='idModal' tabindex='-1' role='dialog' " +
        "aria-hidden='true'><div class='modal-dialog modal-xlg' role='document'><div class='modal-content'>" +
        "<div class='modal-header'><h5 class='modal-title' >" + txt_titre + "</h5>" +
        "<button type='button' class='close' data-dismiss='modal' aria-label='Close'>" +
        "<span aria-hidden='true'>&times;</span></button></div>" +
        "<div class='modal-body'>" + txt_info + "</div>" +
        "<div class='modal-footer'><button type='button' class='btn btn-secondary' data-dismiss='modal'> " +
        txt_bt_close + "</button></div></div></div></div>"

    if (event.data.math == true) {

        // @ts-ignore
        MathJax.typesetPromise().then(() => {
            $(id_container).html(html + "<hr/>")
            // @ts-ignore
            $(idModal).modal()
            // @ts-ignore
            MathJax.typesetPromise();
        }).catch((err) => console.log(err.message));
    } else {
        $(id_container).html(html)
        // @ts-ignore
        $(idModal).modal()
    }
}

export { dspModalInfo }

export function modal() {
    throw new Error("Function not implemented.")
}
