
const express = require( 'express' )
const app = express()
const http = require( 'http' )
require( './src/dispatcher' )
//import {dispatcher} from "./src/dispatcher.js"

const server = http.createServer( app )
// @ts-ignore
const io = require( 'socket.io' )( server )

//require('./src/especes/especes.ui.js')

// @ts-ignore
// eslint-disable-next-line no-undef
dispatcher( io )

app.use( express.static( __dirname + '/views' ) );
app.use( '/static', express.static( __dirname + '/static' ) )
app.use( '/src', express.static( __dirname + '/src' ) )
app.use( '/tests', express.static( __dirname + '/tests' ) )
app.use( '/node', express.static( __dirname + '/node_modules' ) )
app.use( '/img', express.static( __dirname + '/static/resources/img' ) )
app.use( '/datas', express.static( __dirname + '/static/resources/datas' ) )

// @ts-ignore
app.get( '/', ( req, res ) => {
    //res.send( 'graph' );
    res.render( '/views/index.html' );
} );

let port = process.env.PORT;
if ( port == null || port == "" ) {
    // @ts-ignore
    port = 3000;
}

server.listen( port, () => {
    console.log( `App listening at http://localhost:${port}` )
} )
