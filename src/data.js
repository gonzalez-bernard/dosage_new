// @ts-ignore
// eslint-disable-next-line no-undef
var socket = io();

/** Lance les requêtes Python
 * 
 * @param {string} emit 
 * @param {string} response 
 * @param {object} data paramètres nécessaires {func {string}: nom de la fonction python, data {object}: paramètres}   
 * @returns {promise}
 */
function getData( emit, response, data = "" ) {
    return new Promise( function( resolve ) {

        // envoi du message au dispatcher
        socket.emit( emit, data );

        // si requete réussie, retourne résultat
        socket.on( response, function( data ) {
            resolve( data );
        } )

        // si Erreur système (script interrompu) 
        socket.on("Error_system", function( data ){
            resolve("Error_system")
        })

    } )
}

export { getData }