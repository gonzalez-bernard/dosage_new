import { FOOTER } from "../environnement/constantes.js"
import { IN_BT_RUN } from "./html_cts.js";
import * as txt from "./lang_fr.js"
import { Element, Img, Button, Div } from "../modules/dom.js";
var buttons = {},
    divs = {},
    elts = {},
    imgs = {};

const titre = new Element( "h3" ).setText( txt.IN_TITRE )
divs.titre = new Div( 'title' ).addChild( titre )

divs.container = new Div( 'container-fluid' )
divs.row = new Div( "row" )
divs.col1 = new Div( 'col-8' )
elts.intro = new Element( 'p' ).setText( txt.IN_INTRO )
elts.intro1 = new Element( 'p' ).setText( txt.IN_INTRO_1 )
elts.intro2 = new Element( 'p' ).setText( txt.IN_INTRO_2 )

elts.item1 = new Element( 'li' ).setText( txt.IN_ITEM_1 )
elts.item2 = new Element( 'li' ).setText( txt.IN_ITEM_2 )
elts.item3 = new Element( 'li' ).setText( txt.IN_ITEM_3 )
elts.list1 = new Element( 'ul' ).addChild( elts.item1, elts.item2, elts.item3 )

elts.hr = new Element( 'hr' )

buttons.run = new Button( txt.IN_BT_RUN, { class: 'btn btn-primary', id: IN_BT_RUN } )
divs.col1.addChild( elts.intro, elts.intro1, elts.list1, elts.hr, elts.intro2, buttons.run, elts.hr )

divs.col2 = new Div( 'col' )
imgs.one = new Img( './static/resources/img/titrator.jpg', { class: 'image-fluid rounded', w: '100%' } ).setStyle( 'max-height:300px' )
divs.col2.addChild( ( imgs.one ) )
divs.row.addChild( divs.col1, divs.col2 )
divs.container.addChild( divs.row )

const HTML = divs.titre.getHTML() + "</br>" + divs.container.getHTML() + FOOTER;

export { HTML }