// @ts-ignore
// eslint-disable-next-line no-undef
var socket = io();

/**
 * 
 * @param {string} emit 
 * @param {string} response 
 * @param {string | object} data 
 * @returns 
 */
function getData( emit, response, data = "" ) {
    return new Promise( function( resolve ) {

        socket.emit( emit, data );

        // si requete réussie
        socket.on( response, function( data ) {
            resolve( data );
        } )

        socket.on( "pyerror", function() {
            resolve( "pyError" )
        } )

    } )
}

export { getData }