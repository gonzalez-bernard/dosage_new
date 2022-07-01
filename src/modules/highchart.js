import * as E from "./utils/errors.js"
import { isNumeric, isString, isArray } from "./utils/type.js"
import { createObjectFromString } from "./utils/object.js"

class Highchart {

  PLOT_DURATION = 1
  PLOT_COLOR = 2
  AXES_RANGE = 3
  AXES_TICKS = 4

  constructor(container) {
    this.canvas = container

    // coordonnées de la souris en unités du graphes
    this.mouseX = -1
    this.mouseY = -1

    // états des évenements
    this.events = {
      "mousemove": -1,
    }
  }

  /** Crée le graphe
   * 
   * @param {object} options 
   * @returns 
   */
  createChart(options) {
    // @ts-ignore
    this.chart = new Highcharts.Chart(this.canvas, options)
    return this.chart
  }

  /** Désactive le listener
   * 
   */
  evntMouseMoveOff() {
    if (this.events.mousemove != -1) {
      $("#" + this.canvas).off("mousemove")
      this.events.mousemove = -1
    }
  }

  /** Active le listener
   * 
   * @param {function} callback 
   */
  evntMouseMoveOn(callback, chartIndex) {
    const self = this
    this.events.mousemove = chartIndex
    $("#" + this.canvas).on("mousemove", (evt) => {
      // @ts-ignore
      //var chart = $(this).highcharts();
      var gr = this.hChart
      const e = gr.chart.pointer.normalize(evt);
      let coord = gr.getAxisCoord(e.chartX, e.chartY, 0)
      if (gr.isInInterval(coord, 0)) {
        gr.mouseX = coord.x
        gr.mouseY = coord.y
        callback([coord.x, coord.y], chartIndex)
      }
    });
  }

  isInInterval(coords, id = 0) {
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
  getAxisCoord(x, y, id = 0) {

    return { x: this.chart.xAxis[0].toValue(x), y: this.chart.yAxis[0].toValue(y) }
  }

  /** Met à jour une série
   * 
   * @param {string|number} id identifie la série soit par son numéro soit par son nom
   * @param {array} data données 
   */
  updateSerie(id, data) {
    if (!isNumeric(id) && !isString) E.debugError(E.ERROR_PRM)
    if (!isArray(data)) E.debugError(E.ERROR_ARRAY)

    if (isNumeric(id)) {
      if (this.chart.series.length > id)
        this.chart.series[id].setData(data, true, false, false)
      //this.chart.series[id].update({data: data}, true)
      else
        E.debugError(E.ERROR_RANGE)
    } else {
      const serie = this.chart.series.filter(e => e.name == id)[0]
      if (serie)
        serie.setData(data, false, false, false)
      else
        E.debugError(E.ERROR_RANGE)
    }
    this.chart.redraw()
  }

  /** Supprime une série
   * 
   * @param {string|number} id identifie la série soit par son numéro soit par son nom
   * @param {boolean} axe indique si on doit aussi supprimer l'axe
   */
  removeSerie(id, axe = false) {
    if (!isNumeric(id) && !isString) E.debugError(E.ERROR_PRM)

    let serie

    if (isNumeric(id)) {
      if (this.chart.series.length > id) {
        serie = this.chart.series[id]
      } else
        E.debugError(E.ERROR_RANGE)
    } else {
      serie = this.chart.get(id)
    }

    if (serie) {
      if (axe) {
        const axe = this.chart.get(serie.yAxis.options.id)
        axe.remove()
      }
      serie.remove(false)
    }

    this.chart.redraw()
  }

  removeAxe(id, axe) {
    if (axe != null) {
      if (axe == "auto") {
        if (isNumeric(id)) {
          const idAxe = this.chart.chart.series[id].yAxis
          if (idAxe)
            this.chart.chart.yAxis[idAxe].remove()
        } else {
          const idAxe = id.yAxis
          if (idAxe)
            this.chart.chart.yAxis[idAxe].remove()
        }
      } else {
        if (isNumeric(axe)) {
          this.chart.chart.yAxis[axe].remove()
        }
      }
    }
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
        E.debugError(E.ERROR_PRM)
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

  update(options, redraw = true, replace = false, animation = true) {
    this.chart.update(options, redraw, replace, animation)
  }

  /** retourne le tableau de points de la courbe identifiée par id
   * 
   * @param {number|string} id index ou nom de la série
   * @returns {[]|boolean} tableau des points
   */
  getData(id) {
    if (!isNumeric(id) && !isString) E.debugError(E.ERROR_PRM)

    let serie

    if (isNumeric(id)) {
      if (this.chart.series.length > id) {
        serie = this.chart.series[id]
      } else
        E.debugError(E.ERROR_RANGE)
    } else {
      serie = this.chart.get(id)
    }

    if (serie)
      return serie.data
    else
      return false
  }

  /** Retourne l'index de la série et la série à partir du nom
   * 
   * @param {string} id nom de la série
   * @returns {{index:number, serie: object}}
   */
  getSeriefromName(id) {
    const serie = this.chart.get(id)
    return { index: serie.index, serie: serie }
  }

  /** Retourne le nom de la série à partir de son index
   * 
   * @param {number} id index de la série
   * @returns {string} nom de la série
   */
  getNamefromIndex(id) {
    return this.chart.series[id].name
  }
}

export { Highchart }