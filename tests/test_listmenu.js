import {ListMenu} from "../src/modules/dom.js"

// importe une boite de dialogue
import {diag} from "./create_dialog.js"
//import "../node_modules/jquery-ui-dist/jquery-ui.js"

const rows = []
let row = []
row.push({type:'label', content:'test'})
row.push({type:'link', content: 'lien', link: 'google', class:'_classe'} )
row.push({type:'img', content:['../static/resources/img/oeil_ouvert.png', '../static/resources/img/oeil_ferme.png'], action: showDialog, id: 'image'})
rows.push(row)
row = []
row.push({type:'label', content:'test suite', action: test, id: 'lien'})
row.push({type:'link', content: 'lien suite', link: 'google', class:'_classe'} )
row.push({type:'img', content:'../static/resources/img/edta.png', action:test, id: 'image1'})
rows.push(row)
const prop = {label:'menu', id:'idBouton', idMenu: 'idMenu', width:'20em'}

let menu = new ListMenu(prop, rows)
menu.createMenu()
menu.displayMenu("#menu")

function test(){
  console.log(menu.getIndex(this))

  let row = []
  row.push({type:'label', content:'ajout'})
  row.push({type:'link', content: 'lien', link: 'ok', class:'_classe'} )
  row.push({type:'img', content:['../static/resources/img/poubelle.png', '../static/resources/img/oeil_ferme.png'], id: 'image2'})
  menu.addItem(row, true)
}

function ntest(){
  console.log(menu.getIndex(this))
  menu.removeItem(this, true)
}

function showDialog(){
  diag.display()
}
