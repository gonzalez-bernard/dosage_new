const express = require( 'express' )
const app = express()
const http = require( 'http' )
//const util = require('util')
//const lodash = require('lodash')
const server = http.createServer( app )

app.use( express.static( __dirname + '/views' ) );
app.use( '/static', express.static( __dirname + '/static' ) )
app.use( '/src', express.static( __dirname + '/src' ) )
app.use( '/tests', express.static( __dirname + '/tests' ) )
app.use( '/node', express.static( __dirname + '/node_modules' ) )
app.use( '/img', express.static( __dirname + '/static/resources/img' ) )
app.use( '/datas', express.static( __dirname + '/static/resources/datas' ) )

// @ts-ignore
// const io = require( 'socket.io' )( server )
//const {Server} = require('socket.io') 
//const io = new Server(server)

//require("./src/dispatcher.js")

// @ts-ignore
//dispatcher( io )

app.get( '/', ( req, res ) => {
    res.render( 'index_.html' );
} );

let port = process.env.PORT;
if ( port == null || port == "" ) {
    // @ts-ignore
    port = 3000;
}

server.listen( port, () => {
    console.log( `App listening at http://localhost:${port}` )
} )