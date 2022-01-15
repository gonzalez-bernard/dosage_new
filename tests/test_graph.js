import {ChartX} from '../src/modules/chartX.js'
//import Chart from "/node/chart.js/dist/Chart.js";

var canvas = "container"

// Création de l'instance
//var gr = new G.charts( canvas )

// Initialisation données
var data = [ { x: 1, y: 1 }, { x: 2, y: 8 }, { x: 3, y: 15 } ]
var other = {
    showLine: true,
    backgroundColor: "rgba(255,255,255,0)",
    pointBackgroundColor: "red",
    borderColor: "rgba(255,0,0,0.5)",
    pointRadius: 3,
    id: 'pH',
    label:'new test'
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
        responsive: false,
        maintainAspectRatio: true,
        plugins: {
            title: {
                display: true,
                text: 'Chart Title'
            },
        },
        events: [ 'mousemove' ],
        layout: {
            padding: {
                top: 20
            }
        },
        onHover: showPos,
        scales: {
            x: {},
            y: optAxe
        }
    }
    //};

// pente
var pente = ( data[ 1 ].y - data[ 0 ].y ) / ( data[ 1 ].x - data[ 0 ].x )

let G = new ChartX(canvas)

// initialise options
var opts = G.setOption( "scales", optAxe )
G.setOption( "plugins", optPlugin )
G.setOption( "responsive", false )
G.setOption( "maintainAspectRatio", true)

// crée le dataset
//let dataset = G.setDataset('test',data, other, 'pH')
let dataset = G.setDataset( 'test', data, other )

// Crée le graphe
G.createChart( 'scatter', dataset, opts )


data = [ { x: 0, y: 8 }, { x: 1, y: 15 }, { x: 2, y: 22 } ]

// @ts-ignore
other = {
    pointBackgroundColor: 'blue',
    backgroundColor: 'rgba(255,255,255,0)',
    showLine: true,
    id: '123'
}

// Ajout d'un nouveau graphe
G.addDataset( 'new', data, other )


// Suppression du point N°2 du graphe N°1
//G.removeData( 1, 2 )

// perpendiculaire
let perp = get_perp( { x: 3, y: 15 }, { x: 1, y: 15 }, pente, ( 7 / 25 ) * ( 5 / 9 ) )
let data_perp = [ { x: 3, y: 15 }, perp.p ]
other.id = "AZE"
G.addDataset( 'new', data_perp, other )

// Ajout d'un gestionnaire d'événements
G.setEvent( 'onClick', _event )
G.setEvent( 'onHover', showPos )
//G.setEvent('onClick', _del)

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
    var index = G.getEventIndexChart( elt )
    var indice = G.getEventIndicePoint( elt )
    G.removeData( index)
}

function _event( evt, elt ) {
    if ( elt.length > 0 ) {
        var a = G.getEventArray( evt )
        console.log( "Ensemble des éléments du point : ", a )
        console.log( "Index du graphe : " + G.getEventIndexChart( elt ) )
        console.log( "Indice du point : " + G.getEventIndicePoint( elt ) )
        console.log( "Coordonnées en pixels : " + G.getEventCoordPixel( elt ) )
        console.log( "Coordonnées du point : " + G.getEventCoord( elt ) )

        console.log( "Index du graphe possédant la propriété : " + G.getChartByProp( 'pointBackgroundColor', 'blue' ) )
        console.log( "Index du graphe possédant l'ID AZE : " + G.getChartByProp( 'id', 'AZER' ) )
        console.log( "Label et id : ", G.getIdChart( G.getEventIndexChart( elt ) ) )


        var data = [ { x: 3, y: 2 }, { x: 5, y: 1 } ]
            // change les données du graphe N°1
            //G.changeData( data, 1 )

        // Ajout de données
        var new_data = [ { x: 3, y: 5 } ]
            //G.addData( new_data, 1 )

        // Récupère data
        // console.log(G.getData(0))
        console.log( "Données de la courbe : ", G.getData( elt ) )

        // Modifie options max de la courbe identifiée par dpH
        //G.setOption( "scales/dpH/max", 30 )
        //G.removeOption( "scales/x/ticks/color" )
        G.chart.update()
    }
}

function showPos( elt ) {
    if ( elt.length > 0 )
        console.log( G.getEventCoord( elt ) )
}