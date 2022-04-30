import {initDataInfo as _initDataInfo} from "./especes.ui.js"
import {resetForm as _resetForm} from "./especes.ui.js"
import {updEspeces as _updEspeces} from "./especes.ui.js"
import {initEspeces as _initEspeces} from "./especes.ui.js"
import {dspTabEspeces as _dspTabEspeces} from "./especes.ui.js"

/**
 * @typedef {import("../../types/classes").Dosage} Dosage
 * @typedef {import("../../types/types").tDataInfo} tDataInfo
 * @typedef {import("../../types/types.js").tDataset} tDataset 
 * @typedef {import("../../types/types.js").tGraphID} tGraphID
 * @typedef {import("../../types/types.js").tEvent} tEvent
 */

/** Initialise l'objet utilisé par dspInfo avec les données saisies
 * 
 * @param {Dosage} dosage
 * @returns {tDataInfo} objet utilisé par dspInfo
 */
const initDataInfo = (dosage) => {return _initDataInfo(dosage)}

/** Rafraîchit le formulaire
 * 
 */
const resetForm = () => {_resetForm()}

/** Cache affichage concentration pour problème
 * 
 * G.inconnu est un tableau d'objet ou un objet
 * @param {Dosage} dosage
 * @returns void
 */
const updEspeces = (dosage) => {_updEspeces(dosage)}

/** Initialise le formulaire
  
  Récupère les listes d'espèces à partir du fichier
  @param {Dosage} dosage variable global
*/
const initEspeces = (dosage) => {_initEspeces(dosage)}

/** Active ou désactive l'onglet
 * 
 * @param {boolean} display indique si on active ou non 
 * @file especes.ui.js
 */
const dspTabEspeces = (display) => {_dspTabEspeces(display)}

export {initDataInfo, resetForm, updEspeces, initEspeces, dspTabEspeces}