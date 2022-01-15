import * as dom from "../src/modules/dom.js"

const divs = {}

divs.name = new dom.Div('form-group col').setStyle("margin-bottom:0.4em; margin-right:0.4em")
divs.row1 = new dom.Div("row")
divs.row2 = new dom.Div("row")
divs.colname = new dom.Div('col-md-8')
divs.colpname = new dom.Div('col-md-8')

const label = new dom.Label("Essai").addClass("col col-form-label")
const labelName = new dom.Label("Nom :",{class:'col-md-4 col-form-label'})

const input = new dom.Input('text').setID("name").addClass("text ui-widget-content ui-corner-all")
divs.colname.addChild(input)
divs.row1.addChild(labelName, divs.colname)

const labelpName = new dom.Label("Prénom :",{class:'col-md-4 col-form-label'})
const input1 = new dom.Input('text').setID("name2").addClass("text ui-widget-content ui-corner-all")
divs.colpname.addChild(input1)
divs.row2.addChild(labelpName, divs.colpname)

divs.name.addChild(divs.row1, divs.row2)

const fieldset = new dom.Element('fieldset').addChild(label, divs.name)

const form = new dom.Form().addChild(fieldset)
//const html = form.getHTML()
//$("#dialog-form").html(html)

function testDialog(){
  console.log($("#name").val())
  let tab = diag.getInputs()
  diag.hide()
}

function closeDialog(){
  diag.hide()
}

const prm = {
  autoOpen: false,
  height: 'auto',
  width: 'auto',
  position: {my: 'center', at: "center"},
  modal: true,
  title: "Titre",
  buttons: {
    "test": testDialog,
    "Annule": closeDialog
  }
}

const diag = new dom.Dialog("dialog-form", form, prm)

export {diag}
