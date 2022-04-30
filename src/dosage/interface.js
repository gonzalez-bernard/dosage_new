import { initDosage as _initDosage} from "./dosage.js";
import { displayEspece as _displayEspece} from "./dosage.ui.js";
import {setEvents as _setEvents} from "./dosage.events.js"
import {getDosage as _getDosage} from "./dosage.datas.js";
/**
 * @typedef {import("../../types/classes").Dosage} Dosage
 * @typedef {import("../../types/types").tLab} tLab
 * @typedef {import("../../types/types.js").tDataset} tDataset 
 * @typedef {import("../../types/types.js").tGraphID} tGraphID
 * @typedef {import("../../types/types.js").tEvent} tEvent
 */

/** Met  à jour les informations du formulaire
 * interface dosage/initDosage
 * @param {Dosage} dosage dosage
 * @use {@link _initDosage initDosage}
 */
const initDosage = (dosage) => {_initDosage(dosage)};

/** Action à faire en cas de fermeture du dialogue "dspErrorMessage"
 *  On bascule sur l'onglet Especes
 *  @use {@link _displayEspece displayEspece}
 */
const displayEspece = () => {_displayEspece()}

/** Définit les événements
 *  @use {@link _setEvents setEvents}
 */
const setEvents = () => {_setEvents()}

export {initDosage, displayEspece, setEvents}