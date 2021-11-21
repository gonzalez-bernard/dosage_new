// @ts-nocheck
var {PythonShell} = require( 'python-shell' )

var options = {
  scriptPath: './src/',
  mode: 'json'
}

dispatcher = function( io ) {

  io.on( 'connection', function( socket ) {

    // Message initialisation du serveur et connexion
    welcome = { 'titre': 'Welcome' }
    socket.emit( 'welcome', JSON.stringify( welcome ) );
    socket.on( 'welcome_ok', function( msg ) {
      console.log( msg );
    } );
  } )
}