// @ts-nocheck
const express = require( 'express' )
const app = express()
const path = require( 'path' )
const jQuery = require( 'jquery' )
const http = require( 'http' )
//const paper = require( 'paper' )
//const Chart = require( 'chart.js' )

var server = http.createServer( app )

var io = require( 'socket.io' )( server )
var dispatcher = require('./dispatcher')

dispatcher( io )

app.use( express.static( __dirname + '/views' ) );
app.use( '/static', express.static( __dirname + '/static' ) )
app.use( '/src', express.static( __dirname + '/src' ) )
app.use( '/tests', express.static( __dirname + '/tests' ) )
app.use( '/node', express.static( __dirname + '/node_modules' ) )
app.use( '/img', express.static( __dirname + '/static/resources/img' ) )

app.get( '/', ( req, res ) => {
    res.render( '/test/test_dom.html' );
} );

let port = process.env.PORT;
if ( port == null || port == "" ) {
    port = 3000;
}

server.listen( port, () => {
    console.log( `App listening at http://localhost:${port}` )
} )