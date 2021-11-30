import {G} from "../../../environnement/globals.js"
import {isNumeric, isObject, isString} from "../../../modules/utils/type.js"
import {ERROR_OBJ, ERROR_NUM, ERROR_STR} from "../../../modules/utils/errors.js"

/**
* @typedef {import('../../../../types/classes').Canvas} Canvas
* @typedef {import('../../../../types/classes').Becher} Becher
* @typedef {import('../../../../types/types').tAPPAREIL} tAPPAREIL
*/

/** appareil.js 
 * 
 * @class Appareil
*/
class Appareil{

  /**
   * 
   * @param {tAPPAREIL} app structure
   * @param {Canvas} canvas 
   * @param {number} etat 
   * @param {string} unite 
   */
  constructor(app, canvas, etat, unite){

    if (! isObject(app) || ! isObject(canvas)) throw new TypeError(ERROR_OBJ)
    if (! isNumeric(etat)) throw new TypeError(ERROR_NUM)
    if (! isString(unite)) throw new TypeError(ERROR_STR)
    
    this.app = app;
    this.canvas = canvas;
    this.value = app.value == undefined ? '---' : app.value
    this.mesure = false
    this.etat = etat
    this.valeur = null
    this.unite = unite
    this.offsetX = app.offsetX
    this.offsetY = app.offsetY
    this.fill = undefined
    this.zindex = 0
    this.abs_x = 0
    this.abs_y = 0
    this.origin = {x:0, y:0}
    this.image = app.image
  
    this.fond = canvas.display.image({
      x: app.x,
      y: app.y,
      width: app.w,
      height: app.h,
      image: app.image
    })}

    /** Positionne l'appareil
     * 
     * @param {Becher} becher 
     * 
     */
    dispose(becher){
  
      if (G.etat & this.etat){
        // On active le conductimètre et on désactive le pHmètre
        this.fond.x = becher.sbecher.x + becher.sbecher.w/2 + this.offsetX
        this.fond.y = becher.sbecher.y - becher.sbecher.h + this.offsetY
      } else {
        this.fond.x = this.app.x
        this.fond.y = this.app.y
        this.valeur.text = "----"
      }
    }

    /** Inscrit valeur dans affichage
     * 
     * @param {string} val valeur à afficher
     */
    setText(val){

      if (! isString(val)) throw new TypeError(ERROR_STR)
      
      if (G.etat & this.etat) {
        this.valeur.text = val +" "+ this.unite;
      }
    }
}

export {Appareil}