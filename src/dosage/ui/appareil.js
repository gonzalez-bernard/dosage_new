/**
 * Appareil.js
 * 
 * @module dosage/ui/Appareil
 * @description
 * - définit les fonctions utiles au différents appareils
 * ***
 * ***export display***
 */

import { gDosages } from "../../environnement/globals.js"
import { cts } from "../../environnement/constantes.js";
import { ERROR_OBJ, ERROR_NUM, ERROR_STR } from "../../modules/utils/errors.js"
import { isNumeric, isObject, isString } from "../../modules/utils/type.js"
import { getEltID } from "../../modules/utils/html.js"
import { DOS_CHART, DOS_DIV_GRAPH } from "./html_cts.js";

/**
* @typedef {import("../../../types/classes").Potentiometre} Potentiometre
* @typedef {import("../../../types/classes").Phmetre} Phmetre
* @typedef {import("../../../types/classes").Conductimetre} Conductimetre
* @typedef {import("../../../types/classes").Becher} Becher
* @typedef {import('../../../types/classes').Canvas} Canvas
*  @typedef {import('../../../types/types').tAPPAREIL} tAPPAREIL
*  @typedef {import('../../../types/types').tPoint} tPoint
*  @typedef {import('../../../types/interfaces').iCanvasImage} iCanvasImage
*  @typedef {import('../../../types/interfaces').iCanvasText} iCanvasText
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
  constructor(app, canvas, unite) {

    if (!isObject(app) || !isObject(canvas)) throw new TypeError(ERROR_OBJ)
    if (!isString(unite)) throw new TypeError(ERROR_STR)

    this.G = gDosages.getCurrentDosage()

    /** @type {tAPPAREIL}  */
    this.app = app;
    this.canvas = canvas;
    /** @type {number} */
    this.mesure = 0

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
   * 
   */
  dispose(becher) {

    if (this.etat == 1) {
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

    if (!isString(val)) throw new TypeError(ERROR_STR)

    if (this.etat == 1) {
      this.value.text = val + " " + this.unite;
    }
  }
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
  if (!isString(app)) throw new TypeError(ERROR_STR)

  getEltID(DOS_DIV_GRAPH).show();
  getEltID(DOS_CHART).show();
}

/** Change l'état de l'appareil et le positionne
 * 
 * @param {Phmetre|Conductimetre|Potentiometre} app Objet décrivant l'appareil 
 * @param {Becher} becher 
 * @returns {boolean}
 */
function updateAppareil(app, becher) {
  const G = gDosages.getCurrentDosage()

  // détecte le type d'appareil
  let type = G.getState('APPAREIL_TYPE')

  // annule l'action si un autre appareil est branché
  if (G.getState('GRAPH_TYPE') == (type + 1) % 3 || G.getState('GRAPH_TYPE') == (type + 2) % 3) return false

  // annule si mesure impossible ou especes non définies
  if (G.getState('ESPECES_INIT') == 0) return false

  // change l'état de branchement de l'appareil
  //G.setState(etats[type], -1)

  // Positionne l'appareil
  setAppareil(app, becher)

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
function setAppareil(app, becher) {

  const G = gDosages.getCurrentDosage()

  // Positionne le phmetre ou le remet en place
  app.dispose(becher);

  // actualise le texte
  let text = ""
  if (app.constructor.name == 'Phmetre') text = app.etat == 1 ? G.sph : "- - -"
  else if (app.constructor.name == 'Conductimetre') text = app.etat == 1 ? G.scond : "- - -"
  else if (app.constructor.name == 'Potentiometre') text = app.etat == 1 ? G.spot : "- - -"

  app.setText(text);
}

export { Appareil, display, updateAppareil }