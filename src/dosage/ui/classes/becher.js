
import {isNumeric, isColor} from "../../../modules/utils/type.js"
import {ERROR_COLOR, ERROR_NUM, ERROR_RANGE} from "../../../modules/utils/errors.js"

/**
 * @typedef {import ('../../../../types/classes').Canvas} Canvas
 * @typedef {import ('../../../../types/types').tBECHER} tBECHER
 */

/**  Création bécher 
 *
 * @class Becher
 * @classdesc Construit l'objet Becher
 * @param {tBECHER} sbecher
 * @param {Canvas} canvas 
*/
 class Becher {

    constructor(sbecher, canvas){
      
      this.canvas = canvas
      this.sbecher = sbecher
      this.volume = 0
      this.contenu = 0
      this.fVolumeContenu = 0
      this.x = 0
      this.y = 0
      this.w = 0
      this.h = 0
      this.image = undefined

      // fond
      this.fond = canvas.display.image({
        x: sbecher.x,
        y: sbecher.y,
        width: sbecher.w,
        height: sbecher.h,
        image: sbecher.image
      })

      // image
      this.becher_image = this.fond.clone({x:0, y:0})

      // contenu
      this.contenu = canvas.display.rectangle({
        origin: {x:"center",y:"top"},
        x: this.becher_image.width/2,
        y: this.becher_image.height,
        width: sbecher.w - 6,
        height: 0,
        fill: sbecher.color,
      })
    

      this.fond.addChild(this.contenu)
      this.fond.addChild(this.becher_image)
    }

    /** Modifie la couleur du contenu du bécher
     * 
     * Le paramètre doit avoir le format suivant "#xxxxxx","#xxxxxxxx" ou rgba(r,v,b,a)
     * @param {string} color  couleur
     * @returns void
     * @public
     * @file becher.js
     */
    setColor(color){
      if (! isColor(color))  throw new TypeError(ERROR_COLOR)
      this.contenu.fill = color
      this.canvas.redraw()
    }
    
    /** Remplit le bécher. Ajuste les niveaux et actualise la propriété volume
     * 
     * @param {number} debit - débit
     * @param {number} volume - volume initial
     * @param {number} mode - indique le type d'action 0 : volume titre initial, 1 : ajout de titrant, 2 : modification du volume initial 
     * @returns void
     * @public
     * @file becher.js
     */
    remplir(debit, volume=0, mode = 0){
      if (! isNumeric(debit) || ! isNumeric(volume) || !isNumeric(mode)) throw TypeError(ERROR_NUM)

      if (mode == 0){
        this.contenu.y = this.becher_image.height-volume*this.sbecher.fVolumeContenu
        this.contenu.height = volume*this.sbecher.fVolumeContenu
        this.volume = volume
      }
      else if (mode == 1 && debit > 0){
        this.contenu.y -= debit*0.9
        this.contenu.height += debit*0.9
        this.volume += debit
      } else {
        var dV = volume - this.volume
        if (dV != 0) {
          this.contenu.y -= dV
          this.contenu.height += dV
          this.volume = volume
        }   
      }
    }

    /** Affiche le bécher en grand
     * 
     * @param {number} mode : 0 = normal, 1 = détail
     * @returns void
     * @public
     * @file becher.js
     */
    showDetail(mode){
      
      if (mode != 0 && mode != 1) throw new TypeError(ERROR_RANGE)
        
      var o = this.fond
      if (mode == 0){
        o.scale(1,1)
        o.x = this.sbecher.x
        o.y = this.sbecher.y
      } else {
        this.fond.scale(1.5,1.5)
        o.x = this.sbecher.x - 20
        o.y = this.sbecher.y - 50
      }
      this.canvas.redraw()
    }

    /** Remet le niveau initial
     * 
     * @param {number} vol 
     * @returns void
     * @public
     * @file becher.js
     */
    reset(vol){
      this.remplir(0, vol, 0);
      this.setColor("rgba(255,255,255,0.7)");
    }
}


export {Becher}