// html.js

import * as txt from "./lang_fr.js"
import * as ui from "./html_cts.js"
import { Element, Div, Link, Button, Form, Label, Input, Img, Message} from "./../modules/dom.js"

import { FOOTER } from "../environnement/constantes.js"

function getHtml(id, objectif, context, question, inconnu, img = null) {

  const divs = {}, elts = {}, buts = {}, forms = {}, labels = {}, links = {}, inputs = {}, alerts = {}

  divs.container = new Div('container-fluid')

  // titre
  divs.title = new Div('title').addChild(new Element('h3').setText(txt.PB_TITRE))
  divs.container.addChild(divs.title)

  // consigne et boutons
  elts.intro = new Element('b').setText(txt.PB_INTRO)
  elts.hr = new Element('hr')
  divs.bts = new Div('btn-group')
  
  // bouton acido
  buts.question = new Button(txt.PB_BT_Q, { cls: 'btn btn-primary dropdown-toggle', id: ui.PB_QACIDO }).setData('toggle','dropdown').setAria('expanded', 'false').setAria('haspopup', 'true')
  divs.drop = new Div('dropdown-menu').setAria("labelledby","dropdownmenubutton")
  links.items = []
  for (var i = 0; i<12; i++){
    links.items.push(new Link("#",{cls:'dropdown-item link-item', id:ui.PB_QU[i]}).setText(txt.
    PB_ITEMS[i]))
    divs.drop.addChild(links.items[i])  
  }
  divs.bts.addChild(buts.question, divs.drop)
  
  divs.container.addChild(elts.intro,divs.bts)
  

  divs.content = new Div('container-fluid', ui.PB_CONTENT)

  // Problème, niveau et zoom
  elts.niveau = new Element('h4',{cls:'col col-sm-4'}).setText(txt.PB_NUMBER + id)
  links.zoom = new Link('#', { id: ui.PB_ZOOM, cls:'col col-sm-2' })
  elts.zoom = new Img('static/resources/img/zoom-in.png', { w: '50px' })
  links.zoom.addChild(elts.zoom)
  divs.soustitre = new Div('row').addChild(elts.niveau, links.zoom)
  divs.content.addChild(divs.soustitre)

  // énoncé, question
  divs.row_enonce = new Div('row container-fluid')
  divs.col_enonce = new Div('col col-lg-9' , ui.PB_ENONCE).setStyle('min-width:70%')  
  elts.objectif = new Element('p',{cls:'objectif'}).setText("Objectif : " + objectif)
  elts.context = new Element('p').setText(context)
  
  buts.btExp = new Button(txt.PB_BT_EXP,{id: ui.PB_EXPERIMENT, cls: 'col-md-4 btn btn-success' })
  elts.question = new Element('b',{cls:'col-md-7'}).setText(question + '</br></hr>')
  divs.row_question = new Div('row').addChild(elts.question, buts.btExp)

  if (img != null) {
    elts.img = new Img("static/resources/img/" + img, { id: 'pb_img',w: 'auto', cls: 'image-fluid rounded col col-lg-3' }).setStyle('max-width:200px')
  } else
    elts.img = null

  divs.col_enonce.addChild(elts.objectif, elts.context, divs.row_question)

  if (elts.img == null)
    divs.row_enonce.addChild(divs.col_enonce)
  else 
    divs.row_enonce.addChild(divs.col_enonce, elts.img)

  divs.content.addChild(divs.row_enonce)


  // reponse
  inconnu.unit = inconnu.unit == null ? '' : inconnu.unit
  
  forms.reponse = new Form({ id: ui.PB_PROBLEM, cls: 'form-inline' })
  labels.reponse = new Label(inconnu.label).setFor('response_problem')
  labels.unit = new Label(inconnu.unit)
  inputs.reponse = new Input('text', { id: ui.PB_PROBLEM_REPONSE, cls: 'form-control col-sm-4' }).setAttrs("length='7' required pattern = '^\\s*(\\d*\\.[0-9]{0,9})\\s*$|^\\s*(\\d*)\\s*$'")
  divs.form = new Div('form-group').addChild(labels.reponse, inputs.reponse, labels.unit)
  elts.holder = new Element('small', { cls: 'form-text text-muted' }).setText(txt.PB_PLACEHOLDER)
  divs.holder = new Div().addChild(elts.holder)
  divs.feedback = new Div('invalid-feedback', ui.PB_FEEDBACK ).setText(txt.PB_FEEDBACK)
  forms.reponse.addChild(divs.form, divs.holder, divs.feedback)
  divs.reponse = new Div('', ui.PB_REPONSE).addChild(forms.reponse)
  divs.content.addChild(elts.hr, divs.reponse, elts.hr)
  divs.container.addChild(divs.content)

  
  // help et solution
  divs.help = new Div('cmath font-solution container-fluid', ui.PB_HELP )
  divs.solution = new Div('cmath font-solution container-fluid', ui.PB_SOLUTION)
  divs.container.addChild(divs.help, divs.solution)

  // alerts
  alerts.error = new Message(ui.PB_ALERT_ERROR, 'warning')
  alerts.success = new Message(ui.PB_ALERT_SUCCESS, 'success')

  // Boutons
  divs.btvalid = new Div('col-sm-2')
  buts.btvalid = new Button(txt.PB_BT_VALID, { cls: 'btn btn-success col-sm-2', id: ui.PB_BT_VALID }).setAttrs('disabled')
  buts.btsolution = new Button(txt.PB_BT_RESULT, { cls: 'btn btn-info  col-sm-2', id: ui.PB_BT_SOLUTION }).setAttrs('disabled')
  buts.bthelp = new Button(txt.PB_BT_HELP, { cls: 'btn btn-warning  col-sm-2', id: ui.PB_BT_HELP })
  buts.btcancel = new Button(txt.PB_BT_CANCEL, { cls: 'btn btn-danger  col-sm-2', id: ui.PB_BT_CANCEL })
  divs.row = new Div('form-group row').addChild(buts.btvalid, buts.btsolution, buts.bthelp, buts.btcancel)
  divs.btproblem = new Div('',ui.PB_BT_PROBLEM).addChild(divs.row)

  
  divs.container.addChild(alerts.error.div, alerts.success.div, divs.btproblem)

  return divs.container.getHTML() + FOOTER

}

export { getHtml}

