/**
 * Gestion d'une listmenu
 * Les paramètres necessaires sont :
 * - id du bouton pour gérer l'affichage
 * - idMenu id du container
 */
import { getFileName} from "../modules/utils/file.js"
import { insertDiese } from "./utils/string.js"

/** Initialise le menu
 * 
 * La structure du menu est la suivante :
 * <div id='menu'>  // structure externe présente dans le fichier HTML
 *    <div class = 'container-fluid' id = 'menu'>   // id = this.idMenu, div = this.menu
 *      <div class = 'row'>  
 *        <button id = 'btMenu'>   // identifié par this.idBtMenu
 *        </button> 
 *      </div> 
 *      <div class = 'container-fluid menu-list' id = 'lstMenu'> // id = this.idLstmenu, div = this.*      lstmenu
 *          <div class = 'row menu-item-row>...</div>
 *          ...........
 *      </div>
 *    </div>
 * </div>
 * 
 * prop propriétés du menu 
 * {label {string}:nom du bouton, id {string}:id du bouton, idMenu {string}: id du menu, width {string}:largeur du menu}
 * 
 * @param {object} prop 
 * @param {object} rows 
 */
const initListMenu = (prop, rows) => {
  initEvents(prop.idBouton, prop.idMenu, prop.idLstMenu)
  initChangeIcon()
  initAction(rows)
}

/** Initialise le listener pour changement icone
 * 
 */
const initChangeIcon = () => {
  // @ts-ignore
  $('.menu-icone').on("click", function (e) {

    // @ts-ignore
    const file = getFileName(this.currentSrc)
    // @ts-ignore
    const dir = this.currentSrc.match(/.*\//)[0];
    // @ts-ignore
    let sources = this.attributes.data.nodeValue.split(',')
    if (sources.length == 2 && sources[1] != '') {
      // @ts-ignore
      sources = sources.map(getFileName)
      // @ts-ignore
      this.src = file == sources[0] ? dir + sources[1] : dir + sources[0]
    }
  })
}

const initEvents = (idBouton, idMenu, idLstMenu) => {
  const lst = insertDiese(idLstMenu) 
  $(lst).on('mouseleave', function (e) {
    $(lst).hide()
  })

  $(insertDiese(idBouton)).on('mouseenter', function (e) {
    $(lst).show()
  })
}


/** Initialise les actions
 * 
 * @param {object[][]} rows 
 */
const initAction = (rows) => {
  rows.forEach((row) => {
    row.forEach((elt ) => {
      if (elt.id && elt.action){
        $("#"+elt.id).on("click", elt.action)
      }
    })
  })
}

export {initListMenu}