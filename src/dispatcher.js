/** DISPATCHER - dispatcher.js*/


/**
 * @typedef {Object} options
 * @property {string} scriptPath
 * @property {'"json" | "text" | "binary"'} mode
 * @property {boolean} stderrParser
 */

const ES_CALLBACK = "./especes/py/get_especes.py"
const DOS_CALLBACK = "./dosage/py/get_values.py"
const DER_TITLE = "calcDerivee"
const DER_CALLBACK = "./dosage/py/get_values.py"
const DER_OK = "calcDerivee_ok"

// Paramètres pour acquisition des données
const DATA_GET_ESPECES = "getEspeces"
const DATA_GET_ESPECES_OK = "getEspeces_ok"
const DATA_GET_DOSAGE = "getDosage"
const DATA_GET_DOSAGE_OK = "getDosage_ok"
const DATA_GET_PROBLEM = "getProblem"
const DATA_GET_PROBLEM_OK = "getProblem_ok"

// @ts-nocheck
var { PythonShell } = require( "python-shell" );
//var {dateformat} = require('dateformat')

// eslint-disable-next-line no-undef
var dispatcher = function( io ) {

    let options = {
        scriptPath: "./src/",
        mode: "json",
        stderrParser: true
    }

    io.on( "connection", function( socket ) {
        // Message initialisation du serveur et connexion
        const welcome = { titre: "Welcome" };
        socket.emit( "welcome", JSON.stringify( welcome ) );
        socket.on( "welcome_ok", function( msg ) {
            console.log( msg );
        } );

        // Récupération des especes
        socket.on( DATA_GET_ESPECES, function() {

            // @ts-ignore
            const pyshell = new PythonShell( ES_CALLBACK, options );
            pyshell.send( JSON.stringify( {} ) );
            pyshell.on( "message", function( message ) {
                socket.emit( DATA_GET_ESPECES_OK, message );
            } );

            pyshell.end( function( err ) {
                if ( err ) console.log( err );
            } );
        } );

        // Récupération du dosage
        socket.on( DATA_GET_DOSAGE, function( data ) {

            // @ts-ignore
            const pyshell = new PythonShell( DOS_CALLBACK, options );
            pyshell.send( data );
            pyshell.on( "message", function( message ) {
                //console.log(message)
                socket.emit( DATA_GET_DOSAGE_OK, message );
            } );

            // Erreur système (interruption du script Python)
            pyshell.end( function( err, code, signal ) {
                if ( err ) {
                    console.log( 'The err was: ' + err );
                    console.log( 'The exit signal was: ' + signal );
                    console.log( 'finished with error' );
                    socket.emit("Error_system", err);
                }
            } );
        } );

        // Récupération de la dérivée pH
        socket.on( DER_TITLE, function( data ) {
            // @ts-ignore
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
        socket.on( DATA_GET_PROBLEM, function( data ) {
            // @ts-ignore
            const pyshell = new PythonShell( "./dosage/py/get_values.py", options );
            pyshell.send( data );
            pyshell.on( "message", function( message ) {
                socket.emit( DATA_GET_PROBLEM_OK, message );
            } );

            pyshell.end( function( err ) {
                if ( err ) console.log( err );
            } );
        } );

        // Affichage des messages d'erreurs sur le seveur et dans le fichier debug.log
        socket.on("serverError",(msg) => {
            console.log(new Date().toLocaleString('fr-FR'))
            console.log(msg)
          })

    } );
}

module.exports = dispatcher