import * as E from "../modules/utils/errors.js"
import { Element, Div, Button, Img } from "../modules/dom.js";
import { insertDiese } from "../modules/utils/string.js";

/**
 * @class Infos
 * @classdesc
 * - Gestion et affichage d'une fenêtre modale pour afficher des informations
 * ***
 * ***export Infos***
 */
class Infos {

    /** Constructeur
     *
     * @param {object} info contient tous les paramètres nécessaires
     * @description info peut contenir  :
     * - idcontainer {string} ID du div caontainer
     * - title {string} titre
     * - msg {string?} message si non défini, il faut avoir la fonction 'setmsg' avec éventuellement les paramètres 'prm'
     * - idmodal {string?} id de la fenêtre modale (défaut = idModal)
     * - idbtclose {string?} id du bouton de fermeture (défaut = idBtClose)
     * - labelbtclose {string?} texte du bouton (défaut = "Quitter")
     * - actionbtclose {string?} action sur clic bouton
     * - latex {boolean?} le texte utilise latex (défaut = false)
     * - callbacks {string: function?} définit des actions sur clics dans message {id: fonction}
     * - setmsg {function?} fonction chargée de construire la chaîne 'msg' (défaut = undefined)
     * - prm {object?} paramètres utilisés par 'setmsg'
     */
    constructor(info) {
        if (!('idcontainer' in info) || !('title' in info) || !('msg' in info)) E.debugError(E.ERROR_OBJ)

        const defaults = { idmodal: 'idModal', idbtclose: 'idBtClose', labelbtclose: 'Quitter', actionBtClose: undefined, latex: false }
        const params = { ...defaults, ...info }


        this.idContainer = params.idcontainer
        this.title = params.title
        this.msg = params.msg
        this.idModal = params.idmodal
        this.idBtClose = params.idbtclose
        this.labelBtClose = params.labelbtclose
        this.actionBtClose = params.actionbtclose
        this.latex = params.latex
        this.callbacks = params.callbacks || undefined
        this.data = params.data || undefined
        this.setMsg = params.setmsg || undefined
        this.img = params.img || undefined



        // si action sur clic bouton fermeture
        if (this.actionBtClose != undefined && typeof this.actionBtClose == "function") {
            $(document).on("hide.bs.modal", "#" + this.idModal, function () {
                params.actionbtclose();
            });
        }

        // gère les callbacks
        if (params['callbacks'] != undefined) {
            let _key
            Object.keys(params['callbacks']).forEach((key) => {
                _key = insertDiese(key)
                $(document).on("click", _key, params['callbacks'][key]);
            });
        }
    }

    /** Construite la chaine html
     *
     * @returns {string} contenu html
     */
    init_html() {
        const divs = {},
            elts = {},
            buttons = {};

        elts.h5 = new Element("h5", { id: "modal-title" }).setText(this.title);
        elts.span = new Element("span", {})
            .setAria("hidden", "true")
            .setText("&times");
        buttons.close = new Button("")
            .addClass("close")
            .setData("dismiss", "modal")
            .setAria("label", "Close")
            .addChild(elts.span);
        divs.header = new Div("modal-header").addChild(elts.h5, buttons.close);

        // si image
        if (this.img) {
            this.img = encodeURI(this.img)
            divs.msg = new Div('row')
            divs.txt = new Div("col-9").setText(this.msg)
            const x = this.img
            const t = `height:100%; background :url("${x}") center/100%`

            divs.bloc_img = new Div("img-rounded").setStyle(t)
            divs.img = new Div("col-3").addChild(divs.bloc_img)
            divs.msg.addChild(divs.txt, divs.img)
            divs.body = new Div("modal-body").addChild(divs.msg)
        } else
            divs.body = new Div("modal-body").setText(this.msg);


        buttons.exit = new Button(this.labelBtClose)
            .addClass("btn btn-secondary")
            .setData("dismiss", "modal")
            .setID(this.idBtClose);
        divs.footer = new Div("modal-footer").addChild(buttons.exit);

        divs.content = new Div("modal-content").addChild(
            divs.header,
            divs.body,
            divs.footer
        );
        divs.dialog = new Div("modal-dialog modal-lg")
            .setRole("document")
            .addChild(divs.content);
        divs.modal = new Div("modal fade", this.idModal)
            .setData("dismiss", "modal")
            .setRole("dialog")
            .setTabIndex("-1")
            .setAria("hidden", "true")
            .addChild(divs.dialog);

        let html = divs.modal.getHTML();
        return html;
    }
}

export { Infos }