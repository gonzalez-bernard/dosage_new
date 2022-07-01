/**
 * @class Listmenu
 * @classdesc Gènère un menu déroulant 
 * Ce menu peut contenir jusqu'à 4 items
 * 
 * La structure du menu est la suivante :
 * <div id='root menu'>  // structure externe présente dans le fichier HTML
 *    <div class = 'container-fluid' id = 'nom menu'>   // id = this._idMenu, div = this._menu
 *      <div class = 'row'>  
 *        <button id = 'btMenu'>   // identifié par this._idBtMenu
 *        </button> 
 *      </div> 
 *      <div class = 'container-fluid menu-list' id = 'nom menu_lstMenu'> // id = this.idLstmenu div = this.*      lstmenu
 *          <div class = 'row menu-item-row>...</div>
 *          ...........
 *      </div>
 *    </div>
 * </div>
 * 
 * 
 * La structure nécessaire est :
 *  - un objet (prop) contenant :
 *      - un label (label) affiché sur le bouton
 *      - l'id (id) du bouton
 *      - l'id (idMenu) du menu
 *      - l'id (idRootMenu) du conteneur
 *      - la largeur (width)
 *      - l'activation (enabled)
 * - l'objet (rows) contenant la structure :   
 *      - un tableau comportant l'ensemble des lignes
 *      - chaque ligne est constituée d'un tableau d'objets qui seront les items affichés
 *      - chaque item peut-etre:
 *          - un texte avec éventuellement lien et/ou action
 *          - une image avec lien et/ou action
 * La structure d'un item est un objet :
 *  {
 *      type: label|img,    // type d'item 
 *      content: [text0,...]|[img0,...],    // contenu à afficher
 *      options: {idx, prev_idx} : // indices du contenu en cours et du précédent
 *      previousIdx: // indice précédent
 *      class: (class|.),   // classe
 *      id: (id|.),     // ID
 *      action: function,    // fonction
 *      visible: true|false, // visibilité
 *      tooltip: info   // message d'information
 *      link: lien 
 * }
 * 
 */

import { insertDiese } from "./utils/string.js"
import { Div, Button, Label, Link, Img, Span } from "./dom.js"
import { uArray } from "./utils/array.js"

class ListMenu {

    /**
     * 
     * @param {Object} prop 
     * @param {Object[][]} struct 
     */
    constructor(prop, struct) {
        this._html = ""     // contient le code html à insérer
        this._label = prop.label    // label du bouton
        this._idBtMenu = prop.idBtMenu    // id du bouton
        this._idRootMenu = prop.idRootMenu   // id du div container 
        this._idMenu = prop.idMenu    // id du menu
        this._idLstMenu = prop.idMenu + "_lstmenu"    // id du div contenant les items 
        this._width = prop.width || '16em'      // largeur du menu
        this._active = prop.enabled || true     // indique si le menu est actif
        this._menu = new Div("container-fluid", this._idMenu)       // div englobant le menu
        this._lstMenu = new Div("container-fluid menu-list", this._idLstMenu)   // div englobant les items
        this._divButton = new Div("row")     // div contenant le bouton
        this._rows = []     // Contient chaque ligne du menu
        this._items = []    // contient chaque item
        this._divmenu_c = []
        this._divmenu_cr = []
        struct.forEach((objArray) => {
            this._rows.push(objArray)
        })
    }

    /** Retourne tableau des lignes (row)
     * 
     * @returns {array}
     */
    getRows() {
        return this._rows
    }

    /** Retourne tableau des items
     * 
     * @returns {array}
     */
    getItems() {
        return this._items
    }

    /** Génère bouton principal
     * les paramètres sont :
     * - le label
     * - l'ID
     */
    createButton() {
        const elt = new Button(this._label, { id: this._idBtMenu, class: "btn btn-success float-left" })
        this._divButton.addChild(elt)
    }

    /** Génère les items
     * Remplit le tableau _items à partir du tableau _rows avec les éléments
     * @use _createElements
     */
    createElements() {
        this._items = []
        let elts
        this._rows.forEach((row) => {
            elts = this._createElements(row)
            this._items.push(elts)
        })
    }

    /** Crée chaque élement présent dans une ligne de menu
     * 
     * @param {object[]} row 
     * @returns {any[]}
     */
    _createElements(row) {
        const elts = []
        row.forEach((item) => {

            const link = item.link ? item.link : "#"
            const id = item.id ? item.id : undefined
            const _class = item.class || ''
            const _width = item.width >= 0 ? item.width : undefined
            const _visible = item.visible == undefined ? true : item.visible
            const _tooltip = item.tooltip || undefined
            const _idx = item.idx || 0

            let classe, data, o, style
            style = !_visible ? "visibility:hidden" : ""

            if (item.type == 'label') {
                classe = 'no-marge ' + _class
                o = { class: classe, text: item.content[_idx], width: _width, tooltip: _tooltip }
                o = id ? { ...o, id: id } : o
                if (link == "#")
                    elts.push(new Label(item.content[_idx], o).setStyle(style))
                else
                    elts.push(new Link(link, o).setStyle(style))
            } else {
                classe = 'menu-icone ' + _class
                o = { class: classe, data: item.content, width: _width, tooltip: _tooltip, options: { idx: _idx, prev_idx: _idx }, 0: 0 }
                o = id ? { ...o, id: id } : o
                elts.push(new Img(item.content[_idx], o).setStyle(style))
            }
        })
        return elts
    }

    /** Calcule la largeur des colonnes
     * 
     * @param {object[]} items 
     * @returns {number[]}
     */
    _calcWidthRow(items) {
        let width = 0  // largeur (nombre de colonnes) défini dans items.width
        let nbFull = 0 // nombre d'items ayant une largeur défini dans items.width
        const sizes = []
        items.forEach((item) => {
            if (item._width >= 0) {
                nbFull += 1
                width += parseInt(item._width)
                sizes.push(item._width)
            } else
                sizes.push(-1)
        })
        // nombre de cases restantes
        const nbEmpty = items.length - nbFull
        const w = (12 - width) / nbEmpty

        // initialise les largeurs nulles
        let res = sizes.map(x => { return (x == -1) ? w : x })
        return res
    }

    /** Retourne un tableau précisant les classes en tenant compte de la taille
     * 
     * @param {number[]} colWidths tableau des largeurs des colonnes 
     * @return {string[]}
     */
    _getClasses(colWidths) {
        let classes = new uArray(this._calcWidthRow(colWidths)).int2str()
        classes = classes.map((x, index) => {
            if (parseInt(x) == 0)
                return " menu-item-nodisplay"
            else {
                const d = parseInt(x)
                return "col-" + d + " menu-item"
            }
        }
        )
        return classes
    }

    /** Ajoute une ligne de menu
     * 
     * @param {object[]} row
     * @file dom.js
     */
    insertItems(row) {
        const items = this._createElements(row)
        let elt

        // calcule la classe en fonction de la largeur de chaque item dans la ligne
        let classes = this._getClasses(items)
        this._rows.push(row)
        this._items.push(items)
        elt = this._createColItems(items, classes)
        this._divmenu_c.push(elt)
        elt = this._createRowItems(elt, "row menu-item-row")
        this._divmenu_cr.push(elt)
        this._lstMenu.addChild(elt)
    }

    /** Génère les colonnes abritant les items
     * 
     * @param {number|undefined} width largeur 
     * @use _createColItems
     */
    createColItems(width = undefined) {
        if (!width && this._items.length == 0) return
        const size = width ? 12 / width : 12 / this._items[0].length
        const classe = ["col-" + size + " menu-item"]

        this._items.forEach(items => {
            this._divmenu_c.push(this._createColItems(items, classe))
        })
    }

    /** Crée les éléments présents dans une ligne
     * 
     * @param {object[]} items 
     * @param {string[]} classe 
     * @returns {any[]}
     */
    _createColItems(items, classe) {
        const row = []
        if (classe.length > 1) {
            for (let i = 0; i < items.length; i++) {
                if (items[i].tooltip) {
                    row.push(new Div(classe[i] + " mtooltip").addChild(items[i], new Span(items[i].tooltip)))
                } else
                    row.push(new Div(classe[i]).addChild(items[i]))
            }
        } else {
            items.forEach(item => {
                // @ts-ignore
                if (item.tooltip) {
                    row.push(new Div(classe[0] + " mtooltip").addChild(item, new Span(item.tooltip)))
                } else
                    // @ts-ignore
                    row.push(new Div(classe[0]).addChild(item))
            })
        }
        return row
    }

    /** Génère les lignes
     * 
     * @use _createRowItems
     * @file dom.js
     */
    createRowItems() {
        const classe = "row menu-item-row"
        let elt
        this._divmenu_c.forEach(row => {
            elt = this._createRowItems(row, classe)
            this._divmenu_cr.push(elt)
        })
        // création div groupe


        this._divmenu_cr.forEach(item => {
            this._lstMenu.addChild(item)
        })
    }

    /**
     * 
     * @param {object[]} row 
     * @param {string} classe 
     * @returns {Div}
     */
    _createRowItems(row, classe) {
        const elt = new Div(classe)
        row.forEach(item => {
            elt.addChild(item)
        })
        return elt
    }

    /** Génère le menu
     * 
     * @returns {string}
     */
    createMenu() {
        this.createButton()
        this.createElements()
        this.createColItems()
        this.createRowItems()
        return this.getHtmlMenu()
    }

    /** Retourne le contenu HTML du menu
     * 
     * @returns {string} contenu html 
     */
    getHtmlMenu() {
        let style = "position:absolute; top:0; left: 1em; width: " + this._width
        if (this._divmenu_c.length == 0)
            style += "; display:none"
        else
            style.replace("display:none", "display:block")

        //this._menu = new Div("container-fluid")
        //this._menu_fond = new Div("menu-content", this._idMenu).addChild(this.divmenu_s[1])
        //this._lstMenu.addChild(this.divmenu_s[1])
        this._menu.addChild(this._divButton, this._lstMenu).setStyle(style)
        this._html = this._menu.getHTML()
        return this._html
    }

    /** Recalcule la page html à partir de this._html
     * 
     * @returns {string} menu HTML
     */
    updateMenu() {
        this._html = this._menu.getHTML()
        return this._html
    }

    /** Affiche le menu et initialise les events
     * 
     * @param {string} id id de la page web
     * @param {boolean} display indique si on doit afficher le menu
     * @file dom.js
     */
    displayMenu(id, display = false) {
        $(insertDiese(this._idRootMenu)).html(this._html)
        //this.displayEvents()
        //this.changeIconEvents()
        this.actionEvents()
        if (display)
            $(insertDiese(this._idMenu)).show()
    }

    /** Initialise les listeners dans les items du menu
     * 
     */
    actionEvents() {
        this._rows.forEach((row) => {
            row.forEach((elt) => {
                if (elt.id && elt.action) {
                    $(insertDiese(elt.id)).off("click")
                    $(insertDiese(elt.id)).on("click", elt.action)
                }
            })
        })
    }

    /** Gère le changement d'icone sur clic dans menu
     * Le clic sur l'icone lance l'action définie dans 'action'
     * Celle-ci peut modifier l'index de l'icone, on l'utilise pour actualiser l'icone
     * Si l'action ne gère pas l'index, dans ce cas l'index est identique au précédent
     * Dans ce cas, on incrémente l'index de façon à boucler sur le nombre d'images présentes dans 'content' 
     * 
     */
    changeIconEvents() {
        $('.menu-icone').on("click", (e) => {
            const img = e.currentTarget
            const pos = this.getPos(img)
            this.changeIcon(pos)
        })
    }

    /** Retourne le numéro de la ligne contenant l'ID
     * 
     * @param {string} id ID unique
     * @param {number} indexID position de l'ID (caché) dans l'item (en général 0)
     * @returns {number} Numéro ligne
     */
    getRowIndexByID(id, indexID = 0) {
        return this._items.findIndex(elt => elt[indexID]._text == id)
    }

    /** Modifie l'icône
     * 
     * @param {number[]} pos N° de l'item et position de l'icone dans l'item 
     * @param {number|undefined} index index de l'icone à afficher dans une ligne de this._items 
     * Si index n'est pas défini on prend l'icone suivante dans le tableau 'options'    
     */
    changeIcon(pos, index = undefined) {
        // récupère item courant
        const imgItem = this._items[pos[0]][pos[1]]

        if (index !== undefined)
            imgItem.options.idx = index
        else {
            // si les deux index sont identiques on incrémente modulo
            if (imgItem.options.idx == imgItem.options.prev_idx)
                imgItem.options.idx = (imgItem.options.idx + 1) % imgItem.data.length
        }

        // récupère la nouvelle url
        const url = imgItem.data[imgItem.options.idx]

        // modifie l'image dans la liste menu
        if ('src' in imgItem)
            // @ts-ignore modifie l'image sur l'objet affiché 
            imgItem.src = url

        // @ts-ignore modifie l'icone dans menu
        $("#" + imgItem.id)[0].src = url

        imgItem.options.prev_idx = imgItem.options.idx
    }

    /** Définit les listeners qui affichent ou cachent le menu
     * 
     */
    displayEvents() {
        const lst = insertDiese(this._idLstMenu)
        const bt = insertDiese(this._idBtMenu)
        const menu = insertDiese(this._idMenu)

        $(lst).on('mouseleave', function (e) {
            $(lst).hide()
        })

        $(bt).on('mouseenter', function (e) {
            $(lst).show()
        })

        $(menu).on('mouseleave', function (e) {
            $(lst).hide()
        })
    }

    /** Ajoute une ligne et affiche le menu
     * 
     * @param {object[]} row ligne de menu  
     * @param {boolean} display indique si on doit afficher le menu
     */
    addItem(row, display = false) {
        this.insertItems(row)
        this.updateMenu()
        this.displayMenu(this._idMenu, display)
    }

    /** Retourne les coordonnées d'un élement du listMenu
     * 
     * Chaque élément est repéré par la ligne (row) et la position (colonne col) dans cette ligne
     * @param {object} elt JQuery Element  
     * @returns {number[]} tableau indiquant la ligne et la colonne dans le menu
     */
    getPos(elt) {
        const BreakException = {}
        let index = 1

        // accède à la div contenant le menu
        let menu = elt.parentElement.parentElement.parentElement

        // Nombre de lignes
        const nbElt = menu.childElementCount

        // container des items
        const items = elt.parentElement.parentElement
        
        // parcours les items
        let item = items.nextSibling
        while (item) {
            item = item.nextSibling
            index += 1
        }

        // indice de la ligne
        const row = nbElt - index
        item = this._items[row]
        
        // recherche la colonne
        let col = -1
        try {
            item.forEach(e => {
                col++
                if (e.id == elt.id)
                    throw BreakException
            })
        } catch (e) {
            if (e == BreakException) {
                return [row, col]
            }
        }
        return [row, -1]
    }

    /** Supprime un item de la liste
     * 
     * @param {object} elt élement cliqué  
     * @param {boolean} display affiche le menu 
     */
    removeItem(elt, display = false) {
        const index = this.getPos(elt)
        this._rows.splice(index[0])
        this._items.splice(index[0])
        this._menu = new Div("container-fluid", this._idMenu)       // div englobant le menu
        this._lstMenu = new Div("container-fluid menu-list", this._idLstMenu)   // div englobant les items
        //this._lstMenu = new Div("container-fluid menu-list", "lstmenu")
        //this._menu = new Div("container-fluid")
        this._divmenu_c = []
        this._divmenu_cr = []
        //this.divmenu_s = [this.divmenu_s[0]]
        this.createColItems()
        this.createRowItems()
        this.getHtmlMenu()
        this.displayMenu("#menu", false)
    }
}

export { ListMenu }
