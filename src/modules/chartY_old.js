import { copyDeep, hasKey, isEmpty, replace, updateItem } from "./utils/object.js"
import * as e from "./utils/errors.js"
import { isObject, isString, isNumeric, isInteger, isDefined, isArray, isFunction } from "./utils/type.js"


/**
 * @typedef {import("chart.js").ChartItem} chartItem
 * @typedef {import("../../types/types").tPoint} tPoint
 */

class ChartY {

  /** Constructeur
   *
   * @param {string}  canvas nom du canvas destinataire "#canvas"
   * 
   */
  constructor(canvas) {

    if (!isString(canvas)) throw new TypeError(e.ERROR_STR);
    /** @type {string} */
    this.canvas = canvas; // enregistre l'id du canvas
    /** @type {object} */
    this.chart = {}; // mémorise le graphe donc de type Chart
    /** @type {number} */
    this.selectedIndicePoint = -1;
    /** @type {number} */
    this.old_selectedIndicePoint = -1;
    /** @type {tPoint[]} */
    this.activePoints = [];
    /** @type {tPoint[][]} */
    this.tangente_coords = []

    // coordonnées de la souris en unités du graphes
    this.mouseX = -1
    this.mouseY = -1
  }

  createChart(container, options) {
    try {
      // @ts-ignore

      this.chart = new Highcharts.Chart(this.container, options)
      return this.chart
    } catch (err) {
      console.error(err)
    }
  }

  /** Retourne l'ID de la série
   * 
   * @param {object} config 
   * @returns {string} 
   */
  getSerieID(config) {
    return config.config.series[config.seriesIndex].name
  }

  /** Retourne l'indice du point cliqué
   * 
   * @param {object} config 
   * @returns {number}
   */
  getPointIndice(config) {
    return config.dataPointIndex
  }

  /** Retourne les coordonnées du point sélectionné
   * 
   * @param {object} config 
   * @returns {{x: number, y: number}}
   */
  getCoordSelectPoint(config) {
    return config.config.series[config.seriesIndex].data[config.dataPointIndex]
  }

  /** Retourne les coordonnées en pixels du point sélectionné
     * 
     * @param {object} config 
     * @returns {{x: number, y: number}}
     */
  getCoordPixelSelectPoint(config) {
    const x = config.globals.seriesXvalues[config.seriesIndex][config.dataPointIndex]
    const y = config.globals.seriesYvalues[config.seriesIndex][config.dataPointIndex]
    return { x: x, y: y }
  }

  getCoordMouse(config) {
    return { x: config.globals.clientX, y: config.globals.clientY }
  }

  getCoordRatio(config) {
    const coord = this.getCoordSelectPoint(config)
    const coord_pixel = this.getCoordPixelSelectPoint(config)
    this.coordRatio = { x: coord_pixel.x / coord.x, y: coord_pixel.y / coord.y }
    return this.coordRatio
  }

  /** Retourne le tableau de données
   * 
   * @param {object} config 
   * @returns [{x:number, y:number}]
   */
  getData(config) {
    return config.config.series[config.seriesIndex].data
  }


}

export { ChartY }