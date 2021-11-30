/** graph.js */

/**
 * La structure d'un chart est la suivante :
 *  canvas,
 * {
 *  type: ...,
 *  data: {
 *    labels: [...],
 *    datasets: [{
 *      label:...,
 *      data: [...],
 *      other...
 *    },{... id:y'}]
 *  },
 *  options:{
 *    ....
 *    scales: {
 *      x:{...},
 *      y:{...},
 *      y':{...}
 *    }
 *  }
 * }
 */

import { hasKey } from "./utils/object.js"
import * as e from "./utils/errors.js"
import { isObject, isString, isEvent, isNumeric, isStrNum, isInteger, isDefined } from "./utils/type.js"
//import { Chart } from "../../node_modules/chart.js";

/**
 * @typedef {import("../../node_modules/chart.js").ChartItem} chartItem
 * @typedef {import("../../types/types").tPoint} tPoint
 */

/** Classe Graph */
class Graph {
    /** Constructeur
     *
     * @param {string}  canvas nom du canvas destinataire "#canvas"
     */
    constructor(canvas) {
        if (!isString(canvas)) throw new TypeError(e.ERROR_STR);

        this.canvas = canvas; // enregistre l'id du canvas
        this.chart = {}; // mémorise le graphe donc de type Chart
        this.selectedIndicePoint = undefined;
        this.old_selectedIndicePoint = undefined;
        this.activePoints = [];
        this.info = "";
    }

    /********************************************************** */

    /** Crée le graphe
     *
     * @param {import("chart.js").ChartType} type : type de graphe 'line, scatter,...'
     * @param {object} dataset contient label, data et autres paramètres (other)
     * @param {object} options
     */
    createChart(type, dataset, options = {}) {
        if (!isString(type)) throw new TypeError(e.ERROR_STR)
        if (!isObject(dataset)) throw new TypeError(e.ERROR_OBJ)
        if (!hasKey(dataset, "label") || !hasKey(dataset, "data")) throw new e.NotElementException()

        // enregistre dataset
        this.dataset = dataset;
        //this.chart.data.datasets.push( this.dataset );

        
        // @ts-ignore
        this.chart = new Chart(this.canvas, {
            type: type,
            data: { datasets: [this.dataset] },
            options: options,
        });

        // Ajoute le label si n'existe pas
        if (this.chart.data.labels.indexOf(dataset.label) == -1)
            this.chart.data.labels.push(dataset.label);
    }

    /********************************************************** */

    /** Crée un dataset
     *
     * Crée le dataset
     * @param {string} label nom du jeu de données
     * @param {object[]} data jeu de données
     * @param {object} other paramètres du jeu
     * @returns {object} dataset
     */
    setDataset(label, data, other = undefined, id = undefined) {
        if (!isString(label)) throw new TypeError(e.ERROR_STR)
        if (!isObject(data)) throw new TypeError(e.ERROR_OBJ)
        if (isDefined(other) && !isObject(other)) throw new TypeError(e.ERROR_OBJ)
        if (isDefined(id) && !isObject(id)) throw new TypeError(e.ERROR_OBJ)

        let dataset = {};
        dataset.label = label;
        dataset.data = data;
        dataset.yAxisID = id
        for (let key in other) {
            dataset[key] = other[key];
        }
        return dataset;
    }

    /********************************************************** */

    /** Ajoute une série de données
     *
     * @param {string} label
     * @param {object} data données
     * @param {object} other paramètre de dessin (couleur)
     * @param {object} options : contient les options. Le niveau maximum d'inclusion est de 2 niveaux.
     * Ex : {scales: {x:{...}, y:{...}}}
     * @use setDataset
     */
    addDataset(label, data, other = undefined, id = undefined, options = undefined) {

        if (!isString(label)) throw new TypeError(e.ERROR_STR)
        if (!isObject(data)) throw new TypeError(e.ERROR_OBJ)
        if (isDefined(other) && !isObject(other)) throw new TypeError(e.ERROR_OBJ)
        if (isDefined(id) && !isObject(id)) throw new TypeError(e.ERROR_OBJ)
        if (isDefined(options) && !isObject(options)) throw new TypeError(e.ERROR_OBJ)

        // met en forme le dataset
        let dataset = this.setDataset(label, data, other, id);

        // ajoute le dataset
        this.chart.data.datasets.push(dataset);
        this.chart.data.labels.push(label);

        if (options != undefined) {
            for (var elt in options) {
                if (typeof options[elt] === "object") {
                    for (var subelt in options[elt]) {
                        this.chart.options[elt][subelt].push(
                            options[elt][subelt]
                        );
                        //this.options[ elt ][ subelt ].push( options[ elt ][ subelt ] );
                    }
                }
            }
        }
        this.chart.update();
    }

    /********************************************************** */

    /** Suppression de toutes les données
     * 
     * @use removeData
     */
    removeAllData() {
        for (let i = 0; i<this.chart.data.datasets.length;i++ ){
            this.removeData(i)
        }
        
        this.chart.update();
    }

    /********************************************************** */

    /** Suppression de la courbe
     *
     * @param {number} index : indice de la courbe
     */
    removeData(index = 0) {
        if (!isInteger(index)) throw new TypeError(e.ERROR_NUM)
        if (this.chart.data.datasets.length <= index) throw new RangeError(e.ERROR_RANGE);
        if (index == -1) return
        
        // si on supprime toute la courbe
        if (this.chart.data.datasets[index].data.length > 0) {

            // on récupère xAxisID et yAxisID
            const xAxis = this.chart.data.datasets[index].xAxisID;
            const yAxis = this.chart.data.datasets[index].yAxisID;
            
            this.chart.data.datasets.splice(index, 1)

            // suppression axes
            if (xAxis){
                delete this.chart.options.scales[yAxis]
                delete this.chart.scales.xAxis
            }
                
            if (yAxis){
                delete this.chart.options.scales[yAxis]
                delete this.chart.scales[yAxis]
            }
            
            // et boxes
            
            this.chart.boxes.forEach((item, index) => {
                if (item.id == yAxis)
                    this.chart.boxes.splice(index,1)
             })
            

        
            
                /*
            let l = this.chart.options.scales.x.length;
            if (l > 0) {
                this.chart.options.scales.x.splice(indice, 1);
            }
            l = this.chart.options.scales.y.length;
            if (l > 0) {
                this.chart.options.scales.y.splice(indice, 1);
            }
            */
            let l = this.chart.data.labels.length;
            if (l > 0) this.chart.data.labels.splice(index, 1);

        }
        this.chart.update();
    }

    /********************************************************** */

    /** Suppression des données de la courbe
     *
     * @param {number} index : indice de la courbe
     * @param {number} indice : N° du point à supprimer
     */
     clearData(index = 0, indice = undefined) {
        if (!isInteger(index)) throw new TypeError(e.ERROR_NUM)
        if (isDefined(indice) && !isInteger(indice)) throw new TypeError(e.ERROR_NUM)
        if (this.chart.data.datasets.length <= index) throw new RangeError(e.ERROR_RANGE);
        if (index == -1) return
        
        // si on supprime toute la courbe
        if (indice == undefined) {
            if (this.chart.data.datasets[index].data.length > 0) {

                this.chart.data.datasets[index].data = []
            }
        } else {
            // on supprime uniquement le point d'indice
            if (indice >= this.chart.data.datasets[index].data.length)
                throw new Error("indice trop grand");
            this.chart.data.datasets[index].data.splice(indice, 1);
        }

        this.chart.update();
    }

    /********************************************************** */

    /** Supprime un élément des options
     *
     * @param {string} option chaine indiquant l'élément à supprimer sous la forme "scales/y/min..."
     * @use setOption
     */
    removeOption(option) {
        if (!isString(option)) throw new TypeError(e.ERROR_STR)
        this.setOption(option, null)
    }

    /********************************************************** */

    /** Met en place un gestionnaire d'évènement
     *
     * @param {String} event : type de l'événement ex: onClick
     * @param {Function} callback : fonction de traitement
     */
    setEvent(event, callback) {
        if (!isString(event)) throw new TypeError(e.ERROR_STR)

        this.chart.data[event] = callback;
        this.chart.options[event] = function (evt, elt) {
            callback(evt, elt);
        };
    }

    /********************************************************** */

    /** Retourne un tableau avec les informations sur la courbe (datasetIndex), l'index du point (index)
     * et le point (element)
     *
     * @param evt
     * @return {Array}
     */
    getEventArray(evt) {
        if (!isEvent(evt)) throw new TypeError(e.ERROR_EVT);

        return this.chart.getElementsAtEventForMode(
            evt,
            "nearest", { intersect: true },
            false
        );
    }

    /********************************************************** */

    /** Retourne l'indice de la courbe sur laquelle on a cliqué.
     *
     * @param {chartItem[]} elt événement
     * @return {number} indice de la courbe
     */
    getEventIndexChart(elt) {
        if (!isObject(elt)) throw new TypeError(e.ERROR_OBJ);

        return elt[0].datasetIndex;
    }

    /********************************************************** */

    /** Retourne l'indice du point
     *
     * @param {chartItem} elt
     * @return {number} indice du point
     */
    getEventIndicePoint(elt) {
        if (!isObject(elt)) throw new TypeError(e.ERROR_OBJ);

        return elt[0].index;
    }

    /********************************************************** */

    /** Retourne les coordonnées en pixels du point sur lequel on a agit
     *
     * @param {chartItem} elt
     * @return {number[]}
     */
    getEventCoordPixel(elt) {
        if (!isObject(elt)) throw new TypeError(e.ERROR_OBJ);

        let coords = [];
        coords.push(elt[0].element.x, elt[0].element.y);
        return coords;
    }

    /********************************************************** */

    /** Retourne les coordonnées d'un point de la courbe à partir des coordonnées x, y en pixels
     *
     * @param {Event} elt élément
     * @returns {number[]}
     */
    getEventCoord(elt) {
        if (!isObject(elt)) throw new TypeError(e.ERROR_OBJ);

        let coords = [];
        coords.push(elt[0].element.parsed.x, elt[0].element.parsed.y);
        return coords;
    }

    /********************************************************** */

    /** Change les données et actualise la courbe
     *
     * @param data : ensemble des données
     * @param {number} index : index de la courbe
     */
    changeData(data, index = 0) {
        if (!isObject(data)) throw new TypeError(e.ERROR_OBJ)
        if (!isInteger(index)) throw new TypeError(e.ERROR_NUM)
        // si datasets vide
        this.chart.data.datasets[index].data = data;
        this.chart.update();
    }

    /********************************************************** */

    /** Ajoute des données à un graphe existant
     *
     * @param {object[]} data : données à ajouter
     * @param {number} index : index de la courbe
     */
    addData(data, index = 0) {
        if (!isObject(data)) throw new TypeError(e.ERROR_OBJ)
        if (!isInteger(index)) throw new TypeError(e.ERROR_NUM)

        for (var elt in data)
            this.chart.data.datasets[index].data.push(data[elt]);
        this.chart.update();
    }

    /********************************************************** */

    /** Retourne l'indice du graphe possédant la propriété
     *
     * @param {string} prop propriété du graphe
     * @param {string|number} value valeur de la propriété
     * @returns {number} indice du graphe
     */
    getChartByProp(prop, value) {
        if (!isString(prop)) throw new TypeError(e.ERROR_STR)
        if (!isString(value) && !isNumeric(value)) throw new TypeError(e.ERRORTYPE)

        for (var i = 0; i < this.chart.data.datasets.length; i++) {
            if (
                this.chart.data.datasets[i][prop] != undefined &&
                this.chart.data.datasets[i][prop] == value
            )
                return i;
        }
        return -1;
    }

    /********************************************************** */

    /** Renvoie un objet avec le label et l'id du graphe correspondant à ce N°
     *
     * @param {number} index N° du graphe
     * @return {object}
     */
    getIdChart(index) {
        if (!isInteger(index)) throw new TypeError(e.ERROR_NUM)
        if (index >= this.chart.data.datasets.length) throw new RangeError(e.ERROR_RANGE)

        var o = {};
        o.label = this.chart.data.datasets[index].label;
        o.id = this.chart.data.datasets[index].id;
        return o;
    }

    /********************************************************** */

    /** Retourne le tableau des points
     *
     * @param {number|chartItem} prm N° de la courbe
     * @returns {array} tableau coordonnées des points
     */
    getData(prm) {
        if (typeof prm === "number") {
            if (prm >= this.chart.data.datasets.length)
                throw new RangeError(e.ERROR_RANGE);
            return this.chart.data.datasets[prm].data;
        }
        // @ts-ignore
        else if (typeof prm === "object") {
            let index = this.getEventIndexChart(prm);
            return this.chart.data.datasets[index].data;
        }
        throw new TypeError(e.ERRORTYPE);
    }

    /********************************************************** */

    /** Mise à jour des options
     *
     * @param {string} option : sous la forme "parent/enfant1/enfant2/../option" à partir de 'options'
     * @param {any} value : valeur
     */
    setOption(option, value) {
        if (!isString(option)) throw new TypeError(e.ERROR_STR)
        if (!isStrNum(value)) throw new TypeError(e.ERROR_STRNUM)

        const props = option.split("/");

        function _setOption(obj, props, value) {
            // on a fini
            if (props.length == 0) {
                return obj;
            }

            let prop = props[0];
            // si prop est un tableau
            if (prop.indexOf("[]") != -1) {
                if (hasKey(obj, prop)) {
                    obj[prop] = props.length == 1 ? value : [];
                }
            } else {
                // si la propriété existe
                if (hasKey(obj, prop)) {
                    if (Array.isArray(obj)) {
                        let x = {};
                        x[prop] = {};
                        obj.push(x);
                        _setOption(x[prop], props.slice(1), value);
                        return;
                    } else {
                        if (props.length == 1) {
                            if (value != null) obj[prop] = value;
                            else delete obj[prop];
                        }
                    }
                } else {
                    // On crée la propriété
                    obj[prop] = props.length == 1 ? value : {};
                }
            }

            _setOption(obj[prop], props.slice(1), value);
        }

        if (!hasKey(this.chart, 'options'))
            this.chart.options = {}
        _setOption(this.chart.options, props, value);
        return this.chart.options;
    }


}

export { Graph };