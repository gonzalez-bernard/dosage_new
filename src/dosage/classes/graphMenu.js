// Classe de gestion du graphMenu
import { DOS_BT_DSP_GRAPH, DOS_CHART } from "../../dosage/ui/html_cts.js";
import { DOS_DSP_LST_GRAPH } from "../../dosage/ui/lang_fr.js";

/** @typedef {import('../../modules/listmenu.js').ListMenu} ListMenu */
/** @typedef {import('../../modules/dom.js').Dialog} Dialog */

class graphMenu {

  constructor(idRoot, idMenu) {
    this.label = DOS_DSP_LST_GRAPH,
      this.idButton = DOS_BT_DSP_GRAPH,
      this.idRootMenu = idRoot,     // id du div présent dans HTML qui va contenir le menu
      this.idMenu = idMenu,  // id du menu
      this.width = "auto",
      this.imgVisible = '../../static/resources/img/oeil_ouvert.png',
      this.imgNoVisible = '../../static/resources/img/oeil_ferme.png',
      this.imgTrash = '../../static/resources/img/poubelle.png',

      /** @type {ListMenu} */
      this.menu = {},    // menu déroulant instance de ListMenu

      /** @type {Dialog} */
      this.dialog = {}  // instance de Dialog (dom.js)
  }

  /** Retourne les coordonnées d'un élement du listMenu
  * 
  * Chaque élément est repéré par la ligne (row) et la position (colonne col) dans cette ligne
  * @param {object} elt JQuery Element  
  * @returns {number[]} tableau indiquant la ligne et la colonne dans le menu
  */
  getPos(elt) {
    return this.menu.getPos(elt)
  }

  /** Retourne tableau des items
  * 
  * @returns {array}
  */
  getItems() {
    return this.menu.getItems();
  }

  /** Retourne tableau des lignes (row)
  * 
  * @returns {array}
  */
  getRows() {
    return this.menu.getRows();
  }

  /** Ajoute une ligne et affiche le menu
  * 
  * @param {object[]} row ligne de menu  
  * @param {boolean} display indique si on doit afficher le menu
  */
  addItem(row, display = false) {
    this.menu.addItem(row, display)
  }

  /** Retourne le numéro de la ligne contenant l'ID
  * 
  * @param {string} id ID unique
  * @param {number} indexID position de l'ID (caché) dans l'item (en général 0)
  * @returns {number} Numéro ligne
  */
  getRowIndexByID(id, indexID = 0) {
    return this.menu._items.findIndex(elt => elt[indexID]._text == id)
  }

  /** Supprime un item de la liste
  * 
  * @param {object} elt élement cliqué  
  * @param {boolean} display affiche le menu 
  */
  removeItem(elt, display = false) {
    this.menu.removeItem(elt, display)
  }

  /** Affiche le menu et initialise les events
   * 
   * @param {string} id id de la page web
   * @param {boolean} display indique si on doit afficher le menu
   * @file dom.js
   */
  displayMenu(id, display = false) {
    this.menu.displayMenu(id, display)
  }

  /** Génère le menu
  * 
  * @returns {string}
  */
  createMenu() {
    return this.menu.createMenu()
  }

  /** Modifie l'icône
      * 
      * @param {number[]} pos N° de l'item et position de l'icone dans l'item 
      * @param {number|undefined} index index de l'icone à afficher dans une ligne de this._items 
      * Si index n'est pas défini on prend l'icone suivante dans le tableau 'options'    
      */
  changeIcon(pos, index = undefined) {
    this.menu.changeIcon(pos, index)
  }

  // affiche boite dialogue
  displayDialog() {
    this.dialog.display()
  }

  // cache le dialogue
  hideDialog() {
    this.dialog.hide()
  }
}

export { graphMenu }
