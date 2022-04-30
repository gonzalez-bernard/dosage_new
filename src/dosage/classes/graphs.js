import {Graphx} from "../graphx.js"
import {uArray} from "../../modules/utils/array.js"

/**
 * @classdesc Cette classe permer de préciser la courbe active ainsi que les paramètres et valeurs des courbes enregistrées.
 * Les courbes sont mémorisées dans le tableau 'charts'
 */
 class Graphs{

  constructor(canvas){
      
      /** @type {string[]} liste des ID des courbes enregistrées */
      this.lstID = []
      
      /** tableau de structure (tGraphID) enregistrement des courbes 
       * {id: string, chart: tDataset, visible: boolean, save: boolean, numDosage: number}
      */
      this.charts = []
      
      /** @type {string} ID de la courbe active  */
      this.idCurrentChart = ""

      /** @type {Graphx} en cours */
      this.currentChart = new Graphx(canvas)

  }

  /** Calcule et retourne un ID de courbe
   * 
   * Celui-ci est formé de deux lettres pour le type suivi du tiret et du numéro du dosage
   * @param {number} type type d'appareil 0: Ph, 1: cond et 2: pot
   * @param {number} idDosage N° du dosage
   * @returns {string} nouvel ID
   */
  genNewID(type, idDosage){
      const app = ['ph', 'cd', 'pt']
      return app[type] + idDosage
  }

  
  genYName(type, idDosage){
      switch (type){
          case 0:
              return "y_ph"+idDosage
          case 1:
              return "y_cd"+idDosage
          case 2:
              return "y_pt"+idDosage  
      }
      return ""  
  }

  /** Ajoute un ID à la liste
   * 
   * @param {string} id ID courbe
   */
  addLstID(id){
      if (this.lstID.indexOf(id) == -1)
          this.lstID.push(id)
  }

  /** Supprime un ID de la liste
   * 
   * @param {string} id ID de courbe
   */
  removeLstID(id){
      this.lstID = this.lstID.filter(v => v !== id)
  }

  /** Retourne les index des graphes dans le tableau datasets et dans le tableau charts identifié par l'ID fourni
   * 
   * @param {string} id ID
   * @returns {{'dsp': number, 'vrt': number}} dsp: index dans datasets et vrt: index dans charts 
   * @file globals.js
   */
  getChartIndexByID(id){
    let indexs = {'dsp': -1, 'vrt': -1}
    if('data' in this.currentChart.chart)
        indexs.dsp =  new uArray(this.currentChart.chart.data.datasets).getIndexObjectValue('id', id)
    indexs.vrt = new uArray(this.charts).getIndexObjectValue('id', id)
    return indexs
  }  
  
  /** Retourne l'ID correspondant au nième élément dans datasets
   * 
   * @param {number} index index de la courbe dans dataset     
   * @returns {string}
   */
  getChartIDByIndex(index){
      return this.currentChart.chart.data.datasets[index].id
  }

  /** Retourne le dataset du graphe présents dans charts
   * 
   * @param {string} id ID
   * @returns dataset
   */
  getChartByID(id){
      return this.charts.filter(c => c.id == id)[0].dataset
  }

  

  /** Supprime un graphe */
  /*
  removeGraph(id){
      gGraphs.charts = gGraphs.charts.filter(v => v.id != id)
  }
  */

  /** Modifie la visibilité d'un graphe dans le tableau 'charts' de gGraphs
   * 
   * @param {string} id ID du graphe
   * @visible {boolean|-1} indique l'état de visibilité, si -1 on inverse l'état 
  */
  setVisibility(id, visible){
      if (visible == -1)
          this.charts.filter(c => c.id == id)[0].visible = ! this.charts.filter(c => c.id == id)[0].visible
      else 
          this.charts.filter(c => c.id == id)[0].visible = visible
  }

  isVisible(index){
      return this.charts[index].visible
  }

  /** Retourne si un graphe est visible en fonction du ID
   * 
   * @param {string} id ID
   * @return {boolean}
   */
  getVisibility(id){
      return this.charts.filter(c => c.id == id)[0].visible
  }

  isSave(index){
      return this.charts[index].save
  }

  /** Sauve la courbe courante dans le tableau 'charts'
  */
  saveCurrentGraph(){
    this.charts.filter(c => c.id == this.idCurrentChart)[0].save = true
  }
}

export {Graphs}