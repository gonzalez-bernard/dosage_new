/** graph.js */

/**
 * La structure d'un chart est la suivante :
 *  
 *  data: object ChartData
 *      labels : {string}
 *      datasets: ChartDataset, []
 *          label : string
 *          data: [x:..., y:...]
 *          others ex background: []
 *  options: 
 *  
 */

//import Chart from "../node_modules/chart.js/dist/chart.js";
import {isValidArgs } from "./utils/utilsFunc.js";

const ERR_PRM = "Erreur de paramètres"


/**
 * @typedef chartElement
 * @type {object}
 * @typedef Point
 * @type {object}
 * @typedef Event
 * @property offsetX
 * @property offsetY
 */
/** Classe Graph */

class Graph {


    /** Constructeur
     * 
     * graph doit contenir les propriétés : datasets et options
     * {datasets:[{....}], options: {...}}
     * @param {string}  canvas nom du canvas destinataire "#canvas"
     */
    constructor( canvas ) {

        if ( !isValidArgs( [ { arg: canvas, type: 'string' } ] ) )
            throw ERR_PRM

        this.canvas = canvas; // enregistre l'id du canvas
        this.chart = {} // mémorise le graphe
        this.data = {}
        this.selectedIndicePoint = undefined
        this.old_selectedIndicePoint = undefined
        this.activePoints = []
        this.info = ""
        this.datasets = []
        this.options = {}

    }

    /** Initie le graphe
     *
     * @param {string} type : type de graphe 'line, scatter,...'
     * @param {object} data contient label, data et autres paramètres
     * @param {object} options
     */
    createChart( type, data = {}, options = {} ) {

        if ( !isValidArgs( [ { arg: type, type: 'string' }, { arg: data, type: 'object' }, { arg: options, type: 'object' } ] ) )
            throw new Error( ERR_PRM )

        // @ts-ignore
        this.chart = new Chart( this.canvas, {
            type: type,
            data: { datasets: data },
            options: options,
        } );

        this.chart.data.labels.push( data[ 'label' ] );
    }

    /** Crée un dataset
     * 
     * Ajoute le dataset au tableau datasets
     * @param {string} label nom du jeu de données
     * @param {object} data jeu de données
     * @param {object} other paramètres du jeu
     * @returns {object} dataset
     */
    setDataset( label, data, other = undefined ) {
        let dataset = {}
        dataset.label = label
        dataset.data = data
        for ( let key in other ) {
            dataset[ key ] = other[ key ]
        }
        this.datasets.push( dataset )
        return dataset
    }

    /** Ajoute une série de données
     *
     * @param {object} data : doit contenir les informations sous forme d'objets avec au moins la label et les données
     * {label: xxx, data:{...}}
     * @param {object} options : contient les options. Le niveau maximum d'inclusion est de 2 niveaux.
     * Ex : {scales: {x:{...}, y:{...}}}
     */
    addDataset( label, data, other = undefined, options = undefined ) {


        // met à jour l'occurence de graph
        this.setDataset( label, data, other )

        this.chart.data.labels.push( label );

        //this.chart.data.datasets.push(data);
        if ( options != undefined ) {
            for ( var elt in options ) {
                if ( typeof options[ elt ] === "object" ) {
                    for ( var subelt in options[ elt ] ) {
                        this.chart.options[ elt ][ subelt ].push( options[ elt ][ subelt ] );
                        this.options[ elt ][ subelt ].push( options[ elt ][ subelt ] );
                    }
                }
            }
        }
        this.chart.update()
    }

    /** Suppression des données de la courbe
     * 
     * @param {number} index : indice de la courbe
     */
    removeData( index = 0, indice = undefined ) {
        if ( this.datasets.length <= index )
            throw new Error( "index trop grand" )

        // si on supprime toute la courbe
        if ( indice == undefined ) {
            this.chart.data.datasets.splice( index, 1 );

            let l = this.options.scales.x.length;
            if ( l > indice && l > 1 ) {
                this.options.scales.x.splice( indice, 1 );
                this.chart.options.scales.x.splice( indice, 1 );
            }
            l = this.options.scales.y.length;
            if ( l > indice && l > 1 ) {
                this.options.scales.y.splice( indice, 1 );
                this.chart.options.scales.y.splice( indice, 1 );
            }
            l = this.chart.data.labels.length;
            if ( l > indice && l > 1 )
                this.chart.data.labels.splice( indice, 1 );
        } else {
            // on supprime uniquement le point d'indice
            if ( indice >= this.datasets[ index ].data.length )
                throw new Error( "indice trop grand" )
            this.datasets[ index ].data.splice( indice, 1 );
        }

        this.chart.update();
    }

    /** Met en place un gestionnaire d'évènement
     *
     * @param {String} event : type de l'événement ex: onClick
     * @param {Function} callback : fonction de traitement
     */
    setEvent( event, callback ) {
        this.chart.options[ event ] = function( evt, elt ) {
            callback( evt, elt );
        };
    }

    /** Retourne le tableau de données
     * 
     * @param {Event} evt
     * @return {Array}
     */
    getEventArray( evt ) {
        if ( evt != undefined ) return this.chart.getElementsAtEventForMode( evt, 'nearest', { intersect: true }, false );
    }

    /** Retourne l'indice de la courbe sur laquelle on a cliqué.
     * 
     * @param {chartElement} elt événement
     * @return {number} indice de la courbe
     */
    getEventIndexChart( elt ) {
        if ( !isValidArgs( [ { arg: elt, type: 'object' } ] ) )
            throw ERR_PRM

        return elt[ 0 ].datasetIndex;
    }

    /** Retourne l'indice du point
     *
     * @param {chartElement} elt
     * @return {number} indice du point
     */
    getEventIndicePoint( elt ) {
        if ( !isValidArgs( [ { arg: elt, type: 'object' } ] ) )
            throw ERR_PRM

        return elt[ 0 ].index;
    }

    /** Retourne les coordonnées en pixels du point sur lequel on a agit
     * 
     *
     * @param {chartElement} elt
     * @return {Point}
     */
    getEventCoordPixel( elt ) {

        if ( !isValidArgs( [ { arg: elt, type: 'object' } ] ) )
            throw ERR_PRM

        let coords = []
        coords.push( elt[ 0 ].element.x, elt[ 0 ].element.y )
        return coords
    }


    /** Retourne les coordonnées d'un point de la courbe à partir des coordonnées x, y en pixels
     * 
     * @param {Event} elt élément
     * @returns {number[]} 
     */
    getEventCoord( elt ) {

        if ( !isValidArgs( [ { arg: elt, type: 'object' } ] ) )
            throw ERR_PRM

        let coords = []
        coords.push( elt[ 0 ].element.parsed.x, elt[ 0 ].element.parsed.y )
        return coords
    }


    /** Change les données et actualise la courbe
     * 
     * @param data : ensemble des données
     * @param {number} index : index de la courbe
     */
    changeData( data, index = 0 ) {
        this.chart.data.datasets[ index ].data = data;
        this.chart.update();
    }


    /** Ajoute des données à un graphe existant
     *
     * @param {object[]} data : données à ajouter
     * @param {number} index : index de la courbe
     */
    addData( data, index = 0 ) {
        for ( var elt in data )
            this.chart.data.datasets[ index ].data.push( data[ elt ] );
        this.chart.update();
    }


    /** Retourne l'indice du graphe possédant la propriété
     *  
     * @param {string} prop propriété du graphe
     * @param {string|number} value valeur de la propriété
     * @returns {number | false} indice du graphe  
     */
    getChartByProp( prop, value ) {
        for ( var i = 0; i < this.datasets.length; i++ ) {
            if ( this.datasets[ i ][ prop ] != undefined && this.datasets[ i ][ prop ] == value )
                return i
        }
        return false
    }

    /** Renvoie un objet avec le label et l'id du graphe correspondant à ce N°
     * 
     * @param {number} index N° du graphe
     * @return {object} 
     */
    getIdChart( index ) {

        if ( index != undefined && index < this.datasets.length ) {
            var o = {}
            o.label = this.datasets[ index ].label;
            o.id = this.datasets[ index ].id;
            return o
        }
        return false
    }


    /** Retourne le tableau des points
     * 
     * @param {number|chartElement} prm N° de la courbe ou élément
     * @returns {array|boolean} tableau coordonnées des points
     */
    getData( prm ) {
        if ( typeof prm === 'number' ) {
            if ( prm >= this.datasets.length )
                throw new Error( "index trop grand" )
            return this.datasets[ prm ].data
        }
        // @ts-ignore
        else if ( typeof prm === 'object' ) {
            let index = this.getEventIndexChart( prm );
            return this.datasets[ index ].data
        }
        return false
    }

    /** Mise à jour des options
     * 
     * @param {string} option : sous la forme "parent/enfant1/enfant2/../option" à partir de 'options'
     * @param {any} value : valeur
     */
    setOption( option, value, object = true ) {
        var props = option.split( '/' )
        var opt = this.options

        function _setOption( obj, props, value ) {
            if ( props.length == 0 ) {
                return obj
            }

            let prop = props[ 0 ]
            if ( prop.indexOf( '[]' ) != -1 ) {
                if ( !obj.hasOwnProperty( prop ) ) {
                    obj[ prop ] = props.length == 1 ? value : []
                }
            } else {
                if ( !obj.hasOwnProperty( prop ) ) {
                    if ( Array.isArray( obj ) ) {
                        let x = {}
                        x[ prop ] = {}
                        obj.push( x )
                        _setOption( x[ prop ], props.slice( 1 ), value )
                        return
                    } else
                        obj[ prop ] = props.length == 1 ? value : {}
                }
            }

            _setOption( obj[ prop ], props.slice( 1 ), value )
        }

        // cas où il n'y a qu'une propriété 
        if ( !object ) {
            if ( !opt.hasOwnProperty( option ) ) {
                opt[ option ] = value
            }
            return this.options
        }

        _setOption( opt, props, value )
        return this.options
    }


    /** Mise à jour des options
     * 
     * @param {string} option : sous la forme "parent/enfant1/enfant2/../option" à partir de 'options'
     * @param {any} value : valeur
     */
    setObjectOptions( option, value ) {
        var props = option.split( '/' )
        var opt = this.options

        function _setOption( obj, props, value ) {
            if ( props.length == 0 ) {
                return obj
            }

            let prop = props[ 0 ]
            if ( props.length == 1 ) {
                if ( !obj.hasOwnProperty( prop ) ) {
                    obj[ prop ] = []
                }
                obj[ prop ].push( value )
                return obj
            } else {
                if ( !obj.hasOwnProperty( prop ) ) {
                    obj[ prop ] = props.length == 1 ? value : {}
                }
            }

            _setOption( obj[ prop ], props.slice( 1 ), value )
        }

        _setOption( opt, props, value )
        return this.options
    }
}


export { Graph }