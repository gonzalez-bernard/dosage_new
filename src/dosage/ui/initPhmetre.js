/** initPhmetre.js 
 * 
 * @module dosage/ui/initPhmetre
 * @description 
 * - Crée le phmètre et définit les events
 * - Positionne et actualise l'afiichage
 * ***
 * ***export initPhmetre, setPHmetre***
*/

import * as cPHmetre from "./classes/phmetre.js";
import { PHMETRE } from "./interface.js"
import * as cts from "../../environnement/constantes.js";
import * as txt from "./lang_fr.js";
import {G} from "../../environnement/globals.js";
import { isObject } from "../../modules/utils/type.js";
import * as e from "../../modules/utils/errors.js";
import {updateGraph, displayGraph} from "../dosage.graph.js"
import {getEltID} from "../../modules/utils/html.js"
import { DOS_BT_COTH } from "./html_cts.js";

/** Crée le Phmètre
 * 
 * Définit les events
 * 
 * @param {tLab} lab Labo
 * @param {Dosage} G 
 * @returns {Phmetre} Phmetre
 * @use updGraph, displayGraph
 * @public
 * @file initPhmetre.js
 */
function initPhmetre( lab, G ) {
    if (!isObject(lab.canvas) || !isObject(lab.tooltip) || !isObject(lab.becher)) throw new TypeError(e.ERROR_OBJ)

    // Crée phmetre
    var phmetre = new cPHmetre.Phmetre( PHMETRE, lab.canvas, cts.ETAT_PHMETRE, "" );
    lab.canvas.addChild( phmetre.fond );

    // survol pHmetre
    phmetre.fond.bind( "mouseenter", function( e ) {
        if (G.type & cts.TYPE_ACIDEBASE){
            lab.canvas.mouse.cursor( "pointer" );
            lab.tooltip.dspText( txt.DO_PHMETRE );
        } else {
            lab.canvas.mouse.cursor( "not-allowed" );
        }
    });

    // Quitte survol pHmetre
    phmetre.fond.bind( "mouseleave", function( e ) {
        lab.canvas.mouse.cursor( "default" );
        if (G.type & cts.TYPE_ACIDEBASE){
            lab.tooltip.dspText();
        } 
    } );

    /* Installe le pHmètre ou le positionne à sa place.
      Gère la création et l'affichage de la courbe */
    phmetre.fond.bind( "dblclick", function() {
        if (G.test('etat',cts.ETAT_COND) || G.test('etat',cts.ETAT_POT))
            return
        if (G.test('mesure' , 1)){
            setPHmetre(phmetre, lab.becher );
            if ( G.test('etat',cts.ETAT_PHMETRE )) {
                
                // met à jour le graphe
                updateGraph(lab.canvas)
                
                // Affiche
                displayGraph()
                
                // Désactive Boutons
                getEltID(DOS_BT_COTH ).attr( "disabled", "" );
            } else {
                
                // Active Boutons
                getEltID(DOS_BT_COTH ).removeAttr( "disabled" );
            }           
        };

    return phmetre;
    })

    return phmetre
}

/** Mise en place du phmètre
  
  Initie le graphe ou le met à jour, affiche le pH, update le bouton
  @param {Phmetre} phmetre
  @param {Becher} becher
  @returns void
  @public
  @file initPhmetre.js
*/
function setPHmetre(phmetre, becher ) {
    if ( !( G.test('etat',cts.ETAT_ESPECES ) )) return false;
    if ( G.test('etat',cts.ETAT_COND )) return false;

    // Change état
    G.setState(cts.ETAT_PHMETRE,-1)

    // Affiche phmetre
    phmetre.dispose( becher, phmetre.offsetX, phmetre.offsetY );
    phmetre.setText( G.sph);
}


export { initPhmetre, setPHmetre }