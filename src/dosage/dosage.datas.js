/** dosage.datas.js 
 * 
 * Gestion des données
*/

import { gGraphs, gDosage } from "../environnement/globals.js";
import { cts} from "../environnement/constantes.js";
import { roundDecimal } from "../modules/utils/number.js";
import { uArray } from "../modules/utils/array.js";
import { getData } from "../data.js"
 
/** @typedef {import('../../types/classes').Burette} Burette */

/** Récupère les espèces à partir de Python
 * 
 * @param {number|string} type
 * @returns Promise
 * @use getData
 * @file dosage.datas.js
 */
async function getDosage(type) {

    const datas = {
        type: gDosage.typeDetail,
        c1: gDosage.titre.conc,
        c2: gDosage.titrant.conc,
        v1: gDosage.titre.vol,

        ve: gDosage.eau.vol | 0,

        v_max: 25,
        eq: JSON.stringify(gDosage.equation.params),
    }

    switch (type) {
        case cts.TYPE_ACIDEBASE:
            datas.type = 1 - (gDosage.titre.type % 2)
            datas.pK = gDosage.titre.pka
            datas.esp1 = gDosage.titre
            datas.esp2 = gDosage.titrant
            type = "data_dosage_ac"
            break
        case cts.TYPE_OXYDO:
            datas.type = gDosage.typeDetail
            datas.c3 = gDosage.reactif.conc
            datas.c4 = gDosage.exc.conc
            datas.v3 = gDosage.reactif.vol
            datas.v4 = gDosage.exc.vol | 0
            datas.pH = gDosage.ph
            datas.eq = JSON.stringify(gDosage.equation.params)
            type = "data_dosage_ox"
    }

    return getData(cts.DATA_GET_DOSAGE, cts.DATA_GET_DOSAGE_OK, { func: type, data: datas })
}

/** Met à jour les valeurs de volume et de pH
 
 * @param {Burette} burette
 * @use roundDecimal, getArrayObjectExtremumValues
 * @use dosage.graphs.addData
 * @file dosage.datas.js
 * */
function updValues(burette, currentDosage) {

    const C = gGraphs.currentChart

    // vol = volume versé, on ne prend que les valeurs différentes
    var vol = roundDecimal(burette.vol_verse, 3);

    // on renvoie false si le volume a atteint la valeur max
    //if ( isLimit( vol ) ) return false

    // initialise les volumes
    currentDosage.titrant.vol = vol;
    currentDosage.solution.vol = vol + currentDosage.titre.vol + currentDosage.eau.vol;
    if (currentDosage.reactif.vol != undefined)
        currentDosage.solution.vol += currentDosage.reactif.vol;

    const type = currentDosage.getState('APPAREIL_TYPE')
    // on enregistre le pH
    if (type == 1) {
        // récupère le pH
        currentDosage.ph = _getPH();
        currentDosage.sph = currentDosage.ph.toFixed(2);

        // met à jour le tableau pour le graphe
        C.data.push({ x: vol, y: currentDosage.ph })
        //console.log(vol, currentDosage.ph)

        // si conductance
    } else if (type == 2) {
        currentDosage.cond = _getConductance();
        currentDosage.scond = currentDosage.cond.toFixed(2);
        C.data.push({ x: vol, y: currentDosage.cond })

        // potentiomètre
    } else if (type == 3) {
        currentDosage.pot = _getPotentiel();
        currentDosage.spot = currentDosage.pot.toFixed(2);
        C.data.push({ x: vol, y: currentDosage.pot })
    }
    let options = {
        serie: {
            name: gGraphs.idCurrentChart,
            data: C.data
        }
    }

    // met à jour les données pour le graphe
    C.hChart.updateSerie(gGraphs.idCurrentChart, C.data)

    return true;

    /** Récupère le pH à partir des couples v, pH calculés
    *
    * @returns {number} pH
    * @use uArray.getArrayNearIndex
    */
    function _getPH() {
        let i = new uArray(currentDosage.vols).getArrayNearIndex(currentDosage.titrant.vol, 0);
        return currentDosage.pHs[i];
    }

    /** Récupère la conductance à partir des couples v, cond calculés
     *
     * @use uArray.getArrayNearIndex, uArray.extrapolate
     * @returns {number} conductance
     */
    function _getConductance() {
        let i = new uArray(currentDosage.vols).getArrayNearIndex(currentDosage.titrant.vol, 1);
        // on extrapole
        let c = uArray.extrapolate(currentDosage.titrant.vol, i, currentDosage.vols, currentDosage.conds)
        return c
    }

    /** Récupère le potentiel à partir des couples v, cond calculés
     *
     * @use uArray.getArrayNearIndex
     * @returns {number} potentiel
     */
    function _getPotentiel() {
        let i = new uArray(currentDosage.vols).getArrayNearIndex(currentDosage.titrant.vol, 1);
        return currentDosage.pots[i];
    }
}

/** retourne les données en fonction de l'ID
 * 
 * @param {string} id ID de la courbe 
 * @returns {number[]} données
 */
 function getValues(id) {
    const _values = [gDosage.pHs.map(Number), gDosage.conds.map(Number), gDosage.pots.map(Number)]
    const _types = ['ph', 'cd', 'pt']

    // index 0 = pH, 1 = CD et 2 = PT 
    return _values[_types.indexOf(id.substring(0, 2))]
}

/** Efface les variables dosage
 *
 * @param {boolean} all si true on efface tout sinon uniquement pH et cond
 * @file dosage.datas.js
 */
function resetMesures(all = true) {

    // réinitialisation complète
    if (all) {
        gDosage.pHs = [];
        gDosage.dpHs = [];
        gDosage.conds = [];
        gDosage.pots = [];
        gDosage.titrant = {
            vol: 0,
            conc: 0,
            type: 0,
            indics: "",
            color: ""
        };
        gDosage.titre = {
            type: 0,
            vol: 0,
            conc: 0,
            indics: "",
            color: ""
        };
        gDosage.ph = 0;
        gDosage.sph = "---";
        gDosage.cond = 0;
        gDosage.scond = "---";
        gDosage.pot = 0;
        gDosage.spot = "---";
        gDosage.vols = [];
        

        // réinitialisation partielle
    } else {

        gDosage.titrant.vol = 0
        gDosage.solution.vol = gDosage.titre.vol + gDosage.eau.vol + (isNaN(gDosage.exc.vol) ? 0 : gDosage.exc.vol)

        if (gDosage.type & cts.TYPE_ACIDEBASE) {
            gDosage.ph = gDosage.pHs[0];
            gDosage.sph = gDosage.ph.toFixed(2);
        }

        gDosage.cond = gDosage.conds[0];
        gDosage.scond = gDosage.cond.toFixed(2);

        if (gDosage.pots.length > 0) {
            gDosage.pot = gDosage.pots[0];
            gDosage.spot = gDosage.pot.toFixed(2);
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
function setDosageValues(G, data) {
    gDosage.titrant.vol = 0;
    gDosage.vols = data.vols;

    // concentrations
    gDosage.concs = data.concs;

    // influence de la constante de cellule
    var k = cts.K * 1000;
    gDosage.conds = data.conds.map((x) => x * k);
    gDosage.cond = gDosage.conds[0];
    gDosage.scond = gDosage.cond.toFixed(2);

    // potentiel
    if (undefined !== data.pots && data.pots.length > 0) {
        gDosage.pots = data.pots;
        gDosage.pot = gDosage.pots[0]
        gDosage.spot = gDosage.pot.toFixed(2)
    } else {
        gDosage.pots = [];
        gDosage.pot = 0
        gDosage.spot = "---"
    }

    // pH
    if (gDosage.type == cts.TYPE_ACIDEBASE) {
        gDosage.pHs = data.pHs;
        gDosage.dpHs = data.dpHs;
        gDosage.ph = gDosage.pHs[0];
        gDosage.sph = gDosage.ph.toFixed(2);
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
function setConcentrations(titre_conc, titre_vol, titrant_conc, titrant_vol, eau_vol) {
    let vol_total = titre_vol + titrant_vol + eau_vol;
    return { titre_conc: (titre_conc * titre_vol) / vol_total, titrant_conc: (titrant_conc * titrant_vol) / vol_total }
}

/***************************************************** */
export { getDosage, resetMesures, setDosageValues, updValues, setConcentrations, getValues }