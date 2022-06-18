/**
 * @module introduction/intro.ui
 * @description Afficha page introduction
 */

import { HTML } from "./html.js"

import { getEltID } from "../modules/utils/html.js"
import * as ui from "./html_cts.js"
import { ESPECES, MNU_ESPECES } from "../especes/html_cts.js"
import { initEspeces } from "../especes/interface.js"
import { gDosage } from "../environnement/globals.js"
import { MNU_PROBLEM } from "../problem/html_cts.js"



getEltID( ui.INTRODUCTION ).html( HTML )

var run = function() {

    getEltID( ui.MNU_INTRODUCTION ).removeClass( "active" )
    getEltID( ui.INTRODUCTION ).removeClass( "show active" )
    getEltID( ESPECES ).addClass( "show active" )
    getEltID( MNU_ESPECES ).removeClass( "disabled disabledTab" )
    getEltID( MNU_PROBLEM ).removeClass( "disabled disabledTab" )
    initEspeces( gDosage)
}

getEltID( ui.IN_BT_RUN ).on( "click", run )