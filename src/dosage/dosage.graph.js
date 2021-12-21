/** graph_utils.js
 * 
 * @module dosage/dosage.graph
 * @description fonctions utilisées pour les graphes
 * ***
 * ***export : updateGraph, displayGraph***
 */

import * as ui from "./ui/html_cts.js";
import {cts} from"../environnement/constantes.js";
import { gDosages, gGraphs } from "../environnement/globals.js";
import { Graphx } from "./graphx.js";
import { setEventsClick } from "./dosage.events.js";

import { getEltID } from "../modules/utils/html.js"
import { DOS_GRAPHE, DOS_GRAPH_CD, DOS_GRAPH_PH, DOS_GRAPH_PT, DOS_DIV_GRAPH } from "./ui/html_cts.js";
import { uArray } from "../modules/utils/array.js"
import { Graph } from "src/modules/graph.js";

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

    const G = gDosages.getCurrentDosage() 
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

    const G = gDosages.getCurrentDosage() 
    let options = cts.GR_OPTIONS_PT
    options.scales.y.max = Math.round( Math.max( ...G.pots ) * 110 ) / 100
    let gr = new Graphx( ui.DOS_GRAPH_PT, "Potentiels", [], cts.GR_OTHER_PT, options )
    gr.setType( 3 )
    gr.setEvent( "onClick", setEventsClick );
    return gr
}

/** Enregistre un graphe
 * 
 * @param {Graphx} graph graphe à enregistrer
 * @param {number} app type d'appareil
 */
function addGraph (graph, app){

    // Génère l'ID
    const ID = gGraphs.genNewID(app)
    // enregistre dans la liste
    gGraphs.addLstID(ID)
    // Enregistre le graphe
    gGraphs.charts.push({id:ID, graph: graph})
}

/** Supprime une courbe
 * 
 * @param {string} id ID courbe
 */
function removeGraph(id){
    // Si id existe
    if (gGraphs.lstID[id]){
        // supprime de la liste
        gGraphs.removeLstID(id)
        // retire du tableau
        gGraphs.charts = gGraphs.charts.filter(v => v.id != id)
    }
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

    const G = gDosages.getCurrentDosage() 
    const C = gGraphs.charts[gDosages.currentDosage]
    // si appareil non actif on l'active sinon on le cache
    if ( G.test( 'etat', cts.ETAT_PHMETRE ) ) {
        _updGraph( C.chartPH, cts.ETAT_GRAPH_PH )
    } else if ( G.test( 'etat', cts.ETAT_COND ) ) {
        _updGraph( C.chartCD, cts.ETAT_GRAPH_CD )
    } else if ( G.test( 'etat', cts.ETAT_POT ) ) {
        _updGraph( C.chartPT, cts.ETAT_GRAPH_PT )
    }

    // Affichage
    displayGraph(canvas)
}

function _updGraph( graph, state ) {
    const G = gDosages.getCurrentDosage() 
    // si graphe initié on le modifie sinon on le crée
    if ( G.test( 'etat', state ) ) {
        // mise à jour du graphe
        graph.changeData( graph.data );
    } else {
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
        // on initie l'état 
        G.setState( state, 1 )
    }
}

/** Affiche le graphe selon la valeur de etat
 * 
 */
function displayGraph(canvas) {
    const G = gDosages.getCurrentDosage() 
    const C = gGraphs.charts[gDosages.currentDosage]

    if ( G.test( 'etat', cts.ETAT_PHMETRE ) ) {
        getEltID( DOS_GRAPH_CD ).hide();
        getEltID( DOS_GRAPH_PT ).hide();
        getEltID( DOS_GRAPH_PH ).show();
        C.chartPH.display();
    } else if ( G.test( 'etat', cts.ETAT_COND ) ) {
        getEltID( DOS_GRAPH_PH ).hide();
        getEltID( DOS_GRAPH_PT ).hide();
        getEltID( DOS_GRAPH_CD ).show();
        C.chartCD.display();
    } else if ( G.test( 'etat', cts.ETAT_POT ) ) {
        getEltID( DOS_GRAPH_PH ).hide();
        getEltID( DOS_GRAPH_CD ).hide();
        getEltID( DOS_GRAPH_PT ).show();
        C.chartPT.display();
    } else {
        getEltID( DOS_DIV_GRAPH ).fadeOut(500,'swing');
        getEltID(ui.DOS_IMG).fadeIn(500, 'swing')
        return
    }
    getEltID(ui.DOS_IMG).fadeOut(500,'swing')
    getEltID( DOS_GRAPHE ).show();
    getEltID( DOS_DIV_GRAPH ).fadeIn(500,'swing');
    
    canvas.redraw();
}

/** Indique si le volume a atteint le max
 * 
 * @param {number} vol volume
 * @returns {boolean} 
 */
function isLimit( vol ) {
    const G = gDosages.getCurrentDosage() 
    const C = gGraphs.charts[gDosages.currentDosage]

    let resp = false
    if ( G.test( 'etat', cts.ETAT_PHMETRE ) ) {
        if ( vol == new uArray( C.chartPH.data ).getArrayObjectExtremumValues( "x", "max" ) )
            resp = true;
    } else if ( G.test( 'etat', cts.ETAT_COND ) ) {
        if ( vol == new uArray( C.chartCD.data ).getArrayObjectExtremumValues( "x", "max" )) 
            resp = true;
    } else if ( G.test( 'etat', cts.ETAT_POT ) ) {
        if ( vol == new uArray( C.chartPT.data ).getArrayObjectExtremumValues( "x", "max" )) 
            resp = true;
    }
    return resp
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

export { defGraphCD, defGraphPT, defGraphPH, updateGraph, displayGraph, isLimit, addData, addGraph, removeGraph }