/** graphx.js 
 * 
 * @class Graphx
 * @description Classe pour gérer les graphes
 * ***
 * ***export : Graphx***
*/

import { cts } from "../environnement/constantes.js";
import { gDosage } from "../environnement/globals.js";
import * as e from "../modules/utils/errors.js"
import { ChartX } from "../modules/chartX.js";
import { calcDistance2Pts, getMedium } from "../modules/utils/math.js";
import { uArray } from "../modules/utils/array.js";
import { getCoordsTangente } from "../modules/utils/math.js";
import { isArray, isNumeric, isObject } from "../modules/utils/type.js"
import { dspContextInfo } from "../infos/infos.js"

/**
 * @typedef {import ('../../types/classes').Dosage} Dosage
 * @typedef {import ('../../types/types').tPoint} tPoint 
 */

class Graphx extends ChartX {

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
        this.data = []
        this.data_theorique = [];
        this.data_derive_theorique = [];
        this.pentes = [];
        this.indiceTangentes = [0, 0] // indice des points des tangentes
        this.type = 1; // 1 = pH, 2 = CD et 3 = PT
        this.tangente_point = 0
    }

    setType(type) {
        if (!isNumeric(type)) throw new TypeError(e.ERROR_NUM)
        if (!(type in [this.TYPE_PH, this.TYPE_CD, this.TYPE_PT])) throw new TypeError(e.ERROR_RANGE)
        this.type = type
    }

    /** Définit les options en fonction du type
     *  Calcule la valeur max de l'ordonnée
     * 
     * @param {Dosage} G
     */
    setOptions(G) {

        if (this.type == this.TYPE_PH) {
            this.options = cts.GR_OPTIONS_PH;
        } else if (this.type == this.TYPE_CD) {
            this.options = cts.GR_OPTIONS_CD;
            this.chart.options.scales.y.max = 1.2 * Math.max(...gDosage.conds);
        } else if (this.type == this.TYPE_PT) {
            this.options = cts.GR_OPTIONS_PT;
            this.chart.options.scales.y.max = 1.2 * Math.max(...gDosage.pots)
        }
    }

    /** Enregistre les données dans data et appel la méthode changeData
     *
     * @param {object[]} data tableau des données
     * @file graphx.js
     */
    setDatas(data) {
        if (!isArray(data)) throw new TypeError(e.ERROR_ARRAY)

        // enregistre dans la structure
        this.data = data;
        this.changeData(data);
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

    /** Affiche le graphe ou le cache
     *
     * Affiche ou cache le graphe en fonction de GRAPH_TYPE
     */
    display() {
        if (gDosage.getState('GRAPH_TYPE') != 0) {
            $(this.canvas).hide();
        } else {
            $(this.canvas).show();
        }
    }

    /** Ajoute et affiche une tangente, affiche la pente
     *
     * @param {number} chartID ID du graphe
     * @param {any} elt ChartElement
     * @param {number} idTangente indice de la courbe
     * @file graphx.js
     */
    dspTangente(chartID, elt, idTangente) {
        if (!isNumeric(idTangente) || !isNumeric(chartID)) throw new TypeError(e.ERROR_NUM)
        if (!isObject(elt)) throw new TypeError(e.ERROR_OBJ);

        const xlim = [0.5, 24]
        const ylim = [0.5, 13]
        this.selectedIndicePoint = this.getEventIndicePoint(elt);
        this.activePoints = this.getData(chartID);
        const indice = this.selectedIndicePoint;
        const points = this.activePoints;

        // on calcule la pente avec les deux points proches
        const pente = this._calcPente(indice + 1, indice - 1, points);
        //const angle = Math.atan( pente );
        this.pentes[idTangente - 1] = pente;

        var pts = getCoordsTangente(points[indice], xlim, ylim, pente)

        this.addTangente(idTangente, pts);
        dspContextInfo(this.PENTE, this.pentes);
    }

    /** Ajoute une tangente
     *
     * @param {number} num
     * @param {tPoint[]} pts
     */
    addTangente(num, pts) {
        if (!isNumeric(num)) throw new TypeError(e.ERROR_NUM)
        if (!isArray(pts)) throw new TypeError(e.ERROR_ARRAY)
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
            data: pts,
            backgroundColor: "rgba(0,0,0,0)",
            borderColor: col,
        };
        this.chart.appendSeries(_option);
    }

    /** Efface la tangente
     *
     * @param {number} index indice de la tangente, peut-etre différent
     * de l'indice de la courbe
     * @file graphx.js
     */
    delTangente(index) {
        if (!isNumeric(index)) throw new TypeError(e.ERROR_NUM)
        // récupère l'indice de la tangente dans le tableau data.datasets et supprime

        let n_tangente = this.getChartByProp("id", "tan" + index)
        if (n_tangente) {
            this.removeData(n_tangente);
            this.indiceTangentes[index - 1] = 0
        }

    }

    /** Déplace les tangentes
     *
     * @param {{Event}} evt événement
     * @param {number} indice numéro du point
     * @param {tPoint[]} points tableau des coordonnées
     * @param {number} idx indice de la courbe
     * @file graphx.js
     */
    movTangente(evt, indice, points, idx) {

        if (!isNumeric(indice) || !isNumeric(idx)) throw new TypeError(e.ERROR_NUM)
        if (!isArray(points)) throw new TypeError(e.ERROR_ARRAY)

        var px, py, pente;
        if (idx == 1 || idx == 2) {
            px = this.chart.scales["x"].getValueForPixel(evt['x']);
            py = this.chart.scales["y"].getValueForPixel(evt['y']);
            points[indice].x = px;
            points[indice].y = py;

            if (indice == 2) {
                pente = this._calcPente(indice, indice - 1, points);
                points[indice - 2].y = points[indice - 1].y + (points[indice - 2].x - points[indice - 1].x) * pente;
            } else if (indice == 0) {
                pente = this._calcPente(indice + 1, indice, points);
                points[indice + 2].y = points[indice + 1].y + (points[indice + 2].x - points[indice + 1].x) * pente;
            }

            this.pentes[idx - 1] = pente;
            dspContextInfo("pentes", this.pentes);

        } else if (idx == 3 && indice == 2) {
            pente = Math.tan(Math.atan(this.pentes[0]) + Math.PI / 2);
            px = this.chart.scales["x"].getValueForPixel(evt['x']);
            py = this.chart.scales["y"].getValueForPixel(evt['y']);
            var dx = px - points[2].x;
            var dy = py - points[2].y;

            for (var i = 0; i < 3; i++) {
                points[i].x = points[i].x + dx;
                points[i].y = points[i].y + dy;
            }
            this.pos = points
            dspContextInfo("perp", this.pos);
        }
        this.changeData(points, idx);

    }

    /** Affiche ou cache la courbe dérivée
     *
     * @file graphx.js
     */
    dspDerivee() {
        // si graph pH non affiché
        if (gDosage.getState('GRAPH_TYPE') != 1) return;

        let option;
        // initialise les données théoriques
        this.initDataTheorique();


        if (gDosage.getState('THEORIQUE') == 1) {
            /*
            option = this._initOptions(this.data_derive_theorique);
            const _dataset = this.createDataset(this.DERIVEE_TH, this.data_derive_theorique, this.YNAME_DERIVEE, other)
            this.addChart(this.DERIVEE_TH, _dataset, option);
            */
        } else {
            // extrait les valeurs dérivées à partir des données réelles (data)
            const lst_derivee = this._initDerivee(this.data, this.data_derive_theorique);

            this.chart.appendSeries({
                name: "derivée",
                data: lst_derivee,
                type: 'line'
            })}

            gDosage.setState("DERIVEE_INIT", 1)
    }

    /** Affiche la courbe théorique
     *
     * @param {number} etat 0 = affiche la courbe sinon on efface
     * @file graphx.js
     */
    dspCourbeTheorique(etat = 0) {

        if (etat == 0) {
            this.initDataTheorique();
            var data = { label: this.COURBE_TH, data: this.data_theorique, id: this.ID_COURBE };
            this.chart.data.datasets.push(data);
            this.chart.data.labels.push(data.label)
            this.chart.update();
        } else {
            const idx = this.getChartByProp("id", this.ID_COURBE)
            if (idx)
                this.removeData(idx);
        }
    }

    /** Affiche la perpendiculaire
     *
     * @param {number} etat : 0 = on trace, 1 = on efface l'ancienne et on trace
     * @returns {number}
     * @file graphx.js
     */
    dspPerpendiculaire(etat = 0) {

        // la perpendiculaire est déjà affichée, on l'efface
        if (etat == 1) {
            var idx = this.getChartByProp("id", this.ID_PERP);
            if (idx) {
                // On la supprime
                this.removeData(idx);
            }
            return 0
        }

        // ratio taille
        var rx = this.chart.width / 25;
        var ry = this.chart.height / 14;
        var t = rx / ry;
        t = (703 / 703) * (25 / 14)

        // On teste si les pentes sont cohérentes
        if (Math.abs(this.pentes[0] - this.pentes[1]) / this.pentes[0] > 0.1)
            return -1;

        // on récupère les indices des courbes tangentes
        var id1 = this.getChartByProp("id", this.ID_TAN1);
        var id2 = this.getChartByProp("id", this.ID_TAN2);
        if (!id1 || !id2) return -1;

        // On récupère les points extrêmes des tangentes et on calcule ceux de la perpendiculaire
        var pts1 = this.getData(id1);
        var pts2 = this.getData(id2);

        // milieu de tangente 1
        const p1 = {
            x: (pts1[0].x + pts1[2].x) / 2,
            y: (pts1[0].y + pts1[2].y) / 2,
        };
        const p2 = {
            x: (pts2[0].x + pts2[2].x) / 2,
            y: (pts2[0].y + pts2[2].y) / 2,
        };

        var perp = this._getPerpendiculaire(p1, p2, this.pentes[0], t)

        // pts de la perpendiculaire
        var pts = [];
        pts.push(p1)
        pts.push(perp.p)
        pts.push(getMedium(p1, perp.p))

        // @ts-ignore
        this.addTangente(3, pts);
        return 1
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
        for (var i = 1; i < lim; i++) {
            i_proche = new uArray(derive).getArrayObjectNearIndex("x", data[i].x);
            lst_derivee.push({ x: derive[i_proche].x, y: derive[i_proche].y });
        }
        return lst_derivee;
    }

    /** Initialise les options
     * 
     * @param {object[]} data 
     * @returns {object}
     */
    _initOptions(data) {
        var option = {
            scales: {
                dpH: {
                    position: "right",
                    min: new uArray(data).getArrayObjectExtremumValues("y", "min"),
                    max: new uArray(data).getArrayObjectExtremumValues("y", "max") * 1.1,
                    ticks: {
                        stepSize: 0.5,
                    },
                    title: {
                        display: true,
                        text: "dpH/dv",
                    },
                }
            }
        };
        return option;
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

    /** Retourne la pente
     *
     * @param {number} indice_1 premier point
     * @param {number} indice_2 second point
     * @param {array} points tableau des coordonnées
     * @return {number} pente
     * */
    _calcPente(indice_1, indice_2, points) {
        if (!isNumeric(indice_1) || !isNumeric(indice_2)) throw new TypeError(e.ERROR_NUM)
        if (!isArray(points)) throw new TypeError(e.ERROR_ARRAY)

        var dy = points[indice_1].y - points[indice_2].y;
        var dx = points[indice_1].x - points[indice_2].x;
        return dy / dx;
    }
}

export { Graphx };
