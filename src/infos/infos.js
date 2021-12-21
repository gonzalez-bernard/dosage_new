/** infos.js 
 * @module infos/infos
 * @description 
 * - Gestion de l'affichage des informations
 * - L'appel se fait ainsi :
 *  $("#button").on('click', null, {
 *      idcontainer : id_container,
 *      title: 'titre'
 *      msg: 'message à afficher'
 *      labelbtclose: 'texte bouton',
    }, dspInfo)
 * ***
 * ***export dspInfo, dspMessage***
*/



import * as e from "../modules/utils/errors.js"
import {Infos} from "./infos.cls.js"
import { isEvent, isFunction, isString } from "../modules/utils/type.js";
import { propLower } from "../modules/utils/object.js";
import { DO_INFO_COND, DO_INFO_ERRPENTE, DO_INFO_INIT, DO_INFO_MOVE, DO_INFO_P1, DO_INFO_P2, DO_INFO_PERP1, DO_INFO_PERP2, DO_INFO_PERPDEL, DO_INFO_TAN } from "./lang_fr.js"
import { DOS_INFO } from "../dosage/ui/html_cts.js"
import { getEltID } from "../modules/utils/html.js"
import { ES_DIV_INFO } from "./../especes/html_cts.js"
import { ES_BTCLOSE_LABEL } from "../especes/lang_fr.js";
import { setClassMenu } from "../dosage/dosage.ui.js";



/** Affiche les informations sur un dosage
 *
 * Event peut-être un événement (Event) ou un object Info
 * Si Event est un événement, on récupère les infos dans event['data']  
 * Les paramètres attendus sont:
 *  - title {string} : titre
 *  - idbtclose {string} : id du bouton close
 *  - idcontainer {string} : id du container
 *  - idmodal {string?} : id de la fenêtre modale (défaut = idModal)
 *  - labelbtclose {string?} : label du bouton (défaut = 'quitter')
 *  - actionbtclose {function?} : fonction sur clic fermeture (défaut = undefined)
 *  - msg {string?} : message à afficher (défaut = undefined, cf. fonction de callback)
 *  - img {string?} : url d'une image à afficher à côté du texte
 *  - setmsg {function?} fonction chargée du calcul du message
 *  - prm {object?} paramètres à fournir à setMsg
 *  - latex {boolean?} vrai si affichage mathématique (défaut = false)
 *  - callbacks {object?} {id:function}
 * 
 * @param {import("../../types/types.js").tInfos | object} arg - événement
 * @file infos.js
 * 
 */
var dspInfo = function( arg ) {


    // on récupère les infos dans data si Event
    let data = isEvent( arg ) ? propLower( arg.data ) : propLower( arg )

    // si arg est un objet, on l'analyse pour voir s'il existe un item "fct"
    // dans ce cas, on applique la fonction avec le premier argument
    if ( "fct" in data && isFunction( data[ 'fct' ] ) ) {
        data = propLower( data[ 'fct' ]( data[ 'arg' ] ) );
    }

    // test validité
    if ( !( 'idcontainer' in data ) || !( 'idbtclose' in data ) || !( 'title' in data ) ) 
        throw new TypeError( e.ERROR_OBJ )
    if ( !isString( data[ 'idmodal' ] ) || !isString( data[ 'title' ] ) || !isString( data[ 'idbtclose' ] ) ) 
        throw new TypeError( e.ERROR_STR )

    // pas de message ni de callback
    if ( ( !( 'msg' in data ) || !data[ 'msg' ] ) && !( 'setmsg' in data ) ) 
        throw new TypeError( e.ERROR_OBJ )

    let cInfo // instance de la classe Info
    let html

    // message défini
    if ( 'msg' in data && isString( data[ 'msg' ] ) ) {
        cInfo = new Infos( data )
    } else {
        // message à construire avec fonction de création de message 'setmsg'
        let info
        try {
            // si setmsg a un argument
            if ( 'prm' in data ){
                // si l'argument est une fonction
                info = isFunction(data['prm']) ? data[ 'setmsg' ]( data[ 'prm' ]() ) : data[ 'setmsg' ]( data[ 'prm' ]) 
            }
            else
                info = data[ 'setmsg' ]()

            data[ 'msg' ] = info.msg
            data[ 'title' ] = info.title
            cInfo = new Infos( data )
        } catch ( error ) {
            throw new TypeError( e.ERROR_RETURN )
        }
    }
    html = cInfo.init_html()

    // si latex
    if ( 'latex' in data && data[ 'latex' ] )
        dspHtmlLatex( html, cInfo[ 'idContainer' ], cInfo[ 'idModal' ] )
    else {
        getEltID( cInfo.idContainer ).html( html )
        getEltID( cInfo.idModal ).modal()
    }

}

/** Affiche un texte au format Latex
 * 
 * @param {String} html : contenu html à afficher
 * @param {String} target : id de la balise d'affichage
 */
var dspHtmlLatex = function( html, target, idModal ) {

    // @ts-ignore
    // eslint-disable-next-line no-undef
    MathJax.typesetPromise().then( () => {
        getEltID( target ).html( html )
        getEltID( idModal ).modal();
        // @ts-ignore
        // eslint-disable-next-line no-undef
        MathJax.typesetPromise();
    } ).catch( ( err ) => console.log( err.message ) );
}


/** Affiche les informations dans la div DIV_INFO
 *
 * @param {string} type type d'infos à afficher
 * @param {any[]} arg
 * @returns void
 * @file info.js
 */
function dspContextInfo( type, arg = [undefined, undefined] ) {

    if ( !isString( type ) ) throw new TypeError( e.ERROR_STR )

    let info
    var p1, p2
    switch ( type ) {
        case "init":
            info = DO_INFO_INIT;
            break
        case "pente":
            p1 = arg[ 0 ] == undefined ? "--" : arg[ 0 ].toFixed( 2 )
            info = DO_INFO_P1 + p1;
            break
        case "pentes":
            p1 = arg[ 0 ] == undefined ? "--" : arg[ 0 ].toFixed( 2 )
            p2 = arg[ 1 ] == undefined ? "--" : arg[ 1 ].toFixed( 2 )
            info = DO_INFO_P1 + p1 + DO_INFO_P2 + p2;
            break
        case "err_pentes":
            info = DO_INFO_ERRPENTE;
            break
        case "perp":
            info = DO_INFO_PERP1 + arg[ 2 ].x.toFixed( 1 ) + DO_INFO_PERP2 + arg[ 2 ].y.toFixed( 2 )
            break
        case "perp_move":
            info = DO_INFO_MOVE;
            break
        case "perp_del":
            info = DO_INFO_PERPDEL;
            break
        case "cond":
            info = DO_INFO_COND;
            break
        case "dspTangente":
            info = DO_INFO_TAN
    }

    getEltID( DOS_INFO ).html( "<p><u>Information</u> : <span style='color:red'>" + info + "</span></p>" )

}

/** Construit l'objet nécessaire à l'affichage et appel fonction dspInfo
 * 
 * @param {string} title titre
 * @param {string} msg message
 * @param {string} idButton ID bouton
 * @param {Object} options options diverses
 *  - idbtclose {string} : id du bouton close
 *  - idcontainer {string} : id du container
 *  - idmodal {string?} : id de la fenêtre modale (défaut = idModal)
 *  - labelbtclose {string?} : label du bouton (défaut = 'quitter')
 *  - actionbtclose {function?} : fonction sur clic fermeture (défaut = undefined)
 *  - img {string?} : url d'une image à afficher à côté du texte
 *  - setmsg {function?} fonction chargée du calcul du message
 *  - prm {object?} paramètres à fournir à setMsg
 *  - latex {boolean?} vrai si affichage mathématique (défaut = false)
 *  - callbacks {object?} {id:function}
 */
function dspMessage(title, msg, idButton, options={}){
    const data = {
        idmodal: "idModal",
        idcontainer: ES_DIV_INFO,
        labelbtclose: ES_BTCLOSE_LABEL,
        title: title,
        actionbtclose: setClassMenu,
        idbtclose: idButton,
        msg: msg,
    };

    if (options){
        for (const key in options){
            data[key] = options[key]
        }
    }
    
    dspInfo(data);
}


export { dspInfo, dspContextInfo, dspMessage };