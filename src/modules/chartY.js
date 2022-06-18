import { copyDeep, hasKey, isEmpty, replace, updateItem } from "./utils/object.js"
import * as e from "./utils/errors.js"
import { isObject, isString, isNumeric, isInteger, isDefined, isArray, isFunction } from "./utils/type.js"
import { createObjectFromString} from "../modules/utils/object.js"



/**
 * @typedef {import("chart.js").ChartItem} chartItem
 * @typedef {import("../../types/types").tPoint} tPoint
 */

class ChartY {

  PLOT_DURATION = 1
  PLOT_COLOR = 2
  AXES_RANGE = 3
  AXES_TICKS = 4
  
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

    // états des évenements
    this.events = {
      "mousemove": false,
    }
  }

  createChart(canvas, options) {
    try {
      // @ts-ignore
      
      this.chart = new Highcharts.Chart(this.canvas, options)
      return this.chart
    } catch (err) {
      console.error(err)
    }
  }

  

  getCoordMouse(config){
    return {x:config.globals.clientX, y:config.globals.clientY}
  }

  /** Retourne le tableau de données
   * 
   * @param {object} config 
   * @returns [{x:number, y:number}]
   */
  getData(config) {
    return config.config.series[config.seriesIndex].data
  }

  /** Désactive le listener
   * 
   */
   evntMouseOut() {
    if (this.events.mousemove) {
      $("#" + this.canvas).off("mousemove")
      this.events.mousemove = false
    }
  }

  /** Active le listener
   * 
   * @param {function} callback 
   */
  evntMouseMove(callback) {
    const self = this
    $("#" + this.canvas).on("mousemove", function (evt) {
      self.events.mousemove = true
      // @ts-ignore
      var chart = $(this).highcharts();
      const e = chart.pointer.normalize(evt);
      let coord = self.getAxisCoord(e.chartX, e.chartY)
      if (self.isInInterval(coord, 0)){
        self.mouseX = coord.x
        self.mouseY = coord.y
        callback(coord.x, coord.y)
      }
    });
  }

  isInInterval(coords, id = 0){
    if (coords.x >= this.chart.xAxis[id].min && coords.x <= this.chart.xAxis[id].max && coords.y >= this.chart.yAxis[id].min && coords.y <= this.chart.yAxis[id].max) 
      return true;
    return false
  }

  /** Retourne les coordonnées en unités d'axes
   * 
   * @param {number} x abscisse
   * @param {number} y ordonnées
   * @param {number} id index de l'axe
   * @returns {{x:number, y:number}}
   */
  getAxisCoord(x,y,id=0){
    return {x: this.chart.xAxis[id].toValue(x), y: this.chart.xAxis[id].toValue(y)}
  }

  /** Met à jour une série
   * 
   * @param {string|number} id identifie la série soit par son numéro soit par son nom
   * @param {array} data données 
   */
  updateSerie(id, data) {
    if (!isNumeric(id) && !isString) throw new TypeError(e.ERROR_PRM)
    if (!isArray(data)) throw new TypeError(e.ERROR_ARRAY)

    if (isNumeric(id)) {
      if (this.chart.series.length > id)
        this.chart.series[id].setData(data)
      else
        throw new TypeError(e.ERROR_RANGE)
    } else {
      const serie = this.chart.series.filter(e => e.name == id)[0]
      if (serie)
        serie.setData(data)
      else
        throw new TypeError(e.ERROR_RANGE)
    }
    this.chart.redraw()
  }

  /** Supprime une série
   * 
   * @param {string|number} id identifie la série soit par son numéro soit par son nom
   */
  deleteSerie(id) {
    if (!isNumeric(id) && !isString) throw new TypeError(e.ERROR_PRM)
    if (isNumeric(id)) {
      if (this.chart.series.length > id)
        this.chart.series[id].remove(false)
      else
        throw new TypeError(e.ERROR_RANGE)
    } else {
      const serie = this.chart.series.filter(e => e.name == id)[0]
      if (serie)
        serie.remove(false)
      else
        throw new TypeError(e.ERROR_RANGE)
    }
    this.chart.redraw()
  }

  /** Ajoute une série
   * 
   * @param {number[][]} data tableau des données
   * @param {object} serieOptions définit les options de la courbe (ex : name, color)
   * @param {object} axeOptions définit les options de l'axe vertical supplémentaire (ex: title { text:...}, id)
   * @param {boolean} redraw redessine le graphe  
   * @param {boolean|object} animation options de l'animation  
   */
  addSerie(data, serieOptions = null, axeOptions = null, redraw = false, animation = false) {
    serieOptions = serieOptions || {}
    serieOptions.data = data
    if (axeOptions != null) {
      if (axeOptions.id === undefined)
        throw new TypeError(e.ERROR_PRM)
      serieOptions.yAxis = axeOptions.id
      this.chart.addAxis(axeOptions)
    }
    this.chart.addSeries(serieOptions, redraw, animation)
  }

  /** Effectue des modifications sur les graphes
   * 
   * @param {number} operation  constante désignant l'opération à effectuer (cf. exemples)   
   * @param {number|string|number[]|string[]} param paramètres en fonction de l'opération 
   * - PLOT_DURATION : fixe la durée de l'animation - durée (number)
   * - PLOT_COLOR : définit la couleur de dessin - [type courbe (ex: scatter), couleur]
   * - AXES_RANGE : définit min et max des axes - ["xAxis|yAxis", min, max]
   * - AXES_TICKS : définit le nombre de graduations et/ou l'intervalle entre deux graduations - ["xAxis|yAxis", tickAmount, tickInterval]. Il est possible de laisser vide un des 2 paramètres
   * 
   */
  updateChart(operation, param) {
    let o, keys
    switch (operation) {
      case this.PLOT_DURATION:
        o = {
          plotOptions: {
            series: {
              animation: {
                duration: param
              }
            }
          }
        }
        break
      case this.PLOT_COLOR:
        keys = "plotOptions/" + param[0] + "/color"
        o = createObjectFromString(keys, param[1])
        break
      case this.AXES_RANGE:
        keys = param[0]
        o = createObjectFromString(keys, {})
        o[keys].min = param[1]
        o[keys].max = param[2]
        break
      case this.AXES_TICKS:
        keys = param[0]
        o = createObjectFromString(keys, {})
        if (param[1])
          o[keys].tickAmount = param[1]
        if (param[2])
          o[keys].tickInterval = param[2]
        break
    }
    this.chart.update(o)
  }

  
}

export { ChartY }