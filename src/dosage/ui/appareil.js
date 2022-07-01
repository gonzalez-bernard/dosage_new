/**
 * Appareil.js
 * 
 * @module dosage/ui/Appareil
 * @description
 * - définit les fonctions utiles au différents appareils
 * ***
 * ***export display***
 */

import { gDosage, gGraphs } from "../../environnement/globals.js"
import * as E from "../../modules/utils/errors.js"
import { isNumeric, isObject, isString } from "../../modules/utils/type.js"
import { getEltID } from "../../modules/utils/html.js"
import { DOS_CHART, DOS_DIV_GRAPH } from "./html_cts.js";
import { displayGraphs, graphManager, showGraph } from "../dosage.graph.js";
import { setButtonState, setButtonVisible } from "../dosage.ui.js";

/**
* @typedef {import("../../../types/classes").Potentiometre} Potentiometre
* @typedef {import("../../../types/classes").Phmetre} Phmetre
* @typedef {import("../../../types/classes").Conductimetre} Conductimetre
* @typedef {import("../../../types/classes").Becher} Becher
* @typedef {import('../../../types/classes').Canvas} Canvas
* @typedef {import('../../../types/types').tAPPAREIL} tAPPAREIL
* @typedef {import('../../../types/types').tPoint} tPoint
* @typedef {import('../../../types/interfaces').iCanvasImage} iCanvasImage
* @typedef {import('../../../types/interfaces').iCanvasText} iCanvasText
  @typedef {import("../../../types/classes").Dosage} Dosage
*/


/** appareil.js 
 * 
 * @class Appareil
*/
class Appareil {

  /**
   * 
   * @param {tAPPAREIL} app structure
   * @param {Canvas} canvas 
   * @param {string} unite 
   */
  constructor(app, canvas, unite, type) {

    if (!isObject(app) || !isObject(canvas)) E.debugError(E.ERROR_OBJ)
    if (!isString(unite)) E.debugError(E.ERROR_STR)

    /** @type {tAPPAREIL}  */
    this.app = app;
    this.canvas = canvas;
    /** @type {number} */
    this.mesure = 0

    // indique le type d'appareil
    this.type = type;

    /** indique si appareil actif (1) 
     * @type {number} 
     */
    this.etat = 0

    /** @type {string} */
    this.unite = unite

    /** @type {number} */
    this.offsetX = app.offsetX
    this.offsetY = app.offsetY

    /** @type {string} */
    this.fill = ""

    /** @type {number} */
    this.zindex = 0

    /** @type {number} */
    this.abs_x = this.abs_y = 0

    /** @type {tPoint} */
    this.origin = { x: 0, y: 0 }

    /** @type {string} */
    this.image = app.image

    /** @type {iCanvasImage} */
    this.fond = canvas.display.image({
      x: app.x,
      y: app.y,
      width: app.w,
      height: app.h,
      image: app.image
    })

    /** @type {iCanvasText} */
    this.value = canvas.display.text({
      x: app.w / 2 + 12,
      y: app.h / 2 - 24,
      size: app.w / 9,
      text: app.value,
      fill: "#0",
      origin: { x: "center", y: "center" }
    })

  }

  /** Positionne l'appareil
   * 
   * @param {Becher} becher
   * @param {number} etat 0 : on inactive et 1 : on active  
   * 
   */
  dispose(becher, etat) {

    if (etat == 1) {
      // On active le conductimètre et on désactive le pHmètre
      this.fond.x = becher.sbecher.x + becher.sbecher.w / 2 + this.offsetX
      this.fond.y = becher.sbecher.y - becher.sbecher.h + this.offsetY
    } else {
      this.fond.x = this.app.x
      this.fond.y = this.app.y
      this.value.text = "----"
    }
  }

  /** Inscrit valeur dans affichage
   * 
   * @param {string} val valeur à afficher
   */
  setText(val) {

    if (!isString(val)) E.debugError(E.ERROR_STR)

    if (this.etat == 1) {
      this.value.text = val + " " + this.unite;
    }
  }

}


/** Gère l'ensemble des actions lors d'un double clic sur un appareil
 * 
 * @param {Dosage} dosage instance de Dosage
 * @param {Appareil} app instance appareil 
 * @param {Becher} becher instanec bécher 
 * @returns 
 */
function dbClicHandler(dosage, app, becher) {

  // actualise et positionne appareil
  if (!updateAppareil(app, becher)) return false

  // désactive dbClic
  dosage.setState('APPAREIL_ON', 1 - app.etat)

  // active ou déscative le dosage
  dosage.setState('DOSAGE_ON', app.etat)

  // gestion du graphe
  graphManager(dosage.getState('APPAREIL_TYPE'), -1)
  displayGraphs()
  showGraph()
  // actualise les boutons
  setButtonVisible(true)
  setButtonState(true)

  return false
}

/** Affiche ou cache les graphes
 * 
 * @param {string} app nom de l'appareil (ph, cd ou pt) 
 * @returns void
 * @public
 * @file initAppareil.js
 * 
 */
function display(app) {
  if (!isString(app)) E.debugError(E.ERROR_STR)

  getEltID(DOS_DIV_GRAPH).show();
  getEltID(DOS_CHART).show();
}

/** Change l'état de l'appareil et le positionne
 * 
 * @param {Phmetre|Conductimetre|Potentiometre} app Objet décrivant l'appareil 
 * @param {Becher} becher 
 * @param {number} [etat] indique si l'appareil est actif 0 (non), 1 (oui) 
 * @returns {boolean}
 */
function updateAppareil(app, becher, etat = undefined) {

  // annule l'action si un autre appareil est branché
  const type = gGraphs.getState('GRAPH_TYPE')
  if (type !== app.type && type !== 0) return false

  // annule si mesure impossible ou especes non définies
  if (gDosage.getState('ESPECES_INIT') == 0) return false

  // change l'état de branchement de l'appareil
  if (etat) 
    app.etat = etat
  else
    app.etat = 1 - app.etat

  // Positionne l'appareil
  _setAppareil(app, becher)

  // actualise etat
  if (app.etat != 0)
    gDosage.setState('APPAREIL_TYPE', app.type)
  else
    gDosage.setState('APPAREIL_TYPE', 0)
    
  return true

}

/** Mise en place de l'appareil
  
  Initie le graphe ou le met à jour, affiche le pH, update le bouton
  @param {Phmetre|Potentiometre|Conductimetre} app
  @param {Becher} becher
  @returns void
  @public
  @file initPhmetre.js
*/
function _setAppareil(app, becher) {

  // Positionne le phmetre ou le remet en place
  app.dispose(becher, app.etat);

  // actualise le texte
  let text = ""
  if (app.constructor.name == 'Phmetre') text = app.etat == 1 ? gDosage.sph : "- - -"
  else if (app.constructor.name == 'Conductimetre') text = app.etat == 1 ? gDosage.scond : "- - -"
  else if (app.constructor.name == 'Potentiometre') text = app.etat == 1 ? gDosage.spot : "- - -"

  app.setText(text);
}

export { Appareil, display, updateAppareil, dbClicHandler }