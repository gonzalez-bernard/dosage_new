/** graph_utils.js
 * 
 * @module dosage/dosage.graph
 * @description fonctions utilisées pour les graphes
 * ***
 * ***export : updateGraph, displayGraph***
 */

import * as ui from "./ui/html_cts.js";
import * as cts from "../environnement/constantes.js";
import { G } from "../environnement/globals.js";
import { Graphx } from "./graphx.js";
import { setEventsClick } from "./dosage.events.js";

import { getEltID } from "../modules/utils/html.js"
import { DOS_GRAPHE, DOS_GRAPH_CD, DOS_GRAPH_PH, DOS_GRAPH_PT, DOS_DIV_GRAPH } from "./ui/html_cts.js";
import { uArray } from "../modules/utils/array.js"

/**
 * @typedef {import('../../types/classes').Canvas} Canvas
 * @typedef {import('../../types/classes').Graph} Graph
 * 
 */

/** Crée et initialise le graphe pH
 * 
 * @returns Graphx
 * @public
 * @file dosage.graph.js
 */
function defGraphPH() {
    let gr = new Graphx( ui.DOS_GRAPH_PH, "pH", [], cts.GR_OTHER_PH, cts.GR_OPTIONS_PH );
    gr.setType( 1 )
    gr.setEvent( "onHover", setEventsClick );
    return gr
}

/** Crée et initialise le graphe conductance
 * 
 * @returns {Graphx}
 */
function defGraphCD() {
    let options = cts.GR_OPTIONS_CD
    options.scales.y.max = Math.round( Math.max( ...G.conds ) * 110 ) / 100
    let gr = new Graphx( ui.DOS_GRAPH_CD, "Conductance", [], cts.GR_OTHER_CD, options )
    gr.setType( 2 )
    gr.setEvent( "onClick", setEventsClick );
    return gr
}

/** Crée et initialise le graphe potentiel
 * 
 * @returns {Graphx}
 */
function defGraphPT() {
    let options = cts.GR_OPTIONS_PT
    options.scales.y.max = Math.round( Math.max( ...G.pots ) * 110 ) / 100
    let gr = new Graphx( ui.DOS_GRAPH_PT, "Potentiels", [], cts.GR_OTHER_PT, options )
    gr.setType( 3 )
    gr.setEvent( "onClick", setEventsClick );
    return gr
}

/** Initialise ou met à jour les données des graphes
 * 
 * @param {Canvas} canvas
 * @returns void
 * @public
 * @file dosage.graph.js
 * @see displayGraph
 */
function updateGraph( canvas ) {
    // si pHmètre non actif on l'active sinon on le cache
    if ( G.test( 'etat', cts.ETAT_PHMETRE ) ) {
        _updGraph( G.charts.chartPH, cts.ETAT_GRAPH_PH )
    } else if ( G.test( 'etat', cts.ETAT_COND ) ) {
        _updGraph( G.charts.chartCD, cts.ETAT_GRAPH_CD )
    } else if ( G.test( 'etat', cts.ETAT_POT ) ) {
        _updGraph( G.charts.chartPT, cts.ETAT_GRAPH_PT )
    }

    // Affichage
    displayGraph(canvas)
}

function _updGraph( graph, state ) {
    if ( G.test( 'etat', state ) ) {

        // mise à jour du graphe
        graph.changeData( graph.data );
    } else {

        // Initie le graphe
        var data = [];
        switch ( state ) {
            case cts.ETAT_GRAPH_PH:
                data.push( { x: G.titrant.vol, y: G.ph } );
                break;
            case cts.ETAT_GRAPH_CD:
                data.push( { x: G.titrant.vol, y: G.cond } );
                break;
            case cts.ETAT_GRAPH_PT:
                data.push( { x: G.titrant.vol, y: G.pot } );
                break;
        }

        graph.setDatas( data );
        graph.chart.update()
        G.setState( state, 1 )
    }
}

/** Affiche le graphe selon la valeur de etat
 * 
 */
function displayGraph(canvas) {
    if ( G.test( 'etat', cts.ETAT_PHMETRE ) ) {
        getEltID( DOS_GRAPH_CD ).hide();
        getEltID( DOS_GRAPH_PT ).hide();
        getEltID( DOS_GRAPH_PH ).show();
        G.charts.chartPH.display();
    } else if ( G.test( 'etat', cts.ETAT_COND ) ) {
        getEltID( DOS_GRAPH_PH ).hide();
        getEltID( DOS_GRAPH_PT ).hide();
        getEltID( DOS_GRAPH_CD ).show();
        G.charts.chartCD.display();
    } else if ( G.test( 'etat', cts.ETAT_POT ) ) {
        getEltID( DOS_GRAPH_PH ).hide();
        getEltID( DOS_GRAPH_CD ).hide();
        getEltID( DOS_GRAPH_PT ).show();
        G.charts.chartPT.display();
    } else {
        getEltID( DOS_DIV_GRAPH ).hide();
        return
    }
    getEltID( DOS_DIV_GRAPH ).show();
    getEltID( DOS_GRAPHE ).show();
    canvas.redraw();
}

/** Indique si le volume a atteint le max
 * 
 * @param {number} vol volume
 * @returns {boolean} 
 */
function isLimit( vol ) {
    if ( G.test( 'etat', cts.ETAT_PHMETRE ) ) {
        if ( vol == new uArray( G.charts.chartPH.data ).getArrayObjectExtremumValues( "x", "max" ) )
            return false;
    } else if ( G.test( 'etat', cts.ETAT_COND ) ) {
        if ( vol == new uArray( G.charts.chartCD.data ).getArrayObjectExtremumValues( "x", "max" ) ) {
            return false;
        }
    } else if ( G.test( 'etat', cts.ETAT_POT ) ) {
        if ( vol == new uArray( G.charts.chartPT.data ).getArrayObjectExtremumValues( "x", "max" ) ) {
            return false;
        }
    }
}

/** Ajoute une valeur au graphe en cours
 * 
 * @param {Graph} graph graphe en cours
 * @param {number} vol volume
 * @param {number} value valeur en cours
 */
function addData( graph, vol, value ) {
    if ( vol != undefined && value != undefined ) {
        graph.data.push( { x: vol, y: value } );
    }
}

export { defGraphCD, defGraphPT, defGraphPH, updateGraph, displayGraph, isLimit, addData }