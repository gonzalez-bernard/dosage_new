/**
 * Gestion d'une listmenu
 * Les paramètres necessaires sont :
 * - id du bouton pour gérer l'affichage
 * - idMenu id du container
 */
import { getFileName} from "../modules/utils/file.js"

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

const initShowHide = (idBouton, idMenu) => {
  $('#idMenu').on('mouseleave', function (e) {
    $('#idMenu').hide()
  })

  $('#idBouton').on('mouseenter', function (e) {
    $('#idMenu').show()
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

const initListMenu = (prop, rows) => {
  initShowHide(prop.idBouton, prop.idMenu)
  initChangeIcon()
  initAction(rows)
}



export {initListMenu}