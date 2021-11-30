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


import { Element, Div, Button } from "../modules/dom.js";
import * as e from "../modules/utils/errors.js"
import { isEvent, isFunction, isString } from "../modules/utils/type.js";
import { insertDiese } from "../modules/utils/string.js";
import { propLower } from "../modules/utils/object.js";
import { DO_INFO_COND, DO_INFO_ERRPENTE, DO_INFO_INIT, DO_INFO_MOVE, DO_INFO_P1, DO_INFO_P2, DO_INFO_PERP1, DO_INFO_PERP2, DO_INFO_PERPDEL, DO_INFO_TAN } from "./lang_fr.js"
import { DOS_INFO } from "../dosage/ui/html_cts.js"
import { getEltID } from "../modules/utils/html.js"

/**
 * @class Infos
 * @classdesc
 * - Gestion et affichage d'une fenêtre modale pour afficher des informations
 * ***
 * ***export Infos***
 */
class Infos {

    /** Constructeur
     *
     * @param {object} info contient tous les paramètres nécessaires
     * @description info peut contenir  :
     * - idcontainer {string} ID du div caontainer
     * - title {string} titre
     * - msg {string?} message si non défini, il faut avoir la fonction 'setmsg' avec éventuellement les paramètres 'prm'
     * - idmodal {string?} id de la fenêtre modale (défaut = idModal)
     * - idbtclose {string?} id du bouton de fermeture (défaut = idBtClose)
     * - labelbtclose {string?} texte du bouton (défaut = "Quitter")
     * - actionbtclose {string?} action sur clic bouton
     * - latex {boolean?} le texte utilise latex (défaut = false)
     * - callbacks {string: function?} définit des actions sur clics dans message {id: fonction}
     * - setmsg {function?} fonction chargée de construire la chaîne 'msg' (défaut = undefined)
     * - prm {object?} paramètres
     */
    constructor( info ) {
        if ( !( 'idcontainer' in info ) || !( 'title' in info ) || !( 'msg' in info ) ) throw new TypeError( e.ERROR_OBJ )

        let defaults = { idmodal: 'idModal', idbtclose: 'idBtClose', labelbtclose: 'Quitter', actionBtClose: undefined, latex: false }
        let params = {...defaults, ...info }


        this.idContainer = params.idcontainer
        this.title = params.title
        this.msg = params.msg
        this.idModal = params.idmodal
        this.idBtClose = params.idbtclose
        this.labelBtClose = params.labelbtclose
        this.actionBtClose = params.actionbtclose
        this.latex = params.latex
        this.callbacks = params.callbacks || undefined
        this.data = params.data || undefined
        this.setMsg = params.setmsg || undefined


        // si action sur clic bouton fermeture
        if ( this.actionBtClose != undefined && typeof this.actionBtClose == "function" ) {
            $( document ).on( "hide.bs.modal", "#" + this.idModal, function() {
                params[ 'actionBtClose' ]();
            } );
        }

        // gère les callbacks
        if ( params[ 'callbacks' ] != undefined ) {
            let _key
            Object.keys( params[ 'callbacks' ] ).forEach( ( key ) => {
                _key = insertDiese( key )
                $( document ).on( "click", _key, params[ 'callbacks' ][ key ] );
            } );
        }
    }

    /** Construite la chaine html
     *
     * @returns {string} contenu html
     */
    init_html() {
        let divs = {},
            elts = {},
            buttons = {};

        elts.h5 = new Element( "h5", { id: "modal-title" } ).setText( this.title );
        elts.span = new Element( "span", {} )
            .setAria( "hidden", "true" )
            .setText( "&times" );
        buttons.close = new Button("")
            .addClass( "close" )
            .setData( "dismiss", "modal" )
            .setAria( "label", "Close" )
            .addChild( elts.span );
        divs.header = new Div( "modal-header" ).addChild( elts.h5, buttons.close );

        divs.body = new Div( "modal-body" ).setText( this.msg );

        buttons.exit = new Button( this.labelBtClose )
            .addClass( "btn btn-secondary" )
            .setData( "dismiss", "modal" )
            .setID( this.idBtClose );
        divs.footer = new Div( "modal-footer" ).addChild( buttons.exit );

        divs.content = new Div( "modal-content" ).addChild(
            divs.header,
            divs.body,
            divs.footer
        );
        divs.dialog = new Div( "modal-dialog modal-lg" )
            .setRole( "document" )
            .addChild( divs.content );
        divs.modal = new Div( "modal fade", this.idModal )
            .setData( "dismiss", "modal" )
            .setRole( "dialog" )
            .setTabIndex( "-1" )
            .setAria( "hidden", "true" )
            .addChild( divs.dialog );

        let html = divs.modal.getHTML();
        return html;
    }

}

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
    if ( !( 'idcontainer' in data ) || !( 'idbtclose' in data ) || !( 'title' in data ) ) throw new TypeError( e.ERROR_OBJ )
    if ( !isString( data[ 'idmodal' ] ) || !isString( data[ 'title' ] ) || !isString( data[ 'idbtclose' ] ) ) throw new TypeError( e.ERROR_STR )

    // pas de message ni de callback
    if ( ( !( 'msg' in data ) || !data[ 'msg' ] ) && !( 'setmsg' in data ) ) throw new TypeError( e.ERROR_OBJ )

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

/*

    switch (evt['infos'].type){
        case 0:
            cInfo = new Infos(evt['title'],evt['infos']['msg'], evt['idModal'],evt['idBtClose'], labelBtClose)
            break
        case 1:
            // on récupère type de dosage saisies du formulaire
            // @ts-ignore
            G.type = parseInt($("input[name='choice_type']:checked").val())

            // initialise espèces si réaction acido-basique ou redox
            if (G.type == cts.TYPE_ACIDEBASE) {
                setDosageAcValues()
            } else {
                setDosageOxValues()
            }
            var data =  G
           
            // détermine le type de dosage
            let o
            if (data.type == TYPE_ACIDEBASE){
                o = getInfoPH(data);
            } 
            else {
                o = getInfoOX(data);
            }
            cInfo = new Infos(o['title'],o['msg'], evt['idModal'],evt['idBtClose'], labelBtClose)
            break
        case 2: // problèmes
            // Efface contenu précédent
            if (evt['idModal'] == "#" + PB_HELP){
                getEltID(PB_SOLUTION).html('')
             } else {
                getEltID(PB_HELP).html('')
            }
            let msg = evt['infos']['msg'] + "</hr/>"
            cInfo = new Infos(evt['title'],msg, evt['idModal'],evt['idBtClose'], labelBtClose)
     
    } 

    // récupère le contenu html
    //
    dspHtmlLatex(html, "#"+event.data.container, "#"+event.data.idModal)
    //$("#" + event.data.container).html(html);
   
};



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
 * @param {any[]?} arg
 * @returns void
 * @public
 * @file info.js
 * @ext 
 */
function dspContextInfo( type, arg = undefined ) {

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


export { dspInfo, dspContextInfo };