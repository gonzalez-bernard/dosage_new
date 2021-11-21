/** DOM - dom.js 
 * @module modules/DOM
 * @description Ensemble des classes permettant la gestion des pages html
 * ***
 * ***export  Element, Label, Input, P, Domus, Form, Button, Div, Img, Link, Alert, Message, List, dspMessage***
*/

import { uString } from "./utils/string.js"
import {uArray} from "./utils/array.js"
import {getEltID} from "./utils/html.js"
import {isObject, isFunction} from "./utils/type.js"

/** classe Element */
/**
 * @class Element
 * @classdesc Classe de base pour création structure DOM
 * @property {string} _elt identifiant de l'élément (ex : label)
 * @property {string} name nom 
 * @property {string} id ID
 * @property {object} style paramètres de style
 * @property {string} class nom des classes
 * @property {string} _text texte à afficher entre balises
 * @property {object} _childs objet enfant
 * @property {string[]} _attributes tableau des attributs
 * @property {string} _label texte label
 * @property {string} _div
 * @property {string} _role indique l'attribut role
 * @property {number} _tabIndex indice
 * @property {string} _action indique l'action à executer
 * 
  */
class Element {

    constructor(elt, o = null) {
        this._elt = elt
        this.name = o == null ? null : o.name
        this.id = o == null ? null : o.id
        this.style = o == null ? null : o.style
        this.class = o == null ? null : o.cls
        this._text = '' // texte à afficher entre balises
        this._childs = null
        this._attributes = null
        
        this._label = null
        this._div = null
        this._role = null
        this._tabindex = null
        this._action = null
    }

    /** ****************** SETTERS ********************/

    setElt(name, value){
        this[name] = value
        return this
    }

    /** Définit les attributs (ex: disabled)
     * 
     * @param  {...any} attr attributs
     * @returns {Element}
     */
    setAttrs(...attr) {
        for (const att in attr) {
            try {
                if (attr[att] == undefined)
                    throw ("Attribut absent")
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
     * @returns {Element}
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
        this.title = new uString(title).convertHtmlChar().html
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
     * @param {string} event déclencheur
     * @param {string} action action à faire
     * @param {boolean} escape échappe les caractères si True défaut = False
     * @returns {Element}
     */
    setAction(event, action, escape=false){
        if (! escape)
            this._action = event +'="' + action + '"'
        else
            this._action = event +'="' + new uString(action).convertHtmlChar().html + '"'
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
                    throw ("Enfant absent")
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
     * @returns {Element}
     */
    addClass(classe) {
        if (this.class == null)
            this.class = []
        this.class.push(classe)
        return this
    }

    /** Ajoute une div
     * 
     * @param {string} cls classe
     * @param {boolean} global si True place les attibuts avant la div
     * @returns {Element}
     */
    addDiv(cls = 'col', global = true) {
        this._div = cls
        this._global = global
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
     * @see getHTML
     * @returns {string} chaine HTML
     */
    getHTMLelt() {
        let html = ""
        html += "<" + this._elt + " "

        // parcours élément de la classe
        for (const prop in this) {
            if (this[prop] != null){
                if (prop.indexOf('_') == -1) {
                    html += prop + "='" + this[prop] + "' "
                } else {
                    switch (prop){
                        case "_action":
                            html += " "+ this[prop]+" "
                            break
                        case '_role':
                            html += " role = "+ this[prop]+" "
                            break
                    }
                }
            }
            
        }
        if (Array.isArray(this._attributes) && this._attributes.length > 0) {
            for (const att in this._attributes)
                html += this._attributes[att] + " "
        }

        html = html.slice(0, -1) + ">"
        html += this._text + "</" + this._elt + ">"

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

        // fonction interne
        function _setAttrs(o) {
            if (o._feedback != null)
                html += o._feedback
            if (o._label != null)
                html = o._label + html
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
        while (childs.length > 0) {
            let elt = childs[0]
            if (elt['_elt']=='img')
                var debug = 0
            let h = elt.getHTML()

            html = html.substring(0, pos) + h + html.substring(pos)
            pos += h.length
            childs.splice(0, 1)
        }
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

/************************************************** */

/** 
 * @class Domus
 * @classdesc  Sert à insérer des enfants en ayant déclaré le parent avant
 */
class Domus {
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

/************************************************** */

/**  
 * @classdesc Gestion des formulaires 
 * @extends Element
 * @property {object} action
 */
class Form extends Element {
    
    /**
     * 
     * @param {object} o définit action
     */
    constructor(o = null) {
        super('form', o)
        if (o !== null)
            this.action = 'action' in o ? '#' : o.action
    }
}

/************************************************** */

/**
 * @classdesc gestion des boutons
 * @extends Element 
 * @property {string} href lien
 * @property {string} type type de bouton
 */
class Button extends Element {

    /** Constructor
     * 
     * @param {string} [label] On définit le texte
     * @param {object} [o] on peut définit le lien (href) et le type (button)
     */
    constructor(label, o = {}) {
        super('button', o)
        this._text = label ? label : ''
        this.href = 'href' in o ? o.href : "#" 
        this.type = 'type' in o ? o.type : 'button'
    }
}

/************************************************** */

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
        this.for = ''
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

/************************************************** */

/**
 * @class Div
 * @classdesc création simplifiée des div
 * @extends Element
 */
class Div extends Element {
    constructor(cls, id = null) {
        super('div', { id, cls })
    }
}

/************************************************** */

/** 
 * @classdesc Gestion des champs input
 * @extends Element
 * @property {number} size taille
 * @property {string} _validFeedback texte feedback
 * @property {string} _errorFeedback texte feedback
 */
class Input extends Element {
    placeholder = ""

    /**
     * 
     * @param {string} type type de champ (checkbox, radio)
     * @param {object} o paramètres - on peut définir l'action et la valeur par défaut 
     */
    constructor(type, o = null) {
        super('input', o)
        this._validFeedback = null
        this._errorFeedback = null
        this.type = type
        if (o !== null) {
            this.action = 'action' in o ? '#' : o.action
            this.value = 'value' in o ? null : o.value
        }
        var prop, oElt
        Object.keys(o).forEach(key => {
            if (isObject(o[key])) {
                oElt = o[key]
                // si type = 'elt'
                if (key.substr(0,3) == 'elt') {
                    let data = Object.entries(oElt)
                    prop = data[0][0] + "-" + data[0][1].toLowerCase()
                    this[prop] = data[1][1]
                } else {
                    // on vérifie si une fonction existe en préfixant par 'add' 
                    let fct = new uString(key).capitalize().getVal()
                    fct = 'add' + fct
                    
                    // Détecte si l'élément est dans la classe, sinon on ajoute un underscore
                    prop = Input.prototype.hasOwnProperty(key) ? key : "_" + key

                    // Appel de la méthode
                    if (Input.prototype.hasOwnProperty(fct)) {
                        let data = Object.values(o[key])
                        let fct_ = Input.prototype[fct].bind(this)
                        // si feedback
                        if (key == "feedback"){
                            this[prop] = fct_(data[0][0], data[0][1], data[1])[prop]
                        } else 
                            this[prop] = fct_(data[0], data[1])[prop]
                    }
                }
            } else
                this[key] = o[key]
        })
    }

    /** Définit le nombre de caractères
     * 
     * @param {number} value taille en caractère du champ
     */
    setSize(value){
        this.size = value
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
     * @param {string} error texte si erreur
     * @param {string?} valid texte si OK
     * @param {object} o {id? offset cls} 
     * @returns {Input}
     */
    addFeedback(error, valid=undefined, {id, offset = 5, cls = ''}) {
        let _id = id || this.id + "_feedback"
        this._feedback = "<div class='row'><div class = 'col-" + offset + "'></div><div class = '" + cls +"'>"
        this._feedback += "<p class = 'error_feedback' id='invalid_" + _id + "'>" + error + "</p>"
        
        if (valid)
            this._feedback += "<p class='valid_feedback' id='valid_" + _id + "' >" + valid + "</p>"
        this._feedback += "</div></div>"
        return this
    }
    
    /** Définit les messages de feedback
     * 
     * @param {string} valid_feedback message
     * @param {string} error_feedback message
     * @returns {Input}
     */
    setFeedback(error_feedback = undefined, valid_feedback = undefined) {
        this._errorFeedback = error_feedback || "" 
        this._validFeedback = valid_feedback || ""

        return this
    }

    /** Définit le titre
     * 
     * @param {string}  title titre  
     * @returns {Input}
     */
    setTitle(title) {
        this.title = title
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
        if (o !== null && 'cls' in o) {
            classe += " " + o.cls
        }

        this._label = "<label for='" + this.id + "' class='" + classe + "'>" + label + "</label>"
        return this
    }

}

/************************************************** */

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

/************************************************** */

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

/************************************************** */

/**
 * @classdesc Gestion image
 * @extends Element
 */
class Img extends Element {

    /** Constructeur
     * 
     * @param {string} src url image
     * @param {object} o 
     */
    constructor(src, o = null){
        super('img', o)
        this.src = src
        if (o !== null) {
            this.cls = 'cls' in o ? o.cls : ''
            this.alt = 'alt' in o ? o.alt : ''
            this.width = 'w' in o ? o.w : 100
        }
    }

    setSrc (src){
        this.src = src
        return this
    }

    setAlt (alt){
        this.alt = alt
        return this
    }

    setWidth(w){
        this.width = w
        return this
    }

    setHeight(h){
        this.height = h
        return this
    }
}

/************************************************** */

/**
 * @class Alert
 * @classdesc Gestion alert
 * @property {string} id ID
 * @property {string} type type de l'alerte
 * @property {string} msg message
 * @property {Element} div div englobante
 * @property {Element} icon image
 * @property {Button} but bouton
 */
class Alert {
    constructor(id, type, message = ''){
        this.id = id
        this.type = type
        this.msg = message
        this.div = new Div('alert alert-' + type, this.id).setStyle('display:none').setRole('alert')
        this.msg = new Element('span',{id:this.id+"_msg"}).setText(this.msg)
        let but = new Button('', { cls: 'close' }).setAria('label', 'close')
        let icon = new Element('span').setAria('hidden','true').setText('&times').setAction("onClick","$(this).parent().parent().hide()")
        but.addChild(icon)
        this.div.addChild(this.msg, but)
    }
    
    apply(){
        return this
    } 
}

/************************************************** */

/**
 * @class List
 * @classdesc Ajoute les items d'une liste
 * @param {array} list liste des items
 */
class List extends Element {
    constructor(list, cls='', o= null){
        super('ul',{cls:cls})
        var items = []
        for (var i in list) {
            items.push(new Element('li'))
            items[i].addChild(list[i])
            this.addChild(items[i])
        }
    }

}

/************************************************** */

/**  
 * @classdesc Crée la structure pour afficher un message temporaire
 * @param {object} o o.msg = message o.duration = durée
 */
class Message{

    /** Constructur
     * 
     * @param {string} id identifiant 
     * @param {string} type 'success, warnong, error' 
     * @param {object} o informations supplémentaires
     *  msg {string} message à afficher
     *  d {numeric} durée d'affichage 
     */
    constructor(id, type, o = null){
        this.id = id
        this.type = type
        if (o != null){
            this.msg = 'msg' in o ? o.msg : ''
            this.duration = 'd' in o ? o.d : 2000
        }
        this.div = new Div('alert alert-'+this.type, this.id).setStyle('display:none')
        this.elt = new Element('strong',{id:this.id+'_msg'}).setText(this.msg)
        this.div.addChild(this.elt)
    }
}

/************************************************** */

/** Affiche un message
 * 
 * @param {string} id ID
 * @param {string} msg message
 * @param {number} duree durée
 */
var dspMessage = function(id, msg, duree){
    getEltID( id + "_msg" ).html( msg )
    let elt = getEltID(id)
    elt.fadeTo(duree, 100).slideUp(500, function () {
      elt.hide()
    })
}

export { Element, Label, Input, P, Domus, Form, Button, Div, Img, Link, Alert, Message, List, dspMessage }