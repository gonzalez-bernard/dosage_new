import { Element, List, Div, Link } from "../modules/dom.js";
import * as txt from "./lang_fr.js";
import { cts } from "../environnement/constantes.js"
import * as ui from "./html_cts.js"

var divs = {},
    elts = {}

// titre et intro
const h3 = new Element( "h3" ).setText( txt.H_TITLE );
divs.titre = new Div( "title" ).addChild( h3 ).setParent( "body" );

divs.container = new Div( "container-fluid" ).setParent( "body" );
elts.intro = new Element( "p", { class: 'intro' } ).setText( txt.H_INTRO )
divs.container.addChild( elts.intro )

// Menu


const menu = new List( [
    new Link( '#' ).setText( txt.H_UI ).setAction( 'onClick', "$('#detail').children().hide(); $('#" + ui.H_UI + "').toggle() " ),
    new Link( '#' ).setText( txt.H_AC ).setAction( 'onClick', "$('#detail').children().hide(); $('#" + ui.H_AC + "').toggle()" ),
    new Link( '#' ).setText( txt.H_OX ).setAction( 'onClick', "$('#detail').children().hide(); $('#" + ui.H_OX + "').toggle()" ),
    new Link( '#' ).setText( txt.H_CP ).setAction( 'onClick', "$('#detail').children().hide(); $('#" + ui.H_CP + "').toggle()" )
] )

divs.ui = new Div( " ", ui.H_UI ).setText( txt.H_UI_DETAIL ).setStyle( "display:none" )
divs.ac = new Div( " ", ui.H_AC ).setText( txt.H_AC_DETAIL ).setStyle( "display:none" )
divs.ox = new Div( " ", ui.H_OX ).setText( txt.H_OX_DETAIL ).setStyle( "display:none" )
divs.cp = new Div( " ", ui.H_CP ).setText( txt.H_CP_DETAIL ).setStyle( "display:none" )
divs.detail = new Div( " ", 'detail' ).addChild( divs.ui, divs.ac, divs.ox, divs.cp )

divs.container.addChild( menu, divs.detail )

var html = divs.titre.getHTML() + divs.container.getHTML() + cts.FOOTER;
export { html };