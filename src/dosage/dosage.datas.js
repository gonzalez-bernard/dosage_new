/** dosage.datas.js 
 * 
 * Gestion des données
*/

import { gDosages, gGraphs } from "../environnement/globals.js";
import {cts, etats} from "../environnement/constantes.js";
import { roundDecimal } from "../modules/utils/number.js";
import { isLimit} from "./dosage.graph.js";
import { uArray } from "../modules/utils/array.js";
import { getData } from "../data.js"
import {Graphx} from "./graphx.js"

/** @typedef {import('../../types/classes').Burette} Burette */

/** Récupère les espèces à partir de Python
 * 
 * @param {number|string} type
 * @returns Promise
 * @use getData
 * @file dosage.datas.js
 */
async function getDosage(type) {
    
    const G = gDosages.getCurrentDosage()
    
    const datas = {
        type: G.typeDetail,
        c1: G.titre.conc,
        c2: G.titrant.conc,
        v1: G.titre.vol,
        
        ve: G.eau.vol | 0,
        
        v_max: 25,
        eq: JSON.stringify( G.equation.params ),
    }

    switch (type){
        case cts.TYPE_ACIDEBASE:
            datas.type = 1 - ( G.titre.type  % 2 )
            datas.pK = G.titre.pka
            datas.esp1 = G.titre
            datas.esp2 = G.titrant
            type = "data_dosage_ac"
            break
        case cts.TYPE_OXYDO:
            datas.type = G.typeDetail
            datas.c3 = G.reactif.conc
            datas.c4 = G.exc.conc
            datas.v3 = G.reactif.vol
            datas.v4 = G.exc.vol | 0
            datas.pH = G.ph
            datas.eq = JSON.stringify( G.equation.params )
            type = "data_dosage_ox"
    }

    return getData( cts.DATA_GET_DOSAGE, cts.DATA_GET_DOSAGE_OK, { func: type, data: datas } )
}

/** Met à jour les valeurs de volume et de pH
 
 * @param {Burette} burette
 * @use roundDecimal, getArrayObjectExtremumValues
 * @use dosage.graphs.addData
 * @file dosage.datas.js
 * */
function updValues( burette, currentDosage ) {

    const C = gGraphs.currentChart

    const indexs = gGraphs.getChartIndexByID(gGraphs.idCurrentChart)

    // vol = volume versé, on ne prend que les valeurs différentes
    var vol = roundDecimal( burette.vol_verse, 3 );

    // on renvoie false si le volume a atteint la valeur max
    if ( isLimit( vol ) ) return false

    // initialise les volumes
    currentDosage.titrant.vol = vol;
    currentDosage.solution.vol = vol + currentDosage.titre.vol + currentDosage.eau.vol;
    if ( currentDosage.reactif.vol != undefined )
        currentDosage.solution.vol += currentDosage.reactif.vol;

    const type = currentDosage.getState('APPAREIL_ON' ) 
    // on enregistre le pH
    if ( type == 1 ) {
        // récupère le pH
        currentDosage.ph = _getPH();
        currentDosage.sph = currentDosage.ph.toFixed( 2 );

        // met à jour le tableau pour le graphe
        C.addData([{x:vol,y:currentDosage.ph}],indexs.dsp )
        
        // si conductance
    } else if ( type == 2 ) {
        currentDosage.cond = _getConductance( );
        currentDosage.scond = currentDosage.cond.toFixed( 2 );

        // met à jour le tableau pour le graphe
        // @ts-ignore
        C.addData({x:vol,y:currentDosage.cond},indexs.dsp )

        // potentiomètre
    } else if ( type == 3 ) {
        currentDosage.pot = _getPotentiel( );
        currentDosage.spot = currentDosage.pot.toFixed( 2 );

        // met à jour le tableau pour le graphe
        C.addData( {x:vol, y:currentDosage.pot},indexs.dsp )
    }

    return true;

    /** Récupère le pH à partir des couples v, pH calculés
    *
    * @returns {number} pH
    * @use uArray.getArrayNearIndex
    */
    function _getPH() {
        let i = new uArray( currentDosage.vols ).getArrayNearIndex( currentDosage.titrant.vol, 0 );
        return currentDosage.pHs[ i ];
    }

    /** Récupère la conductance à partir des couples v, cond calculés
     *
     * @use uArray.getArrayNearIndex, uArray.extrapolate
     * @returns {number} conductance
     */
    function _getConductance( ) {
        let i = new uArray( currentDosage.vols ).getArrayNearIndex( currentDosage.titrant.vol, 1 );
        // on extrapole
        let c = uArray.extrapolate( currentDosage.titrant.vol, i, currentDosage.vols, currentDosage.conds )
        return c
    }

    /** Récupère le potentiel à partir des couples v, cond calculés
     *
     * @use uArray.getArrayNearIndex
     * @returns {number} potentiel
     */
    function _getPotentiel( ) {
        let i = new uArray( currentDosage.vols ).getArrayNearIndex( currentDosage.titrant.vol, 1 );
        return currentDosage.pots[ i ];
    }
}


/** Efface les variables dosage
 *
 * @param {boolean} all si true on efface tout sinon uniquement pH et cond
 * @file dosage.datas.js
 */
function resetMesures( all = true ) {

    const G = gDosages.getCurrentDosage()

    // réinitialisation complète
    if ( all ) {
        G.pHs = [];
        G.dpHs = [];
        G.conds = [];
        G.pots = [];
        G.titrant = {
            vol: 0,
            conc: 0,
            type: 0,
            indics: "",
            color: ""
        };
        G.titre = {
            type: 0,
            vol: 0,
            conc: 0,
            indics: "",
            color: ""
        };
        G.ph = 0;
        G.sph = "---";
        G.cond = 0;
        G.scond = "---";
        G.pot = 0;
        G.spot = "---";
        G.vols = [];
        G.etat = etats

        // réinitialisation partielle
    } else {

        G.titrant.vol = 0
        G.solution.vol = G.titre.vol + G.eau.vol + ( isNaN( G.exc.vol ) ? 0 : G.exc.vol )

        if ( G.type & cts.TYPE_ACIDEBASE ) {
            G.ph = G.pHs[ 0 ];
            G.sph = G.ph.toFixed( 2 );
        }

        G.cond = G.conds[ 0 ];
        G.scond = G.cond.toFixed( 2 );

        if ( G.pots.length > 0 ) {
            G.pot = G.pots[ 0 ];
            G.spot = G.pot.toFixed( 2 );
        }
    }
}


/** Initialise variable dosage avec retour data
 *
 * @typedef {import('../../types/classes').Dosage} Dosage
 * @param {Dosage} G variable globale 
 * @param {object} data
 * @file dosage.datas.js
 */
function setDosageValues( G, data) {
    G.titrant.vol = 0;
    G.vols = data.vols;

    // concentrations
    G.concs = data.concs;

    // influence de la constante de cellule
    var k = cts.K * 1000;
    G.conds = data.conds.map( ( x ) => x * k );
    G.cond = G.conds[ 0 ];
    G.scond = G.cond.toFixed( 2 );

    // potentiel
    if ( undefined !== data.pots && data.pots.length > 0 ) {
        G.pots = data.pots;
        G.pot = G.pots[ 0 ]
        G.spot = G.pot.toFixed( 2 )
    } else {
        G.pots = [];
        G.pot = 0
        G.spot = "---"
    }

    // pH
    if ( G.type == cts.TYPE_ACIDEBASE ) {
        G.pHs = data.pHs;
        G.dpHs = data.dpHs;
        G.ph = G.pHs[ 0 ] ;
        G.sph = G.ph.toFixed( 2 );
    }
}


/** calcul des concentrations titre et titrant
 *
 * @param {number} titre_conc concentration titre
 * @param {number} titre_vol volume titre
 * @param {number} titrant_conc concentration titrant
 * @param {number} eau_vol volume eau
 * @returns {{titre_conc:number, titrant_conc:number}} concentration réelle
 * @file dosage.datas
 */
function setConcentrations( titre_conc, titre_vol, titrant_conc, titrant_vol, eau_vol ) {
    let vol_total = titre_vol + titrant_vol + eau_vol;
    return { titre_conc: ( titre_conc * titre_vol ) / vol_total, titrant_conc: ( titrant_conc * titrant_vol ) / vol_total }
}

/***************************************************** */
export { getDosage, resetMesures, setDosageValues, updValues, setConcentrations }