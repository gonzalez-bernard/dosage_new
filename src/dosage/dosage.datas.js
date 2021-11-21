import {G} from "../environnement/globals.js";
import * as cts from "../environnement/constantes.js";
import { roundDecimal } from "../modules/utils/number.js";
import { isLimit, addData } from "./dosage.graph.js";
import { uArray } from "../modules/utils/array.js";


/** Met à jour les valeurs de volume et de pH
 *
 * @use roundDecimal, getArrayObjectExtremumValues, _getPH, _getConductance, _getPotentiel
 * @see {@link module:dosage/graph_utils~isLimit}
 * @see {@link module:dosage/graph_utils~addData}
 * @returns {boolean}
 * @public
 * @file dosage.datas.js
 * */
function updValues(burette) {
  // vol = volume versé, on ne prend que les valeurs différentes
  var vol = roundDecimal(burette.vol_verse, 3);

  // on renvoie false si le volume a atteint la valeur max
  if (isLimit(vol)) return false

  // initialise les volumes
  G.titrant.vol = vol;
  G.solution.vol = vol + G.titre.vol + G.eau.vol;
  if (G.reactif.vol != undefined)
      G.solution.vol += G.reactif.vol;

  // on enregistre le pH
  if (G.test('etat',cts.ETAT_PHMETRE)) {
      // récupère le pH
      G.ph = _getPH(G.titrant.vol);
      G.sph = G.ph.toFixed(2);

      // met à jour le tableau pour le graphe
      addData(G.charts.chartPH, vol, G.ph)

      // si conductance
  } else if (G.test('etat',cts.ETAT_COND)) {
      G.cond = _getConductance(G.titrant.vol);
      G.scond = G.cond.toFixed(2);

      // met à jour le tableau pour le graphe
      addData(G.charts.chartCD, vol, G.cond)

      // potentiomètre
  } else if (G.test('etat',cts.ETAT_POT)) {
      G.pot = _getPotentiel(G.titrant.vol);
      G.spot = G.pot.toFixed(2);

      // met à jour le tableau pour le graphe
      addData(G.charts.chartPT, vol, G.pot)

  }

  return true;
}

/********************************************************** */

/** Efface les variables dosage
 *
 * @param {boolean} all si true on efface tout sinon uniquement pH et cond
 */
function resetMesures(all = true) {
  // réinitialisation complète
  if (all) {
      G.pHs = [];
      G.dpHs = [];
      G.conds = [];
      G.pots = [];
      G.titrant = {
          vol: undefined,
          conc:undefined
      };
      G.titre = {
          vol: undefined,
          conc:undefined
      };
      G.ph = 0;
      G.sph = "---";
      G.cond = 0;
      G.scond = "---";
      G.pot = 0;
      G.spot = "---";
      G.vols = [];
      G.etat = 0

      // réinitialisation partielle
  } else {

      G.titrant.vol = 0
      G.solution.vol = G.titre.vol + G.eau.vol + (isNaN(G.exc.vol) ? 0 : G.exc.vol)

      if (G.type & cts.TYPE_ACIDEBASE) {
          G.ph = G.pHs[0];
          G.sph = G.ph.toFixed(2);
      }

      G.cond = G.conds[0];
      G.scond = G.cond.toFixed(2);

      if (G.pots.length > 0) {
          G.pot = G.pots[0];
          G.spot = G.pot.toFixed(2);
      }
  }
}

/********************************************************** */

/** Initialise variable dosage avec retour data
 *
 * @param {Dosage} G variable globale 
 * @param {object} data
 * @param {string} type 'ph' ou 'ox'
 * @public
 * @file dosage.datas.js
 * @external dosage_ox~initDosageOX
 */
function setDosageValues(G, data, type = undefined) {
  G.titrant.vol = 0;
  G.vols = data.vols;

  // concentrations
  G.concs = data.concs;

  // influence de la constante de cellule
  var k = cts.K * 1000;
  G.conds = data.conds.map((x) => x * k);
  G.cond = G.conds[0];
  G.scond = G.cond.toFixed(2);

  // potentiel
  if (undefined !== data.pots && data.pots.length > 0) {
      G.pots = data.pots;
      G.pot = G.pots[0]
      G.spot = G.pot.toFixed(2)
  } else {
      G.pots = [];
      G.pot = 0
      G.spot = "---"
  }

  // pH
  if (type == "ph") {
      G.pHs = data.pHs;
      G.dpHs = data.dpHs;
      G.ph = parseFloat(G.pHs[0]);
      G.sph = G.ph.toFixed(2);
  }
}

/** Récupère le pH à partir des couples v, pH calculés
 *
 * @param vol {number} volume
 * @returns {number} pH
 * @use uArray.getArrayNearIndex
 */
 function _getPH(vol) {
  let i = new uArray(G.vols).getArrayNearIndex(vol, 0);
  return G.pHs[i];
}

/********************************************************** */

/** Récupère la conductance à partir des couples v, cond calculés
 *
 * @param vol {number} volume
 * @use uArray.getArrayNearIndex, uArray.extrapolate
 * @returns {number} conductance
 */
 function _getConductance(vol) {
  let i = new uArray(G.vols).getArrayNearIndex(vol, 1);
  // on extrapole
  let c = uArray.extrapolate(vol, i, G.vols, G.conds)
  return c
}

/********************************************************** */

/** Récupère le potentiel à partir des couples v, cond calculés
*
* @param vol {number} volume
* @use uArray.getArrayNearIndex
* @returns {number} potentiel
*/
function _getPotentiel(vol) {
  let i = new uArray(G.vols).getArrayNearIndex(vol, 1);
  return G.pots[i];
}

/** calcul des concentrations titre et titrant
 *
 * @param {number} titre_conc concentration titre
 * @param {number} titre_vol volume titre
 * @param {number} titrant_conc concentration titrant
 * @param {number} eau_vol volume eau
 * @returns {{titre_conc:number, titrant_conc:number}} concentration réelle
 * @public
 * @file dosage.datas
 * @external dosage_ph
 */
 function setConcentrations(titre_conc, titre_vol, titrant_conc, titrant_vol, eau_vol) {
    let vol_total = titre_vol + titrant_vol + eau_vol;
    return {titre_conc:(titre_conc * titre_vol) / vol_total, titrant_conc:(titrant_conc * titrant_vol) / vol_total}
}

/***************************************************** */
export {resetMesures, setDosageValues, updValues, setConcentrations}