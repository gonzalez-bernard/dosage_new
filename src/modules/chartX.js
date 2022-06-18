/** chartX.js */

/** Wrapper pour chart.js
 * La création d'un chart est la suivante : new chart(canvas, config)
 * 
 * config a la structure suivante : {
 *      type: '',
 *      data: {},
 *      options: {}
 * }  
 * 
 * Structure de data :
 * 
 * {
 *      labels: [],
 *      datasets: [{dataset1},{dataset2},...]}
 * }
 * 
 * Structure de dataset:
 * 
 * {
 *      label: '',
 *      data: [number,...] ou [{x:..., y:...}]}
 *      borderColor: 'rgba()',
 *      backgroundColor: '...',
 *      yAxisID: 'y',
 *      hidden: true|false
 * }
 * 
 * Structure de options:
 * 
 * {    
 *      responsive : true|false,
 *      title: {
 *              display: true|false,
 *              text: '...'
 *      },
 *      scales: {
 *              y: {
 *                  type: '...',
 *                  reverse: true|false,
 *                  position: left|right,
 *                  ticks: {
 *                          color: 'rgba()
 *                  }
 *                  grids: {
 *                      drawOnChartArea: true|false
 *                  }
 *              },
 *              y': {...}
 *      },
 *      plugins: {
 *          legend: {
 *              position: 'top|bottom'}
 *          },
 *          title: {
 *              display: true|false,
 *              text: '...'
 *          }
 *      }
 * 
 * Les courbes affichées sont mémorisées dans un 'dataset'
 * Un dataset contient :
 *  - label {string} : nom
 *  - data {array} : ensemble des données sous forme de dataset
 *  - other
 *  - id
 * 
 * Pour créer un graphe on doit d'abord créer un dataset
 * Pour cela on utilise la méthode 'setDataset' avec les paramètres nécessaires
 * puis on appelle la méthode 'createChart'
 * On fournit les paramètres :
 * - type {string} : type de graphe
 * - dataset {object} : dataset
 * - options {object} : options 
 * 
 * Pour ajouter une série de données ou appelle la méthode 'addDataset'
 * On lui passe un 'dataset' ou bien un tableau avec les différents paramètres.
 *
 * La suppression d'une courbe utilise 'removeData' avec un seul paramètre
 * l'indice de la courbe. 
 * 
 * Pour supprimer un ou pusieurs points d'une courbe il faut utiliser
 * la méthdoe 'clearData' avec l'indice de la courbe et éventuellement
 * les numéros des points à afficher.
 * 
 * La modification des données d'une courbes se réalise avec la méthode 
 * 'changeData' avec :
 * - data {object} : ensemble des données
 * - index {number} : index de la courbe (0 par défaut)
 */

import { copyDeep, hasKey, isEmpty, replace, updateItem } from "./utils/object.js"
import * as e from "./utils/errors.js"
import { isObject, isString, isNumeric, isInteger, isDefined, isArray, isFunction } from "./utils/type.js"


/**
 * @typedef {import("chart.js").ChartItem} chartItem
 * @typedef {import("../../types/types").tPoint} tPoint
 */

class ChartX {

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
        /** @type {string} */
    }

    /** Crée le graphe
     *
     * @param {import("chart.js").ChartConfiguration} config contient label, data et autres paramètres (other)
     */
    async createChart(config) {
        if (!isObject(config)) throw new TypeError(e.ERROR_OBJ)
        if (!config.hasOwnProperty('type')) throw new TypeError(e.ERROR_OBJ)
        if (!config.hasOwnProperty('data')) throw new TypeError(e.ERROR_OBJ)
        // @ts-ignore
        this.chart = new Chart(this.canvas, config)
        }

    /** Crée un dataset
     *
     * @param {string} label nom du jeu de données
     * @param {object[]} data jeu de données
     * @param {string} yAxe ID de l'axe vertical utilisé pour les options
     * @param {object} other paramètres du jeu (borderColor, backgroundColor,...)
     * @returns {object} dataset
     */
    createDataset(label, data, yAxe = "", other = undefined) {
        if (!isString(label)) throw new TypeError(e.ERROR_STR)
        if (!isObject(data)) throw new TypeError(e.ERROR_OBJ)
        if (isDefined(yAxe) && !isString(yAxe)) throw new TypeError(e.ERROR_STR)
        if (isDefined(other) && !isObject(other)) throw new TypeError(e.ERROR_OBJ)

        const dataset = {};
        dataset.label = label;
        dataset.data = data;
        dataset.yAxisID = yAxe
        for (let key in other) {
            dataset[key] = other[key];
        }
        return dataset;
    }

    /** Définit les données
     * 
     * @param {Dataset} dataset  
     * @param {string[]} labels tableau des labels
     * @returns {object}
     */
    setData(dataset, labels = []) {
        if (!isObject(dataset)) throw new TypeError(e.ERROR_OBJ)
        if (!isArray(labels)) throw new TypeError(e.ERROR_ARRAY)

        return {
            labels: labels,
            datasets: [copyDeep(dataset)]
        }
    }

    /** Définit la configuration
     * 
     * @param {import("chart.js").ChartType} type : type de graphe 'line, scatter,...' 
     * @param {import("chart.js").ChartData} data object données
     * @param {object} options 
     * @param {object} plugins 
     * @returns {import("chart.js").ChartConfiguration}
     */
    setConfig(type, data, options, plugins = []) {
        if (!isString(type)) throw new TypeError(e.ERROR_STR)
        if (!isObject(data) && !isObject(options)) throw new TypeError(e.ERROR_OBJ)
        if (!isArray(plugins)) throw new TypeError(e.ERROR_ARRAY)

        return {
            type: type,
            data: copyDeep(data),
            options: copyDeep(options),
            plugins: plugins
        }
    }

    setPlugin(plugin) {
        return plugin
    }

    /** Initialisation ou modification des options
     *
     * @param {string} root : racine ex: scales
     * @param {object} option : objet définissant les options 
     */
    setOption(root, option) {
        if (!isString(root)) throw new TypeError(e.ERROR_STR)
        if (!isObject(option)) throw new TypeError(e.ERROR_OBJ)

        if (root == ""){
            this.chart.options = copyDeep(option)
        } else {
            replace(this.chart.options[root], copyDeep(option), '', true)
        }
    }

    /** Met en place un gestionnaire d'évènement
     *
     * @param {String} event : type de l'événement ex: onClick
     * @param {Function} callback : fonction de traitement
     */
    setEvent(event, callback) {
        if (!isString(event)) throw new TypeError(e.ERROR_STR)
        if (!isFunction(callback)) throw new TypeError(e.ERROR_FCT);

        const evts = ['mouseenter', 'mouseout', 'mouseup', 'mousedown', 'mousemove']
        const evt = event.substring(2).toLowerCase();
        //this.chart.data[event] = callback;
        if (!this.chart.options['events'].includes(evt))
            this.chart.options['events'].push(evt)

        this.chart.options[event] = function (evt, elt) {
            callback(evt, elt);
        };

        if (evts.includes(evt))
            $('#' + this.canvas).on(evt, (evt, elt) => callback(evt, elt))

    }

    /************************************************************ 
                    AJOUT
    ***********************************************************/

    /** Ajoute une courbe
     * 
     * @param {string} label 
     * @param {Dataset} dataset dataset
     * @param {{root:string, opt:{}}} options précise les options
     */
    addChart(label, dataset, options = {root:'', opt:{}}) {

        if (!isString(label)) throw new TypeError(e.ERROR_STR)
        if (!isObject(dataset)) throw new TypeError(e.ERROR_OBJ)

        this.chart.data.datasets.push({...dataset} );
        this.chart.data.labels.push(label);

        if (! isEmpty(options.opt) )
            this.setOption(options.root, options.opt)
        
        this.chart.update();
    }

    
    addOption(root, option){
        this.chart.options[root] = copyDeep(option)
    }

    /************************************************************ 
                    MODIFICATION
    ***********************************************************/

    /** Change les données et actualise la courbe
     *
     * @param {object} data : ensemble des données
     * @param {number} index : index de la courbe
     */
    changeData(data, index = 0) {
        if (!isObject(data)) throw new TypeError(e.ERROR_OBJ)
        if (!isInteger(index)) throw new TypeError(e.ERROR_NUM)

        this.chart.data.datasets[index].data = data;
        this.chart.update();
    }

   /** Complète ou modifie l'objet other
     * 
     * @param {{}} other précise les paramètres  
     * @param {{}} upd paramètres à ajouter ou modifier
     */
    updOther(other, upd) {
        if (!isObject(other)) throw new TypeError(e.ERROR_OBJ);
        if (!isObject(upd)) throw new TypeError(e.ERROR_OBJ);

        replace(other, upd, '', true)
    }

    /** Modifie ou ajoute une option
     * 
     * @param {string} path chemin indiquant l'option à modifier ex: scales/y/max  
     * @param {any} value valeur  
     */
    updOptions(path, value){
        if (!isString(path)) throw new TypeError(e.ERROR_STR);
        
        try {
            updateItem(path,this.chart.options,value)
        } catch (customError) {
            console.log(customError)
        }
    }


    /************************************************************ 
                    SUPPRESSION
    ***********************************************************/

    /** Suppression de toutes les courbes
     * 
     * @use removeData
     */
    removeAllCharts() {
        for (let i = 0; i < this.chart.data.datasets.length; i++) {
            this.removeChart(i)
        }
        this.chart.data.datasets = {}
        this.chart.data.labels = {}
        this.chart.data.options = {}
        this.chart.scales = {}
        this.chart.update();
    }

    /** Suppression de la courbe
     *
     * @param {number} index : indice de la courbe
     */
    removeChart(index = 0) {
        if (!isInteger(index)) throw new TypeError(e.ERROR_NUM)
        if (this.chart.data.datasets.length <= index) throw new RangeError(e.ERROR_RANGE);
        if (index == -1) return

        // si on supprime toute la courbe
        if (this.chart.data.datasets[index]) {

            // on récupère xAxisID et yAxisID
            const xAxis = this.chart.data.datasets[index].xAxisID;
            const yAxis = this.chart.data.datasets[index].yAxisID;

            this.chart.data.datasets.splice(index, 1)
            this.chart.data.labels.splice(index, 1)
            this.chart.update();

            // suppression axes
            this.chart.boxes.forEach((item, index) => {
                if (item.id && item.id == yAxis)
                    this.chart.boxes.splice(index, 1)
            })

            if (xAxis) {
                delete this.chart.options.scales[yAxis]
                delete this.chart.scales.xAxis
            }

            if (yAxis) {
                delete this.chart.options.scales[yAxis]
                delete this.chart.scales[yAxis]
            }
        }
        this.chart.update();
    }

    /** Suppression d'un ou plusieurs points de la courbe
     *
     * @param {number} index : indice de la courbe
     * @param {number} indice : N° du point à su
function updGraphCharts(id) {
    const o = gGraphs.charts.get(id)
    o.data = gGraphs.currentChart.data
    gGraphs.charts.set(id, o)
}
pprimer
     */
    removeData(index = 0, indice = -1) {
        if (!isInteger(index)) throw new TypeError(e.ERROR_NUM)
        if (isDefined(indice) && !isInteger(indice)) throw new TypeError(e.ERROR_NUM)
        if (this.chart.data.datasets.length <= index) throw new RangeError(e.ERROR_RANGE);
        if (index == -1) return

        // si on supprime toute la courbe
        if (indice == -1) {
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

    /************************************************************ 
                    AFFICHAGE
    ***********************************************************/
    hideChart(index) {
        if (!isNumeric(index)) throw new TypeError(e.ERROR_NUM);
        if (this.chart.data.datasets.length > index - 1)
            this.chart.hide(index)
    }

    toggleChart(index) {
        if (!isNumeric(index)) throw new TypeError(e.ERROR_NUM);
        if (this.chart.data.datasets.length > index - 1)
            this.chart.toggleDataVisibility(index)
    }

    showChart(index) {
        if (!isNumeric(index)) throw new TypeError(e.ERROR_NUM);
        if (this.chart.data.datasets.length > index - 1)
            this.chart.show(index)
    }

    /************************************************************ 
                    INFORMATIONS
    ***********************************************************/
    /** Retourne un tableau avec les informations sur la courbe (datasetIndex), l'index du point (index)
     * et le point (element)
     *
     * @param evt
     * @return {Array}
     */
    getEventArray(evt) {
        //if (!isEvent(evt)) throw new TypeError(e.ERROR_EVT);

        return this.chart.getElementsAtEventForMode(
            evt,
            "nearest", { intersect: true },
            false
        );
    }

    /** Retourne l'indice de la courbe sur laquelle on a cliqué.
     *
     * @param {import("chart.js").ActiveElement[]} elt événement
     * @return {number} indice de la courbe
     */
    getEventIndexChart(elt) {
        if (!isObject(elt)) throw new TypeError(e.ERROR_OBJ);

        return elt[0].datasetIndex;
    }

    /** Retourne l'indice du point
     *
     * @param {chartItem} elt
     * @return {number} indice du point
     */
    getEventIndicePoint(elt) {
        if (!isObject(elt)) throw new TypeError(e.ERROR_OBJ);

        return elt[0].index;
    }

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

    /** Retourne les coordonnées d'un point de la courbe à partir des coordonnées x, y en pixels
     *
     * @param {Element} elt élément
     * @returns {number[]}
     */
    getEventCoord(elt) {
        if (!isObject(elt)) throw new TypeError(e.ERROR_OBJ);

        let coords = [];
        coords.push(elt[0].element.$context.parsed.x, elt[0].element.$context.parsed.y);
        return coords;
    }

    getCurrentChartID(id){
        return this.getChartByProp('id', id)
    }

    /** Retourne l'indice du graphe possédant la propriété
     *
     * @param {string} prop propriété du graphe
     * @param {string|number} value valeur de la propriété
     * @returns {number} indice du graphe
     */
    getChartByProp(prop, value) {
        if (!isString(prop)) throw new TypeError(e.ERROR_STR)
        if (!isString(value) && !isNumeric(value)) throw new TypeError(e.ERRORTYPE)

        if (!this.chart.data) return -1
        for (var i = 0; i < this.chart.data.datasets.length; i++) {
            if (
                this.chart.data.datasets[i][prop] != undefined &&
                this.chart.data.datasets[i][prop] == value
            )
                return i;
        }
        return -1;
    }

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

    /** Retourne le tableau des points
     *
     * @param {number|import("chart.js").ActiveElement[]} prm N° de la courbe
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

}

/**
 * @class Dataset
 */
class Dataset {

    /**
     * 
     * @param {string} label label   
     * @param {any[]} data données 
     * @param {object} options  
     * @param {object} other 
     */
    constructor(label, data, yAxe, options, other) {
        this.label = label == undefined ? "" : label
        this.data = data == undefined ? [] : data;
        this.yAxe = yAxe == undefined ? "" : yAxe
        this.options = options = undefined ? {} : options;
        this.other = other = undefined ? {} : other;

        for (let key in other) {
            this[key] = other[key];
        }
    }

    setOptions(name, value) {
        this.options[name] = value
    }

    setOther(name, value) {
        this.other[name] = value
    }

    setEvent(name, callback) {
        if (!isString(name)) throw new TypeError(e.ERROR_STR)

        this.options[name] = function (evt, elt) {
            callback(evt, elt);
        };
    }
}

export { ChartX, Dataset };