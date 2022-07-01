
import * as E from "../src/modules/utils/errors.js"
import { isNumeric, isString, isArray } from "../src/modules/utils/type.js"
import { createObjectFromString } from "../src/modules/utils/object.js"

const canvas = 'chart'
let _data1 = [[0.5, 0.5], [2, 8], [3, 15]]
let _data2 = [[1.5, 0.5], [2, 5], [3, 10]]

class Highchart {

  PLOT_DURATION = 1
  PLOT_COLOR = 2
  AXES_RANGE = 3
  AXES_TICKS = 4

  constructor(container) {
    this.container = container

    // coordonnées de la souris en unités du graphes
    this.mouseX = -1
    this.mouseY = -1

    // états des évenements
    this.events = {
      "mousemove": false,
    }
  }

  /** Crée le graphe
   * 
   * @param {object} options 
   * @returns 
   */
  createChart(options) {
    // @ts-ignore
    this.chart = new Highcharts.Chart(this.container, options)
    return this.chart
  }

  /** Désactive le listener
   * 
   */
  evntMouseOut() {
    if (this.events.mousemove) {
      $("#" + this.container).off("mousemove")
      this.events.mousemove = false
    }
  }

  /** Active le listener
   * 
   * @param {function} callback 
   */
  evntMouseMove(callback) {
    const self = this
    self.events.mousemove = true
    $("#" + this.container).on("mousemove", function (evt) {
      var chart = $(this).highcharts();
      const e = chart.pointer.normalize(evt);
      let coord = self.getAxisCoord(e.chartX, e.chartY)
      //if (self.isInInterval(coord, 0)){
      self.mouseX = coord.x
      self.mouseY = coord.y
      callback(coord.x, coord.y)
      //}
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
    return { x: this.chart.xAxis[id].toValue(x), y: this.chart.yAxis[id].toValue(y) }
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
        this.chart.series[id].setData(data)
      else
        E.debugError(E.ERROR_RANGE)
    } else {
      const serie = this.chart.series.filter(e => e.name == id)[0]
      if (serie)
        serie.setData(data)
      else
        E.debugError(E.ERROR_RANGE)
    }
    this.chart.redraw()
  }

  /** Supprime une série
   * 
   * @param {string|number} id identifie la série soit par son numéro soit par son nom
   */
  deleteSerie(id) {
    if (!isNumeric(id) && !isString) E.debugError(E.ERROR_PRM)
    if (isNumeric(id)) {
      if (this.chart.series.length > id)
        this.chart.series[id].remove(false)
      else
        E.debugError(E.ERROR_RANGE)
    } else {
      const serie = this.chart.series.filter(e => e.name == id)[0]
      if (serie)
        serie.remove(false)
      else
        E.debugError(E.ERROR_RANGE)
    }
    this.chart.redraw()
  }

  /** Ajoute une série
   * 
   * @param {number[][]} data tableau des données
   * @param {object} serieOptions définit les options de la courbe (ex : name, color)
   * @param {object} axeOptions définit les options de l'axe vertical supplémentaire (ex: title { text:...}, name)
   * @param {boolean} redraw redessine le graphe  
   * @param {boolean|object} animation options de l'animation  
   */
  addSerie(data, serieOptions = null, axeOptions = null, redraw = false, animation = false) {
    serieOptions = serieOptions || {}
    serieOptions.data = data
    if (axeOptions != null) {
      if (axeOptions.name === undefined)
        E.debugError(E.ERROR_PRM)
      serieOptions.yAxis = axeOptions.name
      this.chart.addAxis(axeOptions)
    }
    this.chart.addSeries(serieOptions, redraw, animation)
  }

  /** Effectue des modifications sur les graphes
   * 
   * @param {number} operation  constante désignant l'opération à effectuer (cf. exemples)   
   * @param {number|string|(number|string)[]} param paramètres en fonction de l'opération 
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


document.addEventListener('DOMContentLoaded', function () {

  const activeEventMouse = () => {
    if (iChart.events.mousemove) {
      iChart.evntMouseOut()
    }
    else {
      iChart.evntMouseMove(distance)
    }
    console.log(iChart.events.mousemove)

  }

  const changeDataSerie = () => {
    _data2 = [[1.5, 3.5], [2, 2], [3, 6]]
    var _data3 = [[1.2, 2], [3.9, 6], [4.5, 3]]

    //iChart.updateSerie("pH", _data2)
    //iChart.deleteSerie("pH")
    //iChart.addSerie(_data3, null, null, true)
    //iChart.updateChart(iChart.PLOT_COLOR, ["scatter","#FF55FF"])
    //iChart.addSerie(_data3, { name: 'test', , color: "#0C00FF" }, { title: { text: "t3" }, id: "data3" }, true, { duration: 0 })
    iChart.updateChart(iChart.AXES_RANGE, ["xAxis", 0, 20])
    iChart.updateChart(iChart.AXES_TICKS, ["xAxis", 10, 2])
  }

  const iChart = new Highchart(canvas)
  const options = {
    chart: {
      type: 'scatter',

    },
    plotOptions: {
      series: {
        animation: {
          duration: 200
        },
        events: {
          mouseOver: (evt) => console.log(evt)
        },
      },
      scatter: {
        lineWidth: 1,
        color: '#ff2e10',
      },
    },
    title: {
      text: 'Essai'
    },
    xAxis: {
      gridLineWidth: 1,
      //tickInterval: 0.5
    },
    yAxis: {},
    legend: {},
    series: [{
      name: 'pH',
      color: '#000',
      data: _data1,
      events: {
        click: (evt) => {
          console.log(evt)
          activeEventMouse()
          //changeDataSerie()
        }
      },
    },
    ]
  }
  const chart = iChart.createChart(options)

  const distance = (x, y) => {
    console.log(x, y)
    let d = Object.assign(_data1)
    d[0] = [x, y]
    iChart.chart.series[0].setData(d, false, false, false)
    iChart.chart.redraw()
    //if (x < 1)
    //iChart.evntMouseOut()
  }

  //iChart.evntMouseMove(distance)

})


