/**
 * @class Especes
 * @description enregistre les listes des espèces
 */
 class Especes {

  constructor  (){
      this.lstOxydo = [] // liste des espèces oxydo
      
      this.lstAcide = [] // liste des espèces acido-basique
      this.lstEquation = [] // liste des équations
      this.listAcideBase = [] // liste des couples
      this.listOxydo = [] // liste des réactions
      this.eqs = []
  }

  /** Enregistre les listes dans la variable globale E
   * 
   * @param {*} data données
   * @file global.js
   */
  initLists( data ) {
      this.lstAcide = data.list_acidebase
      this.listAcideBase = data.acidebases
      this.listOxydo = data.autredos
      this.eqs = data.eqs
  }
}

export {Especes}