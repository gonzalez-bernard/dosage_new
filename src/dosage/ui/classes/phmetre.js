import * as cts from "../../../environnement/constantes.js"
import {G} from "../../../environnement/globals.js"
import {Appareil} from "./appareil.js"

/**  Création phmetre
 *
 * @class Phmetre
*/
class Phmetre extends Appareil{
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
      x: 5*app.w/6 -20 ,
      y: app.h/2+6,
      size: app.w/10,
      text: app.value,
      fill: "#0",
      origin: {x:"center",y:"center"},
    })

    this.fond.addChild(this.valeur)
  }
}

export {Phmetre}