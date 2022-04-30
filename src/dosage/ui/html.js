/** DOSAGE - html.js */

import { Element, Button, Div, Img, Input, Label, Link, Form } from "../../modules/dom.js"
import * as txt from "./lang_fr.js"
import * as ui from "./html_cts.js"

function show_menu(){
    $("#list").show()
}

var buttons = {},divs = {}, elts = {}, imgs = {}, selects = {}
var html = ""

elts.title = new Element( 'h3' ).setText( txt.DO_TITLE )
divs.title = new Div( 'title' ).addChild( elts.title )
html = divs.title.getHTML()

// text intro
elts.span = new Element( 'span' ).setText( txt.DO_MSG )
html += elts.span.getHTML()

// buttons
buttons.reset = new Button( txt.DO_RESET, { id: ui.DOS_BT_RESET, class: 'btn btn-success' } )
    .setTitle( txt.DO_BT_RESET )
buttons.new_dosage = new Button( txt.DOS_NEW_DOSAGE, { id: ui.DOS_BT_NEW_DOSAGE, class: 'btn btn-warning' } )
    .setTitle( txt.DOS_BT_NEW_DOSAGE )
buttons.info = new Button( txt.DO_INFO, { id: ui.DOS_BT_dspINFO, class: 'btn btn-info' } ).setTitle( txt.DOS_BT_INFO )
divs.buttons_col = new Div( 'col-md-6', 'buttons_col' ).addChild( buttons.reset, buttons.new_dosage, buttons.info )




buttons.saveGraph = new Button( txt.DOS_SAVE_GRAPH, {id: ui.DOS_BT_SAVE_GRAPH, class: 'btn btn-success float-left'}).setAttrs('disabled')

/***************************************************
 * Liste des graphes
 ***************************************************/
divs.menu = new Div("", 'menu') 

divs.menu_bt1 = new Div( 'col-md-6', 'menu_bt1' ).addChild(buttons.saveGraph)
divs.menu_bt2 = new Div( 'col-md-6', 'menu_bt2' ).addChild(divs.menu)

divs.buttons_row = new Div("row").addChild(divs.menu_bt1, divs.menu_bt2)
divs.buttons_cont = new Div("col-md-6 container").addChild(divs.buttons_row)
divs.menu_col = new Div( 'col-md-6', 'menu_col' ).addChild(divs.buttons_cont)

divs.colbuttons = new Div("row").addChild( divs.buttons_col , divs.buttons_cont)
divs.buttons = new Div( 'container-fluid', 'buttons' ).addChild( divs.colbuttons)


/***************************************************
 * dialogue pour choix du nom de la courbe
 ***************************************************/
divs.dgName = new Div('form-group col').setStyle("margin-bottom:0.4em; margin-right:0.4em")

const label = new Label("Indiquez un nom pour la courbe").addClass("col col-form-label")
const labelName = new Label("Nom :",{class:'col-md-4 col-form-label'})
const input = new Input('text').setSize(20).setMaxLength(20).setID("graphName").addClass("text ui-widget-content ui-corner-all")
divs.dgColname = new Div('col-md-8').addChild(input)
divs.dgRow = new Div("row").addChild(labelName, divs.dgColname) 
divs.dgName.addChild(divs.dgRow)

const dgFieldset = new Element('fieldset').setStyle("margin-right:1em").addChild(label, divs.dgName)
const dgForm = new Form().addChild(dgFieldset)

divs.dialog = new Div("","dialog-form").addChild(dgForm)


/************************************************** */

// canvas labo
elts.labo = new Element( 'canvas', { class: 'canvas', id: ui.DOS_CANVAS } )
divs.labo = new Div( 'row', 'labo' ).addChild( elts.labo ).setStyle( "min-width:500px; margin-right:20px" )

// info
divs.info = new Div( 'row', 'dos_info' ).setText( 'Informations : ' ).setStyle( "width:500px; margin-top:1em; min-height:3em" )

// div groupant info et labo
divs.info_labo = new Div( 'col' ).setStyle( "width:530px; max-width:530px" ).addChild( divs.info, divs.labo )

/************************************************** */

imgs.labo = new Img( './static/resources/img/labo.png', { class: 'image-fluid img-labo', width: '100%' } ).setStyle( 'max-height:500px' )
divs.image = new Div( 'col-md-6'  ).addChild( imgs.labo ).setID( ui.DOS_IMG ).setStyle( "min-width:500px" )

// boutons graph
buttons.derivee = new Button( '', { id: ui.DOS_BT_DERIVEE, class: 'btn btn-dosage btn-image bt-derivee' } ).setAttrs( 'disabled' ).setData( 'toogle', 'tooltip' ).setData( 'placement', 'top' ).setData( 'html', 'true' ).setTitle( txt.DO_BT_DERIVEE )
    //divs.button1 = new Div( 'col-md-2' ).addChild( buttons.derivee )

buttons.tan1 = new Button( '', { id: ui.DOS_BT_TAN1, class: 'btn btn-dosage btn-image bt-tan1' } ).setAttrs( 'disabled' ).setData( 'toogle', 'tooltip' ).setData( 'placement', 'right' ).setData( 'html', 'true' ).setTitle( txt.DO_BT_TAN1 )
    //divs.button2 = new Div( 'col-md-2' ).addChild( buttons.tan1 )

buttons.tan2 = new Button( '', { id: ui.DOS_BT_TAN2, class: 'btn btn-dosage btn-image bt-tan2' } ).setAttrs( 'disabled' ).setData( 'toogle', 'tooltip' ).setData( 'placement', 'right' ).setData( 'html', 'true' ).setTitle( txt.DO_BT_TAN2 )
    //divs.button3 = new Div( 'col-md-2' ).addChild( buttons.tan2 )

buttons.tanp = new Button( '', { id: ui.DOS_BT_PERP, class: 'btn btn-dosage btn-image bt-perp' } ).setAttrs( 'disabled' ).setData( 'toogle', 'tooltip' ).setData( 'placement', 'right' ).setData( 'html', 'true' ).setTitle( txt.DO_BT_PERP )
    //divs.button4 = new Div( 'col-md-2' ).addChild( buttons.tanp )

buttons.tanpp = new Button( '', { id: ui.DOS_BT_COTH, class: 'btn btn-dosage btn-image bt-courbe' } ).setAttrs( 'disabled' ).setData( 'toogle', 'tooltip' ).setData( 'placement', 'top' ).setData( 'html', 'true' ).setTitle( txt.DO_BT_COTH )
    //divs.button5 = new Div( 'col-md-2' ).addChild( buttons.tanpp )
    //divs.espace = new Div( 'col' )

// groupe boutons
//divs.bts = new Div( 'row', 'btChart' ).addChild( divs.button1, divs.button2, divs.button3, divs.button4, divs.button5 ).setStyle("min-width: 400px")
divs.bts = new Div( 'row', 'btChart' ).addChild( buttons.derivee, buttons.tan1, buttons.tan2, buttons.tanp, buttons.tanpp ).setStyle( "min-width: 400px" )

// canvas graphe
elts.chart = new Element( 'canvas', { class:'canvas', id: ui.DOS_CHART } ).setStyle("width: 500px; height:500px; display:block; box-sizing:border-box")

// contient le canvas
divs.graph = new Div( 'row' ).addChild( elts.chart ).setID( ui.DOS_GRAPHE ).setStyle( "min-width:500px; max-width:80%; position: relative; height: 45vh; width: 45vw" )

// conteneur boutons et graph
divs.div_graph = new Div( 'col-md-6' ).addChild( divs.bts, divs.graph).setStyle( 'display: none ' ).setID( ui.DOS_DIV_GRAPH )

/************************************************** */

divs.container = new Div( 'row container-fluid', 'content' ).addChild( divs.info_labo, divs.div_graph,divs.image)

divs.info = new Div( "container" ).setID( ui.DOS_DIV_INFO )

html += divs.buttons.getHTML()
html += divs.menu.getHTML()
html += divs.container.getHTML()
html += divs.info.getHTML()
html += divs.dialog.getHTML()

export { html, dgForm }