/** DOSAGE - html.js */

import { Element, Button, Div} from "../../modules/dom.js"
import * as txt from "./lang_fr.js"
import {DOS_BT_RESET, DOS_BT_NEW_DOSAGE, DOS_BT_DSPINFO, DOS_BT_PERP, DOS_BT_TAN1, DOS_BT_TAN2, DOS_BT_DERIVEE, DOS_BT_COTH, DOS_DIV_INFO, DOS_CANVAS, DOS_GRAPH_CD, DOS_GRAPH_PH, DOS_GRAPH_PT, DOS_GRAPHE, DOS_DIV_GRAPH} from "./html_cts.js"

var buttons = {},
    divs = {},
    elts = {}
var html = ""

elts.title = new Element( 'h3' ).setText( txt.DO_TITLE )
divs.title = new Div( 'title' ).addChild( elts.title )
html = divs.title.getHTML()

// text intro
elts.span = new Element( 'span' ).setText( txt.DO_MSG )
html += elts.span.getHTML()

/************************************************** */
// buttons
buttons.reset = new Button( txt.DO_RESET, { id: DOS_BT_RESET, cls: 'btn btn-success' } )
    .setTitle( txt.DO_BT_RESET )
buttons.new_dosage = new Button( txt.DOS_NEW_DOSAGE, { id: DOS_BT_NEW_DOSAGE, cls: 'btn btn-warning' } )
    .setTitle( txt.DOS_BT_NEW_DOSAGE )
buttons.info = new Button( txt.DO_INFO, { id: DOS_BT_DSPINFO, cls: 'btn btn-info' } ).setTitle( txt.DOS_BT_INFO )
//buttons.check_input = new Input( 'checkbox', { cls: 'form-check-Input', id: 'dos_chk_graph' } )
//buttons.check_label = new Label( 'Conserver les courbes', { cls: 'form-check-Label' } ).setFor( 'dos_chk_graph' )
//divs.check = new Div( 'form-check' ).addChild( buttons.check_input, buttons.check_label )

divs.buttons_col = new Div( 'col-md-6' ).addChild( buttons.reset, buttons.new_dosage, buttons.info)
divs.buttons = new Div( 'row' ).addChild( divs.buttons_col )

/************************************************** */

// canvas labo
elts.labo = new Element( 'canvas', { cls: 'canvas', id: DOS_CANVAS } )
divs.labo = new Div( 'row','labo' ).addChild( elts.labo ).setStyle( "min-width:500px" )

// info
divs.info = new Div( 'row', 'dos_info' ).setText( 'Informations : ' ).setStyle( "width:500px; margin-top:1em; min-height:3em" )

// div groupant info et labo
divs.info_labo = new Div('col').setStyle("width:600px").addChild(divs.info, divs.labo)

/************************************************** */

// graphe
elts.gr_ph = new Element( 'canvas', { id: DOS_GRAPH_PH } )
elts.gr_cd = new Element( 'canvas', { id: DOS_GRAPH_CD } )
elts.gr_pt = new Element( 'canvas', { id: DOS_GRAPH_PT } )

divs.chart = new Div( 'row' ).addChild( elts.gr_ph, elts.gr_cd, elts.gr_pt ).setID( DOS_GRAPHE ).setStyle( "display:none; max-width:600px; min-width:500px" )

// boutons graph
buttons.derivee = new Button( '', { id: DOS_BT_DERIVEE, cls: 'btn btn-dosage btn-image bt-derivee' } ).setAttrs( 'disabled' ).setData( 'toogle', 'tooltip' ).setData( 'placement', 'top' ).setData( 'html', 'true' ).setTitle( txt.DO_BT_DERIVEE )
//divs.button1 = new Div( 'col-md-2' ).addChild( buttons.derivee )

buttons.tan1 = new Button( '', { id: DOS_BT_TAN1, cls: 'btn btn-dosage btn-image bt-tan1' } ).setAttrs( 'disabled' ).setData( 'toogle', 'tooltip' ).setData( 'placement', 'right' ).setData( 'html', 'true' ).setTitle( txt.DO_BT_TAN1 )
//divs.button2 = new Div( 'col-md-2' ).addChild( buttons.tan1 )

buttons.tan2 = new Button( '', { id: DOS_BT_TAN2, cls: 'btn btn-dosage btn-image bt-tan2' } ).setAttrs( 'disabled' ).setData( 'toogle', 'tooltip' ).setData( 'placement', 'right' ).setData( 'html', 'true' ).setTitle( txt.DO_BT_TAN2 )
//divs.button3 = new Div( 'col-md-2' ).addChild( buttons.tan2 )

buttons.tanp = new Button( '', { id: DOS_BT_PERP, cls: 'btn btn-dosage btn-image bt-perp' } ).setAttrs( 'disabled' ).setData( 'toogle', 'tooltip' ).setData( 'placement', 'right' ).setData( 'html', 'true' ).setTitle( txt.DO_BT_PERP )
//divs.button4 = new Div( 'col-md-2' ).addChild( buttons.tanp )

buttons.tanpp = new Button( '', { id: DOS_BT_COTH, cls: 'btn btn-dosage btn-image bt-courbe' } ).setAttrs( 'disabled' ).setData( 'toogle', 'tooltip' ).setData( 'placement', 'top' ).setData( 'html', 'true' ).setTitle( txt.DO_BT_COTH )
//divs.button5 = new Div( 'col-md-2' ).addChild( buttons.tanpp )
//divs.espace = new Div( 'col' )

// groupe boutons
//divs.bts = new Div( 'row', 'btChart' ).addChild( divs.button1, divs.button2, divs.button3, divs.button4, divs.button5 ).setStyle("min-width: 400px")
divs.bts = new Div( 'row', 'btChart' ).addChild( buttons.derivee, buttons.tan1, buttons.tan2, buttons.tanp, buttons.tanpp ).setStyle("min-width: 400px")

// conteneur boutons et graph
divs.bts_graph = new Div( 'col-md-6' ).addChild( divs.bts, divs.chart ).setStyle( 'display: none ' ).setID( DOS_DIV_GRAPH )

/************************************************** */

divs.container = new Div( 'row container-fluid', 'content' ).addChild(divs.info_labo, divs.bts_graph)

divs.info = new Div( "container" ).setID( DOS_DIV_INFO )

html += divs.buttons.getHTML()
html += divs.container.getHTML()
html += divs.info.getHTML()

export { html }