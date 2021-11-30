import {Appareil} from "./appareil.js"

/** 
* @typedef {import('../../../../types/classes').Canvas} Canvas 
* @typedef {import('../../../../types/types').tAPPAREIL} tAPPAREIL 
*/

/**  Création potentiomètre
 *
 * @class potentiometre
 * 
*/
class Potentiometre extends Appareil{
  
  /**
   * 
   * @param {tAPPAREIL} app 
   * @param {Canvas} canvas 
   * @param {number} etat 
   * @param {string} unite 
   */
  constructor(app, canvas, etat, unite){
    super(app, canvas, etat, unite)

    this.valeur = canvas.display.text({
      x: app.w/2+10,
      y: app.h/2-23,
      size: app.w/8,
      text: app.value,
      fill: "#0",
      origin: {x:"center",y:"center"}
    })

    this.fond.addChild(this.valeur)
  }
}

export {Potentiometre}