
/**
 * @typedef {import ('../../../../types/classes').Canvas} Canvas
 * @typedef {import ('../../../../types/types').tAGITATEUR} tAGITATEUR
 */

/**
 * @class Agitateur
 * @classdesc construit l'objet agitateur
  */
class Agitateur {
  /**
  * 
  * @param {tAGITATEUR} sagitateur données agitateur   
  * @param {Canvas} canvas canvas
   */
  constructor(sagitateur, canvas){
    this.canvas = canvas
    this.sagitateur = sagitateur
    

    /** @type {import('../../../../types/interfaces').iCanvasImage} */ 
    this.fond = canvas.display.image({
      x: sagitateur.x,
      y: sagitateur.y,
      width: sagitateur.w,
      height: sagitateur.h,
      image: sagitateur.image,
      zindex: "back"
    })
  }
}

export {Agitateur}