/** DOM - dom.js 
 * @module modules/DOM
 * @description Ensemble des classes permettant la gestion des pages html
 * ***
 * ***export  Element, Label, Input, P, Domus, Form, Button, Div, Img, Link, Alert, Message, List, dspMessage, ListMenu, Dialog
 * ***
 */

import { uString } from "./utils/string.js"
import { uArray } from "./utils/array.js"
import { getEltID } from "./utils/html.js"
import { isArray, isObject} from "./utils/type.js"

/** classe Element */
/**
 * @class Element
 * @classdesc Classe de base pour création structure DOM
 * @file 'modules/dom.js'
 */
class Element {

    /**
     * 
     * @param {string} elt type de l'élément
     * @param {object?} o objet définissant les propriétés de l'élément
     *  - text : 
     *  - parent {string} : nom du parent
     *  - tabindex {number} : indice de la tabulation
     *  - name {string} : nom de l'élément
     *  - id {string} : ID
     *  - style {string} : style
     *  - class {string} : classe
     *  - ext :
     *  - feedback: 
     *  - title {string} : titre
     *  - width {number} : largeur de 1 à 12
     *  - attrs:
     *  - role {} : 
     * 
     */
    constructor(elt, o = null) {
        const local = ['text', 'parent', 'tabindex', 'ext', 'feedback', 'role', 'width', 'options']
        const valid = ['name', 'id', 'style', 'class'] 
        this._elt = elt
        this._div = null    // div englobante utilisée par exemeple pour alert
        this._global = null // pas utilisée
        this._attributes = []
        this.class = []
        if (o) {
            for (let key in o) {
                if (local.includes(key))
                    this["_" + key] = o[key]
                else {
                    switch (key) {
                        case "title":
                            this.setTitle(o[key])
                            break;
                        case "attrs":
                            this.setAttrs(o[key])
                            break;
                        default:
                            if (valid.includes(key))
                                this[key] = o[key]
                    }
                }
            }
        }
    }

    /** ****************** SETTERS ********************/

    /** Définit les attributs (ex: 'disabled')
     * Chaque attribut est séparé par une virgule
     * 
     * @param  {...any} attr attributs
     * @returns {Element}
     */
    setAttrs(...attr) {
        for (const att in attr) {
            try {
                if (attr[att] == undefined)
                    throw new TypeError("Attribut absent")
                if (this._attributes == null)
                    this._attributes = []
                this._attributes.push(attr[att])
            } catch (err) {
                console.error(err)
            }
        }
        return this
    }

    /** Définit l'id
     * 
     * @param {number|string} id 
     * @returns {(Element|Input)}
     */
    setID(id) {
        this.id = id
        return this
    }

    /** Définit le texte
     * 
     * @param {string} txt 
     * @returns {Element}
     */
    setText(txt) {
        this._text = txt
        return this
    }

    /** Définit le titre
     * 
     * @param {string} title 
     * @returns {Element}
     */
    setTitle(title) {
        //this.title = new uString(title).convertHtmlChar().html
        this.title = title
        return this
    }

    /** Définit le nom
     * 
     * @param {string} name 
     * @returns {Element} 
     */
    setName(name) {
        this.name = name
        return this
    }

    /** insère parent
     * 
     * @param {String|Element} parent 
     * @returns {Element}
     */
    setParent(parent) {
        this._parent = parent
        return this
    }

    /** Précise le role
     * 
     * @param {string} value role
     * @returns {Element}
     */
    setRole(value) {
        this._role = value
        return this
    }

    /** Précise l'indice de la tabulation
     * 
     * @param {string} value indice
     * @returns {Element}
     */
    setTabIndex(value) {
        this._tabindex = value
        return this
    }

    /** Précise l'action
     * 
     * @param {string|string[]} event déclencheur
     * @param {string|string[]} action action à faire
     * @param {boolean} escape échappe les caractères si True défaut = False
     * @returns {Element}
     */
    setAction(event, action, escape = false) {
        let _action = ""
        if (!escape)
            if (isArray(event)){
                // @ts-ignore
                event.forEach(function(e, index){
                    // @ts-ignore
                    _action += e + "=" + action[index] +" "
                })
            } else
                _action = event + "=" + action +" "
        else
            if (isArray(event)){
                // @ts-ignore
                event.forEach(function(e, index){
                    // @ts-ignore
                    _action += e + "=" + new uString(action[index]).convertHtmlChar().html +" "
            })
        } else
            // @ts-ignore
            _action = event + "=" + new uString(action).convertHtmlChar().html + " "
        
        this._action = _action
        return this
    }

    /** Définit les données data
     * 
     * @param {string} type type de data
     * @param {string} value valeur
     * @returns {Element}
     */
    setData(type, value) {
        let elt = "data-" + type.toLowerCase()
        this[elt] = value
        return this
    }

    /** Ajoute un style
     * 
     * @param {string} style nom:valeur (ex display:None)
     * @returns {Element}
     */
    setStyle(style) {
        this.style = style
        return this
    }

    /** Définit les données aria
     * 
     * @param {string} type type 
     * @param {string} value valeur
     * @returns {Element}
     */
    setAria(type, value) {
        let elt = "aria-" + type.toLowerCase()
        this[elt] = value
        return this
    }

    /** Ajoute les enfants
     * 
     * @param  {...Element} child Element enfant
     * @returns {Element}
     */
    addChild(...child) {
        for (const elt in child) {
            try {
                if (child[elt] == undefined)
                    throw new TypeError("Enfant absent")
                if (this._childs == null)
                    this._childs = []
                this._childs.push(child[elt])
            } catch (err) {
                console.error(err)
            }
        }
        return this
    }

    /** Ajoute une classe au tableau 'class'
     * 
     * @param {string} classe 
     * @returns {(Element|Input)}
     */
    addClass(classe) {
        if (this.class == null)
            this.class = []
        this.class.push(classe)
        return this
    }


    /*********************  GETTERS ************************* */

    /** Récupère les enfants
     * 
     * @returns {Element[]}
     */
    getChilds() {
        if (this._childs == null)
            this._childs = []
        return this._childs
    }

    /** Crée la structure de base d'un élément
     * 
     * @returns {string} chaine HTML
     */
    getHTMLelt() {
        let html = ""
        html += "<" + this._elt + " "

        // parcours élément de la classe
        for (const [prop, value] of Object.entries(this)) {
            if (value != null) {

                // propriétés natives
                if (prop.indexOf('_') == -1 && value != "" && value != []) {
                    html += prop + "='" + value + "' "
                } else { // sinon
                    switch (prop) {
                        case "_action":
                            html +=  value
                            break
                        case '_role':
                            html += " role = '" + value + "' "
                            break
                        case '_attributes':
                            this._attributes.forEach(att => {
                                html += " " + att + " "
                            })
                            break
                    }
                }
            }
        }
       
        html = html.slice(0, -1) + ">"
        if (this._text)
            html += this._text + "</" + this._elt + ">"
        else
            html += "</" + this._elt + ">"

        // champs input ou bouton
        if (this._elt == 'input' || this._elt == 'button') {
            if (this._div != null) {
                if (this._global) {
                    _setAttrs(this)
                    html = "<div class='" + this._div + "'>" + html + "</div>"
                } else {
                    html = "<div class='" + this._div + "'>" + html + "</div>"
                    _setAttrs(this);
                }
            } else {
                _setAttrs(this);
            }
        }

        /** Ajoute un élément feedback ou label au champ input
         * 
         * @param {object} o 
         */
        function _setAttrs(o) {
            // on construit la chaîne feedback
            if (o._feedback != null){
                o.addFeedback(o._feedback)
                html += o._feedback
            }
            if (o._label != null){
                o.addLabel(o._label.label, o._label.o)
                html = o._label + html
            }
                
        }

        return html
    }

    // 
    /** Crée la structure avec ses enfants
     * 
     * @use getHTMLelt
     * @returns {string} chaine HTML
     */
    getHTML() {
        let html = this.getHTMLelt()

        // récupère les enfants
        let childs = this.getChilds()
        var pos = html.indexOf("</")
        let h
        childs.forEach((elt) => {
            h = elt.getHTML()

            html = html.substring(0, pos) + h + html.substring(pos)
            pos += h.length
            //childs.splice(0, 1)
        })
        return html
    }

    /*********************  REMOVERS *********************** */

    /** Supprime une classe
     * 
     * @param {string} classe nom de la classe
     * @returns {Element}
     */
    removeClass(classe) {
        new uArray(this.class).delArrayElement(classe)
        return this
    }

    /** Supprime un style
     * 
     * @returns {Element}
     */
    removeStyle() {
        this.style = ""
        return this
    }
}

/**
 * Il faut définir 
 *  - la structure html du formulaire
 * 
 * <form>
 *  <fieldset>
 *      <label class="col col-form-label"></label>
 *      <div class="form-group col">
 *          <div class="row">
 *              <label class="col-form-label col-md-x"></label>
 *              <div class="col-md-(12-x)">
 *                  <input class="text ui-widget-content ui-corner-all">
 *              </div>
 *          </div>
 *      </div>
 *  </fieldset>
 * </form>
 * 
 *  - les paramètres
 *  const prm = {
 *      autoOpen: false,
 *      height: 'auto',
 *      width: 'auto',
 *      position: {my: 'center', at: "center"},
 *      modal: true,
 *      title: "Titre",
 *      buttons: {
 *      "Action": action,
 *      "Annule": closeDialog,
 *      "...": ...
 *  }
 * }
 * 
 * action et closeDialog sont des fonctions
 * 
 * La construction du dialogue se réalise avec :
 * const diag = new dom.Dialog("dialog-form", form, prm)
 * dialog-form est l'id d'une balise <div></div>
 */
class Dialog{
    
    /** Crée un dialogue
     * 
     * @param {string} idDialog id du div qui contient le dialogue
     * @param {Object} form objet contenant le formulaire
     * @param {Object} diag paramètres du dialogue
     * 
     * diag contient les paramètres  
     * 
     * Le fichier 'dialog.js' est indispensable 
     */
    constructor(idDialog, form, diag){
        this.idDialog = idDialog
        this.form = form
        // @ts-ignore
        this.dialogue = $("#"+this.idDialog).dialog(diag)
        $("#"+this.idDialog).html(this.form.getHTML())
    } 


    /** Affiche la boite de dialogue
     * 
     */
    display(){
        this.dialogue.dialog('open')
    }

    /** Ferme le dialogue
     * 
     */
    hide() {
        this.dialogue.dialog('close')
    }

    getInputs(){
        let val = []
        let o
        const tab = $($(this.dialogue)[0].children[0]).find("input")
        // @ts-ignore
        tab.each((index, elt) => {
            o = {name:elt.name, id:elt.id, val:elt.value}
            val.push(o)
        })
        return val
    }
}

/** 
 * @class Domus
 * @classdesc  Sert à insérer des enfants en ayant déclaré le parent avant
 */
class Domus {
    
    /**
     * 
     * @param {Element} parent élément parent 
     */
    constructor(parent) {
        this._parent = parent
    }

    /** Ajoute des enfants
     * 
     * @param  {...Element} childs enfants 
     */
    setChilds(...childs) {
        for (const elt in childs) {
            this._parent.addChild(childs[elt])
        }
    }
}

/**  
 * @classdesc Gestion des formulaires 
 * @extends Element
 * @property {object} action
 */
class Form extends Element {

    /**
     * 
     * @param {object} o définit les propriétés de l'élément
     * - propriétés spécifiques :
     *   -- action {string} définit l'action
     */
    constructor(o = null) {
        super('form', o)
        if (o !== null)
            this.action = 'action' in o ? '#' : o.action
    }
}

/**
 * @classdesc gestion des boutons
 * @extends Element 
 * @property {string} href lien
 * @property {string} type type de bouton
 */
class Button extends Element {

    /** Constructor
     * 
     * @param {string | undefined} label On définit le texte
     * @param {object?} o on peut définir :
     * - href {string} le lien ("#") 
     * - type {string} (button)
     */
    constructor(label, o = {}) {
        super('button', o)
        this._text = label
        this.href = 'href' in o ? o.href : "#"
        this.type = 'type' in o ? o.type : 'button'
    }
}

/** 
 * @extends Element 
 * @property {string} for 
 */
class Label extends Element {

    /** Constructeur
     * 
     * @param {string} label On définit le texte
     * @param {object} o on peut définit le label
     */
    constructor(label, o = null) {
        super('label', o)
        this._text = label // text
    }

    /** Définit lien sur label
     * 
     * @param {string} id id du champ input 
     * @returns {Element}
     */
    setFor(id) {
        this.for = id
        return this
    }
}

/**
 * @class Div
 * @classdesc création simplifiée des div
 * @extends Element
 */
class Div extends Element {

    /**
     * 
     * @param {string?} classe 
     * @param {string?} id 
     */
    constructor(classe = null, id = null) {
        super('div', { class: classe, id: id })
    }
}

/** 
 * @classdesc Gestion des champs input
 * @extends Element
 * 
 */
class Input extends Element {
    placeholder = ""

    /**
     * 
     * @param {string} type type de champ (checkbox, radio)
     * @param {object} o paramètres on peut définir:
     * - label {string?} : label
     * - feedback {object?} : {feedback: [invalid, valid], o: { offset: 8, class: "col-md-4" } 
     * - type {string} : type d'input
     * - value {string} : valeur du champ
     * - size {number} : taille du champ
     * - min, max {number} : valeurs extrémales
     * - pattern {string} : chaîne de validation
     * - placeholder {string} : texte d'information affiché dans le champ
     */
    constructor(type, o = {}) {
        super('input', o)
        this._label = null || o.label;
        this._feedback = null || o.feedback
        this.type = type
        const local = ["label", "feedback"]
        const valid = ["value","size","max","min","pattern","placeholder"]
        if (o) {
            for (let key in o) {
                if (local.includes(key))
                    this["_" + key] = o[key]
                else if (valid.includes(key))
                    this[key] = o[key]
            }
        }

        var prop, oElt
        for (const key in this) {
            if (isObject(this[key]) || isArray(this[key])) {
                oElt = this[key]
                let data, fct
                switch (key) {
                    // tableau d'objets
                    case '_ext':
                        
                        // @ts-ignore
                        oElt.forEach(element => {
                            data = Object.entries(element)
                            prop = data[0][0] + "-" + data[0][1].toLowerCase()
                            this[prop] = data[1][1]    
                        });
                        
                        break
                    case 'default':
                        // on vérifie si une fonction existe en préfixant par 'add' 
                        fct = new uString(key).capitalize().getVal()
                        fct = 'add' + fct

                        // Détecte si l'élément est dans la classe, sinon on ajoute un underscore
                        prop = Object.prototype.hasOwnProperty.call(Input, key) ? key : "_" + key

                        // Appel de la méthode
                        if (Object.prototype.hasOwnProperty.call(Input, fct)) {
                            let data = Object.values(o[key])
                            let fct_ = Input.prototype[fct].bind(this)
                            // si feedback
                            if (key == "feedback") {
                                this[prop] = fct_(data[0][0], data[0][1], data[1])[prop]
                            } else
                                this[prop] = fct_(data[0], data[1])[prop]
                        }
                }
            }
        }
    }

    /** Définit le nombre de caractères
     * 
     * @param {number} value taille en caractère du champ
     */
    setSize(value) {
        this.size = value
        return this
    }

    setMaxLength(value){
        this.maxlength = value
        return this
    }

    /** Définit le motif de validation
     * 
     * @param {string} pattern motif de validation
     * @returns {Input}
     */
    setPattern(pattern) {
        this.pattern = pattern
        return this
    }

    /** Définit le texte d'information
     * 
     * @param {string} placeholder texte information
     * @returns {Input}
     */
    setPlaceholder(placeholder) {
        this.placeholder = placeholder
        return this
    }

    /** Définit la valeur
     * 
     * @param {string | number} value valeur   
     * @returns {Input}
     */
    setValue(value) {
        this.value = value
        return this
    }

    /** Insère un élément pour affichage du feedback
     * 
     * @param {object} oFeed {id? offset cls} 
     * @returns {Input}
     */
    addFeedback(oFeed) {
        const id = oFeed.o.id || this.id + "_feedback"
        const offset = oFeed.o.offset || 5
        const cls = oFeed.o.class || "feedback"
        const msgs = oFeed.feedback
        
        // si type inline
        if (oFeed.o.type && oFeed.o.type == 'inline'){
            this._feedback = "<p class = 'error_feedback' id='invalid_" + id + "'>" + msgs[0] + "</p>"    
        } else {
            this._feedback = "<div class='row'><div class = 'col-" + offset + "'></div><div class = '" + cls + "'>"
            this._feedback += "<p class = 'error_feedback' id='invalid_" + id + "'>" + msgs[0] + "</p>" 
        }
        
        if (msgs.length > 1)
            this._feedback += "<p class='valid_feedback' id='valid_" + id + "' >" + msgs[1] + "</p>"
        this._feedback += "</div></div>"
        return this
    }

    /** Définit les messages de feedback
     * 
     * @param {string[]} msgs messages
     * @param {object} prm parametres
     * @returns {Input}
     */
    setFeedback(msgs, prm) {
        this._feedback = {feedback: msgs, o: prm}
        return this
    }

    /** Ajoute un label
     * 
     * @param {string} label texte
     * @param {object} o
     * @returns {Input}
     */
    addLabel(label, o = null) {
        let classe = "col-form-label"
        if (o !== null && 'class' in o) {
            classe += " " + o.class
        }

        this._label = "<label for='" + this.id + "' class='" + classe + "'>" + label + "</label>"
        return this
    }

}

/**
 * @classdesc Paragraphe
 * @extends Element
 */
class P extends Element {

    /** Constructeur
     * 
     * @param {string} text
     * @param {object} o
     */
    constructor(text, o = null) {
        super('p', o)
        this._text = text
    }
}

class Span extends Element{

    constructor(text, o=null) {
        super("span",o)
        this._text = text
    }
}

/**
 * @classdesc Ajoute lien (href)
 * @extends Element
 */
class Link extends Element {

    /**
     * 
     * @param {string} ref lien
     * @param {object} o 
     */
    constructor(ref, o = null) {
        super('a', o)
        this.href = ref
    }
}

/**
 * @classdesc Gestion image
 * @extends Element
 */
class Img extends Element {

    /** Constructeur
     * 
     * @param {string} src url image
     * @param {object} o 
     * - alt {string?} texte alternatif
     * - width 'number?} taille
     */
    constructor(src, o = null) {
        super('img', o)
        this.src = src
        const local = ["label", "feedback"]
        const valid = ["alt","crossorigin","decoding", "height", "ismap", "max","min","pattern","placeholder", "width"]
        if (o) {
            for (let key in o) {
                if (local.includes(key))
                    this["_" + key] = o[key]
                else if (valid.includes(key))
                    this[key] = o[key]
            }
        }
        for (const key in o){
            this[key] = o[key]
        }
    }

    setSrc(src) {
        this.src = src
        return this
    }

    setAlt(alt) {
        this.alt = alt
        return this
    }

    setWidth(w) {
        this._width = w
        return this
    }

    setHeight(h) {
        this.height = h
        return this
    }
}

/**
 * @class Alert
 * @classdesc Gestion alert
 */
class Alert {

/**
 * 
 * @param {string} id ID
 * @param {string} type type de l'alerte
 * @param {string} message message
*/ 
    constructor(id, type, message) {
        this.id = id
        this.type = type
        this.msg = message
        this._div = new Div('alert alert-' + type, this.id).setStyle('display:none').setRole('alert')
        this.msg = new Element('span', { id: this.id + "_msg" }).setText(this.msg)
        let but = new Button('', { class: 'close' }).setAria('label', 'close')
        let icon = new Element('span').setAria('hidden', 'true').setText('&times').setAction("onClick", "$(this).parent().parent().hide()")
        but.addChild(icon)
        this._div.addChild(this.msg, but)
    }

    apply() {
        return this
    }
}

/**
 * @class List
 * @classdesc Ajoute les items d'une liste
 */
class List extends Element {

    /**
     * 
     * @param {Element[]} list liste des items 
     * @param {string?} cls classe
     */
    constructor(list, cls = '') {
        super('ul', { class: cls })
        var items = []
        for (var i in list) {
            items.push(new Element('li'))
            items[i].addChild(list[i])
            this.addChild(items[i])
        }
    }

}

/**  
 * @classdesc Crée la structure pour afficher un message temporaire
 * @param {object} o o.msg = message o.duration = durée
 */
class Message {

    /** Constructur
     * 
     * @param {string} id identifiant 
     * @param {string} type 'success, warnong, error' 
     * @param {object} o informations supplémentaires
     *  msg {string} message à afficher
     *  d {numeric} durée d'affichage 
     */
    constructor(id, type, o = null) {
        this.id = id
        this.type = type
        if (o != null) {
            this.msg = 'msg' in o ? o.msg : ''
            this.duration = 'd' in o ? o.d : 2000
        }
        this.div = new Div('alert alert-' + this.type, this.id).setStyle('display:none')
        this.elt = new Element('strong', { id: this.id + '_msg' }).setText(this.msg)
        this.div.addChild(this.elt)
    }
}

/** Affiche un message
 * 
 * @param {string} id ID du container
 * @param {string} msg message
 * @param {number} duree durée
 */
const dspMessage = function (id, msg, duree) {
    getEltID(id + "_msg").html(msg)
    let elt = getEltID(id)
    elt.fadeTo(duree, 100).slideUp(500, function () {
        elt.hide()
    })
}

export { Element, Label, Input, P, Domus, Form, Button, Div, Img, Link, Alert, Message, List, dspMessage, Span, Dialog }