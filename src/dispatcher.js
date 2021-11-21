/** DISPATCHER - dispatcher.js*/
//test
// @ts-nocheck
var { PythonShell } = require( "python-shell" );

var options = {
    scriptPath: "./src/",
    mode: "json",
    stderrParser: true
};

const ES_TITLE = "getEspeces"
const ES_CALLBACK = "./especes/py/get_especes.py"
const ES_OK = "getEspeces_ok"
const DOS_TITLE = "getDosage"
const DOS_CALLBACK = "./dosage/py/get_values.py"
const DOS_OK = "getDosage_ok"
const DER_TITLE = "calcDerivee"
const DER_CALLBACK = "./dosage/py/get_values.py"
const DER_OK = "calcDerivee_ok"

// eslint-disable-next-line no-undef
dispatcher = function( io ) {
    io.on( "connection", function( socket ) {
        // Message initialisation du serveur et connexion
        const welcome = { titre: "Welcome" };
        socket.emit( "welcome", JSON.stringify( welcome ) );
        socket.on( "welcome_ok", function( msg ) {
            console.log( msg );
        } );

        // Récupération des especes
        socket.on( ES_TITLE, function() {

            const pyshell = new PythonShell( ES_CALLBACK, options );
            pyshell.send( JSON.stringify( {} ) );
            pyshell.on( "message", function( message ) {
                socket.emit( ES_OK, message );
            } );

            pyshell.end( function( err ) {
                if ( err ) console.log( err );
            } );
        } );

        // Récupération du dosage
        socket.on( DOS_TITLE, function( data ) {

            const pyshell = new PythonShell( DOS_CALLBACK, options );
            pyshell.send( data );
            pyshell.on( "message", function( message ) {
                socket.emit( DOS_OK, message );
            } );
            pyshell.on( "pyerror", function( err ) {
                console.log( 'The exit code was: ' + err.code );
                console.log( 'The exit signal was: ' + err.signal );
                console.log( 'finished' );
            } );
            //socket.emit("pyerror", err)

            pyshell.end( function( err, code, signal ) {
                if ( err ) {
                    console.log( 'The err was: ' + err );
                    throw ( err )
                }

                console.log( 'The exit signal was: ' + signal );
                console.log( 'finished' );
            } );
        } );

        // Récupération de la dérivée pH
        socket.on( DER_TITLE, function( data ) {
            const pyshell = new PythonShell( DER_CALLBACK, options );
            pyshell.send( data );
            pyshell.on( "message", function( message ) {
                socket.emit( DER_OK, message );
            } );

            pyshell.end( function( err ) {
                if ( err ) console.log( err );
            } );
        } );

        // Récupération d'un problème
        socket.on( "getProblems", function( data ) {
            const pyshell = new PythonShell( "./dosage/py/get_values.py", options );
            pyshell.send( data );
            pyshell.on( "message", function( message ) {
                socket.emit( "getProblems_ok", message );
            } );

            pyshell.end( function( err ) {
                if ( err ) console.log( err );
            } );
        } );
    } );
}