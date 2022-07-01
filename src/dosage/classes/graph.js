// @ts-nocheck
/** graph.js 
 * 
 * @class Graph
 * @description Classe pour gérer les graphes
 * ***
 * ***export : Graph***
*/

import { gDosage } from "../../environnement/globals.js";
import * as E from "../../modules/utils/errors.js"
import { uArray } from "../../modules/utils/array.js";
import { isArray, isNumeric, isObject } from "../../modules/utils/type.js"
import { around } from "../../modules/utils/number.js";
import { Highchart } from "../../modules/highchart.js";
import { getOption } from "./graphs.js"
import { getCoordsTangente, calcDistance2Pts, getMedium } from "../../modules/utils/math.js";
import { dspContextInfo } from "../../infos/infos.js";
/**
 * @typedef {import ('../../../types/classes').Dosage} Dosage
 * @typedef {import ('../../../types/types').tPoint} tPoint 
 */

class Graph extends Highchart {

  TYPE_PH = 1
  TYPE_CD = 2
  TYPE_PT = 3
  TAN1 = "Tangente N°1"
  TAN2 = "Tangente N°2"
  PENTE = "pente"
  COLOR_TAN1 = "rgba(255,0,255,0.5)"
  ID_TAN1 = "tan1"
  COLOR_TAN2 = "rgba(0,0,255,0.5)"
  ID_TAN2 = "tan2"
  PERP = "Perp."
  ID_PERP = "perp"
  COLOR_PERP = "rgba(0,120,120,0.5)"
  DERIVEE = "derivee"
  DERIVEE_TH = "dérivée th."
  YNAME_DERIVEE = "dpH"
  DERIVEE_EXP = "dérivée exp."
  COURBE_TH = "courbe théorique"
  ID_COURBE = "theo"

  /**
   * Creates an instance of Graphx.
   * @param {string} canvas 
   * 
   * @memberOf Graphx
   */
  constructor(canvas) {
    super(canvas);
    this.data = []            // données en cours
    this.data_theorique = []; // données complètes [(x,y)...]
    this.data_derive_theorique = [];  // données de la dérivée 
    this.pentes = [];         // enregistre les pentes des tangentes
    this.indiceTangentes = [0, 0] // indice des points des tangentes
    this.type = 1; // 1 = pH, 2 = CD et 3 = PT
    this.tangente_point = 0
    this.tangente_coords = [] // coordonnées des tangentes
    this.hChart = {}
    //this.tangente_coords.push([])
  }

  createChart(canvas, id) {
    this.hChart = new Highchart(canvas)
    const options = getOption(id)
    this.hChart.createChart(options)
  }

  /** type de dosage
   * 
   * @param {1|2|3} type indique le type de dosage 
   */
  setType(type) {
    if (!isNumeric(type)) E.debugError(E.ERROR_NUM)
    if (!(type in [this.TYPE_PH, this.TYPE_CD, this.TYPE_PT])) E.debugError(E.ERROR_RANGE)
    this.type = type
  }

  /** Ajoute ou supprime la série dérivée
   * 
   * @param {number} action 0 = efface, 1 = affiche
   */
  dspDerivee(action) {

    if (action == 0) {
      this.hChart.removeSerie('dpH')
      return 0
    }

    // initialise les données théoriques
    this.initDataTheorique();
    // extrait les valeurs dérivées à partir des données réelles (data)
    const lst_derivee = this._initDerivee(this.data, this.data_derive_theorique);
    const derivee_y = new uArray(lst_derivee).extract('y')
    const axe = {
      title: { text: 'dpH' },
      min: 0,
      max: around(Math.max(...derivee_y)),
      id: 'dpH',
      opposite: true
    }
    const serie = {
      color: "#5566FF",
      type: "line",
      name: 'dpH',
      id: 'dpH',
      yAxis: 'dpH'
    }
    this.hChart.addSerie(lst_derivee, serie, axe, true)
  }

  /** Affiche la perpendiculaire entre 2 tangentes
   * 
   * @param {number} action si action = 0, on efface sinon on affiche
   */
  dspPerpendiculaire(action) {
    // la perpendiculaire est déjà affichée, on l'efface
    if (action == 0) {
      this.hChart.removeSerie('perp')
      return 0
    }

    // ratio taille
    //var rx = this.hChart.chart.chartWidth / 25;
    //var ry = this.hChart.chart.chartHeight / 14;
    //var t = rx / ry;
    var t = (24 / 12)

    // On teste si les pentes sont cohérentes
    if (Math.abs(this.pentes[1] - this.pentes[2]) / this.pentes[1] > 0.1)
      return -1;

    // On récupère les points extrêmes des tangentes et on calcule ceux de la perpendiculaire
    var pts1 = this.hChart.getData('tan1');
    var pts2 = this.hChart.getData('tan2');

    // milieu de tangente 1
    const p1 = {
      x: (pts1[0].x + pts1[2].x) / 2,
      y: (pts1[0].y + pts1[2].y) / 2,
    };
    const p2 = {
      x: (pts2[0].x + pts2[2].x) / 2,
      y: (pts2[0].y + pts2[2].y) / 2,
    };

    var perp = this._getPerpendiculaire(p1, p2, this.pentes[1], t)

    // pts de la perpendiculaire
    var pts = [];
    pts.push(p1)
    pts.push(perp.p)
    pts.push(getMedium(p1, perp.p))

    // enregistre coordonnées
    this.tangente_coords[3] = pts
    this.pentes[3] = this._calcPente(0, 1, pts)

    // @ts-ignore
    this.addTangente(3, pts);
    return 1
  }


  /** Affiche ou supprime la courbe théorique
   * 
   * @param {number} action 0 = efface, 1 = affiche 
   */
  dspCourbeTheorique(action) {
    if (action == 0) {
      this.hChart.removeSerie('theo')
      return 0
    }

    this.initDataTheorique();


    const serie = {
      color: "#556633",
      type: "line",
      name: 'theo',
      id: 'theo',
    }
    this.hChart.addSerie(this.data_theorique, serie, null, true)

  }

  /** Supprime une tangente
   * 
   * @param {number} id indice de la tangente
   */
  delTangente(id) {
    id = "tan" + id
    this.hChart.removeSerie(id)
    this.tangente_coords[id] = undefined
  }

  /** Ajoute et affiche une tangente, affiche la pente
     *
     * @param {object} point structure retournée par l'événement
     * @param {number} idTangente indice de la courbe
     * @file graphx.js
     */
  dspTangente(point, idTangente) {
    if (!isNumeric(idTangente) || !isObject(point)) E.debugError(E.ERROR_NUM)


    const xlim = [Math.max(1, point.x - 5), Math.min(23, point.x + 5)]
    const ylim = [Math.max(1, point.y - 5), Math.min(23, point.y + 5)]

    this.selectedIndicePoint = point.index;
    this.activePoints = []
    point.series.data.forEach(e => {
      // @ts-ignore
      this.activePoints.push({ x: e.x, y: e.y })
    })
    const points = this.activePoints;

    // on calcule la pente avec les deux points proches
    const pente = this._calcPente(point.index + 1, point.index - 1, points, this.hChart.getData(0));

    if (!pente)
      return

    this.pentes[idTangente] = pente;

    var pts = getCoordsTangente(points[point.index], xlim, ylim, pente)


    this.addTangente(idTangente, pts);
    this.tangente_coords[idTangente] = pts

    const info = this.pentes.length > 2 ? this.PENTE + "s" : this.PENTE
    dspContextInfo(info, this.pentes);
  }

  /** Gère le déplacement de la souris
   * 
   * @param {[number,number]} coords coordonnées du point cliqué  
   * @param {number} chartIndex indice de la courbe cliquée 
   * @returns {void}
   */
  mouseMove = ([x, y], chartIndex) => {
    if (this.pointMobileIndex == 1) {
      this.events.mousemove = 0
      return
    }
    this.movTangente({ x: x, y: y }, this.pointMobileIndex, chartIndex)
  }

  /** Active ou désactive la gestion du déplacement de la souris
   * - la propriété events.mousemove précise l'indice de la courbe active
   * elle vaut -1 si pas de courbe active
   * 
   * @param {object} evt event généré par HighCharts
   * @returns 
   */
  activeEventMouse = (evt) => {
    if (!evt.point && this.events.mousemove == -1)
      return false
    if (this.events.mousemove != -1)
      this.evntMouseMoveOff()
    else {
      this.pointMobileIndex = evt.point.index
      this.evntMouseMoveOn(this.mouseMove, evt.point.series.index)
    }

  }

  /**
   * 
   * @param {number} num N° de la tangente 1, 2 ou 3 (perpendiculaire)
   * @param {tPoint[]} pts point courant et 2 points extremités tangente 
   */
  addTangente(num, pts) {
    if (!isNumeric(num)) E.debugError(E.ERROR_NUM)
    if (!isArray(pts)) E.debugError(E.ERROR_ARRAY)

    let label, id, col
    if (num == 1) {
      label = this.TAN1;
      id = this.ID_TAN1;
      col = this.COLOR_TAN1;
    } else if (num == 2) {
      label = this.TAN2;
      id = this.ID_TAN2;
      col = this.COLOR_TAN2;
    } else if (num == 3) {
      label = this.PERP;
      id = this.ID_PERP;
      col = this.COLOR_PERP;
    }
    // ajout segment
    var _option = {
      label: label,
      type: "line",
      name: id,
      id: id,
      backgroundColor: "rgba(0,0,255,0)",
      borderColor: col,
      events: {
        click: (e) => {
          console.log("clic");
          this.activeEventMouse(e)
        },
      }
    }

    this.hChart.addSerie(pts, _option, null, true)
    //this.hChart.chart.addSeries(_option);
  }

  /** Déplace la tangente
   * 
   * @param {tPoint} mobilePoint coordonnées du point mobile
   * @param {number} pointMobileIndex numéro du point cliqué (0,1 ou 2)
   * @param {tPoint[]} points tableau des coordonnées de la courbe
   * @param {number} chartIndex indice de la courbe (1 ou 2 = tangente ou 3 = perpendiculaire)
   */
  movTangente(pointMobileCoords, pointMobileIndex, chartIndex, points = []) {

    let pente;
    const c = ['tan1', 'tan2', 'perp']

    // coordonnées de la tangente
    const name = this.hChart.getNamefromIndex(chartIndex)
    const id = 1 + c.indexOf(name)
    let pts = this.tangente_coords[id]


    // déplacement d'une tangente
    if (name == 'tan1' || name == 'tan2') {

      const graphPoints = this.hChart.getData(0)
      pts[pointMobileIndex] = pointMobileCoords

      if (pointMobileIndex == 2) {
        pente = this._calcPente(pointMobileIndex, pointMobileIndex - 1, pts, graphPoints);
        if (!pente) return false
        pts[0].y = pts[1].y + (pts[0].x - pts[1].x) * pente;
      } else if (pointMobileIndex == 0) {
        pente = this._calcPente(pointMobileIndex + 1, pointMobileIndex, pts, graphPoints);
        if (!pente) return false
        pts[2].y = pts[1].y + (pts[2].x - pts[1].x) * pente;
      }

      this.tangente_coords[id] = pts

      this.pentes[id] = pente;
      dspContextInfo("pentes", this.pentes);

      // déplacement de la perpendiculaire
    } else if (name == 'perp' && pointMobileIndex == 2) {
      //pente = Math.tan(Math.atan(this.pentes[0]) + Math.PI / 2);
      pente = this.pentes[1]

      let dx = - pts[2].x + pointMobileCoords.x;
      //var dy = - pts[2].y + pointMobileCoords.y;
      let dy = dx * pente

      for (var i = 0; i < 3; i++) {
        pts[i].x += dx;
        pts[i].y += dy;
      }
      dspContextInfo("perp", pts);
    }

    this.hChart.updateSerie(chartIndex, pts)
  }


  /** Affiche le graphe ou le cache
  *
  * Affiche ou cache le graphe en fonction de GRAPH_TYPE
  */
  display() {
    if (gGraphs.getState('GRAPH_TYPE') != 0) {
      $(this.canvas).hide();
    } else {
      $(this.canvas).show();
    }
  }


  /** Retourne la pente
     *
     * @param {number} indice_1 premier point
     * @param {number} indice_2 second point
     * @param {array} tangenteCoords tableau des coordonnées des tangentes
     * @param {[]} points tableau des points de la courbe
     * @return {number} pente
     * */
  _calcPente(indice_1, indice_2, tangenteCoords, points) {
    if (!isNumeric(indice_1) || !isNumeric(indice_2)) E.debugError(E.ERROR_NUM)
    if (!isArray(tangenteCoords) && !isArray(points)) E.debugError(E.ERROR_ARRAY)

    // test validité
    if (points) {
      const size = points.length - 1;
      if (indice_1 >= size || indice_2 >= size)
        return false
    }

    var dy = tangenteCoords[indice_1].y - tangenteCoords[indice_2].y;
    var dx = tangenteCoords[indice_1].x - tangenteCoords[indice_2].x;
    return dy / dx;
  }

  /** Initialise données théorique graphe
     *
     * Remplit les tableaux data_theorique et data_derive_theorique avec
     * les valeurs de G
     */
  initDataTheorique() {

    if (this.data_theorique.length != 0) return;
    for (var i = 0; i < gDosage.vols.length; i++) {
      this.data_theorique.push({
        x: gDosage.vols[i],
        y: gDosage.pHs[i],
      });
      this.data_derive_theorique.push({
        x: gDosage.vols[i],
        y: gDosage.dpHs[i],
      });
    }
  }

  /** Construit un tableau avec pour abscisse les volumes et en ordonnée la dérivée du pH
       * 
       *
       * @param {object[]} data tableau des valeurs volumes et pH
       * @param {object[]} derive tableau des valeurs volumes et dpH
       * @returns {array} tableau des valeurs volume et dpH réelles
      */
  _initDerivee(data, derive) {
    var lst_derivee = [];
    var i_proche; // index de l'élément le plus proche
    const lim = data.length - 1
    const uderive = new uArray(derive)
    for (var i = 1; i < lim; i++) {
      i_proche = uderive.getArrayObjectNearIndex("x", data[i].x);
      lst_derivee.push({ x: derive[i_proche].x, y: derive[i_proche].y });
    }
    return lst_derivee;
  }

  /** Calcule les coordonnées de la perpendiculaire
     * 
     * p0 et p1 sont 2 pts appartenant à 2 droites parallèles (pente)
     * @param {tPoint} p0 
     * @param {tPoint} p1 
     * @param {number} pente 
     * @param {number} factor pour tenir compte des ratios écran
     * @returns {object} point orthogonal et distance
     * @file graphx.js
     */
  _getPerpendiculaire(p0, p1, pente, factor) {

    // constante pas
    const pas = 0.1;
    // premier point adjacent
    let p = {};
    var dx = pas;
    p.x = p1.x + dx;
    p.y = p1.y + pente * dx;
    // test initial
    let d = calcDistance2Pts(p1, p0, factor);
    let dt = calcDistance2Pts(p, p0, factor);
    if (dt > d) {
      dx = -dx;
      p = p1;
      dt = d;
    }
    // boucle
    let pc = {};
    let dtc = dt;
    do {
      dt = dtc;
      pc.x = p.x + dx;
      pc.y = p.y + pente * dx; // test initial
      dtc = calcDistance2Pts(pc, p0, factor);
      p = pc;
    } while (dtc < dt);
    return {
      p: pc,
      d: d,
    };
  }


}

export { Graph }