    /**
 * @class Dosages
 * 
 * 
 * @typedef {import('../../../types/types').tReactif} tReactif
 * @typedef {import("../../../types/types").tGraphID} tGraphID
 * @typedef {import("../../../types/classes").Dosage} Dosage
 */
class Dosages {

    constructor() {
        this.initGraph = false      // indique que le graph unique a été créé
        this.idCurrentDosage = 0,   // indice du dosage courant

          /** @type Dosage[] */
          this.dosages = []           // tableau des dosages
  }

  /** Retourne la variable Dosage globale
   * 
   * @returns {Dosage} G
   */
  getCurrentDosage() {
      return this.dosages[this.idCurrentDosage]
  }
}

export {Dosages}