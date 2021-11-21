import {G} from '../src/modules/graph.js'
//import Chart from "/node/chart.js/dist/Chart.js";

var canvas = "container"

// Création de l'instance
var gr = new G.charts( canvas )

// Initialisation données
var data = [ { x: 1, y: 1 }, { x: 2, y: 8 }, { x: 3, y: 15 } ]
var other = {
    showLine: true,
    backgroundColor: "rgba(255,255,255,0)",
    pointBackgroundColor: "red",
    borderColor: "rgba(255,0,0,0.5)",
    pointRadius: 3,
    id: 'pH'
        //yAxisID: 'pH'
}

var optAxe = {
    x: {
        min: -1,
        max: 6,
        ticks: {
            stepSize: 0.5,
            color: 'red'
        }
    },
    y: {
        type: 'linear',
        display: true,
        title: {
            display: true,
            text: "pHs"
        },

        min: 0,
        max: 25,
        position: "left",
        ticks: {
            stepSize: 4,
        }
    },
    /*
        dpH: {
            type: 'linear',
            display: true,
            title: {
                display: true,
                text: "dpH"
            },

            min: 0,
            max: 10,
            position: "right",
            ticks: {
                stepSize: 4
            }
        },
        */
}

var optPlugin = {
    title: {
        display: true,
        text: 'Courbes'
    },
}

var options = {
        //responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Chart Title'
            },
        },
        events: [ 'mousemove' ],
        onHover: showPos,
        scales: {
            x: {},
            y: optAxe
        }
    }
    //};

// pente
var pente = ( data[ 1 ].y - data[ 0 ].y ) / ( data[ 1 ].x - data[ 0 ].x )

// initialise options
var opts = gr.setOption( "scales", optAxe )
gr.setOption( "plugins", optPlugin )
gr.setOption( "responsive", false )

// crée le dataset
//let dataset = gr.setDataset('test',data, other, 'pH')
let dataset = gr.setDataset( 'test', data, other )

// Crée le graphe
gr.createChart( 'scatter', dataset, opts )


data = [ { x: 0, y: 8 }, { x: 1, y: 15 }, { x: 2, y: 22 } ]

// @ts-ignore
other = {
    pointBackgroundColor: 'blue',
    backgroundColor: 'rgba(255,255,255,0)',
    showLine: true,
    id: '123'
}

// Ajout d'un nouveau graphe
gr.addDataset( 'new', data, other )


// Suppression du point N°2 du graphe N°1
//gr.removeData( 1, 2 )

// perpendiculaire
let perp = get_perp( { x: 3, y: 15 }, { x: 1, y: 15 }, pente, ( 7 / 25 ) * ( 5 / 9 ) )
let data_perp = [ { x: 3, y: 15 }, perp.p ]
gr.addDataset( 'new', data_perp, other )

// Ajout d'un gestionnaire d'événements
gr.setEvent( 'onClick', _event )
gr.setEvent( 'onHover', showPos )
    //gr.setEvent('onClick', _del)

function get_perp( p0, p1, pente, factor ) {
    // calcul distance initiale
    let d = Math.pow( ( p1.x - p0.x ), 2 ) + Math.pow( factor * ( p1.y - p0.y ), 2 )
    console.log( "distance = " + d )

    // déplacement initial
    let dep = 1

    // constante pas
    const pas = 0.1

    // premier point adjacent
    let p = {}
    var dx = dep * pas
    p.x = p1.x + dx
    p.y = p1.y + pente * dx // test initial
    console.log( p )

    // calcul distance
    let dt = Math.pow( ( p.x - p0.x ), 2 ) + Math.pow( factor * ( p.y - p0.y ), 2 )
    console.log( "distance = " + dt )



    // test initial
    if ( dt > d ) {
        dep = -1
        dx = -dx
        p = p1
        dt = d
    }

    // boucle
    let pc = {}
    let dtc = dt
    do {
        dt = dtc
        pc.x = p.x + dx
        pc.y = p.y + pente * dx // test initial
        console.log( pc )
        dtc = Math.pow( ( pc.x - p0.x ), 2 ) + Math.pow( factor * ( pc.y - p0.y ), 2 )
        console.log( "distance = " + dtc )
        p = pc
    } while ( dtc < dt )
    return {
        'p': pc,
        'd': d
    }
}

function _del( evt, elt ) {
    var index = gr.getEventIndexChart( elt )
    var indice = gr.getEventIndicePoint( elt )
    gr.removeData( index, indice )
}

function _event( evt, elt ) {
    if ( elt.length > 0 ) {
        var a = gr.getEventArray( evt )
        console.log( "Ensemble des éléments du point : ", a )
        console.log( "Index du graphe : " + gr.getEventIndexChart( elt ) )
        console.log( "Indice du point : " + gr.getEventIndicePoint( elt ) )
        console.log( "Coordonnées en pixels : " + gr.getEventCoordPixel( elt ) )
        console.log( "Coordonnées du point : " + gr.getEventCoord( elt ) )

        console.log( "Index du graphe possédant la propriété : " + gr.getChartByProp( 'pointBackgroundColor', 'blue' ) )
        console.log( "Label et id : ", gr.getIdChart( gr.getEventIndexChart( elt ) ) )


        var data = [ { x: 3, y: 2 }, { x: 5, y: 1 } ]
            // change les données du graphe N°1
            //gr.changeData( data, 1 )

        // Ajout de données
        var new_data = [ { x: 3, y: 5 } ]
            //gr.addData( new_data, 1 )

        // Récupère data
        // console.log(gr.getData(0))
        console.log( "Données de la courbe : ", gr.getData( elt ) )

        // Modifie options max de la courbe identifiée par dpH
        //gr.setOption( "scales/dpH/max", 30 )
        //gr.removeOption( "scales/x/ticks/color" )
        gr.chart.update()
    }
}

function showPos( elt ) {
    if ( elt.length > 0 )
        console.log( gr.getEventCoord( elt ) )
}