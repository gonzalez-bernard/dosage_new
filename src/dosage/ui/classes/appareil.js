import {gDosages} from "../../../environnement/globals.js"
import {isNumeric, isObject, isString} from "../../../modules/utils/type.js"
import {ERROR_OBJ, ERROR_NUM, ERROR_STR} from "../../../modules/utils/errors.js"

/**
* @typedef {import('../../../../types/classes').Canvas} Canvas
* @typedef {import('../../../../types/classes').Becher} Becher
* @typedef {import('../../../../types/types').tAPPAREIL} tAPPAREIL
* @typedef {import('../../../../types/types').tPoint} tPoint
* @typedef {import('../../../../types/interfaces').iCanvasImage} iCanvasImage
* @typedef {import('../../../../types/interfaces').iCanvasText} iCanvasText
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
    
    this.G = gDosages.getCurrentDosage()

    /** @type {tAPPAREIL}  */
    this.app = app;
    this.canvas = canvas;
    /** @type {number} */
    this.mesure = 0

    /** @type {number} */
    this.etat = etat

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
    this.origin = {x:0, y:0}

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
      x: app.w/2+12,
      y: app.h/2-24,
      size: app.w/9,
      text: app.value,
      fill: "#0",
      origin: {x:"center",y:"center"}
    })
  }

    /** Positionne l'appareil
     * 
     * @param {Becher} becher 
     * 
     */
    dispose(becher){
  
      if (this.G.etat & this.etat){
        // On active le conductimètre et on désactive le pHmètre
        this.fond.x = becher.sbecher.x + becher.sbecher.w/2 + this.offsetX
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
    setText(val){

      if (! isString(val)) throw new TypeError(ERROR_STR)
      
      if (this.G.etat & this.etat) {
        this.value.text = val +" "+ this.unite;
      }
    }
}

export {Appareil}