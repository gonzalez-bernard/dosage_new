// @ts-nocheck
/*****************************************
 *  EVENTS  
 * ****************************************/
import * as ui from "./html_cts.js"
import * as cts from "../environnement/constantes.js"

import { setDosageOxValues, eventValidation } from "./especes.data.js"
import { getElt, getValue, getEltID } from "../modules/utils/html.js"
import { inputValidSaisie, updSaisieSelect, getListEspeceTitrante, changeOxSelect, dspPH, initDataInfo } from "./especes.ui.js"
import { Form } from "../modules/utils/form.js"
import { dspInfo } from "../infos/infos.js";

// test
var frm = new Form( ui.ES_FORM )

/**
 * 
 * @param {Dosage} G global
 * @returns void
 * @public
 * @see  especes.ui~getListEspeceTitrante
 * @see  especes.ui~changeOxSelect
 * @see  especes.ui~updSaisieSelect
 * @see  especes.ui~dspPH
 * @see  especes.data~setDosageOxValues
 * @see  especes.data~eventValidation
 * @file especes.events
 * 
 */
function setEvents( G ) {

    /**  gestion de la saisie, valide les champs */
    getEltID( ui.ES_FORM, "input[type=text]" ).on( 'change', {
        buttons: '#' + ui.ES_BT_VALID,
        mark: true,
        pass: false,
        feedback: "*_feedback",
        validator: { 'verif': inputValidSaisie }
    }, frm.validButtons.bind( frm ) );

    /*** choix du type de réaction           */
    getElt( "input[name='choice_type']:radio" ).on( 'change', function() {
        // On affiche le formulaire adéquat
        if ( getValue( "input[name='choice_type']:checked" ) == '1' ) {
            getEltID( ui.ES_ACIDEBASE ).show()
            getEltID( ui.ES_AUTREDOS ).hide()
            G.set( 'type', cts.TYPE_ACIDEBASE )

        } else {
            getEltID( ui.ES_ACIDEBASE ).hide()
            getEltID( ui.ES_AUTREDOS ).show()
            G.set( 'type', cts.TYPE_OXYDO )
        }

        // Cache sous formulaires
        getEltID( ui.ES_SUPP ).hide()
        getEltID( ui.ES_EXC ).hide()
    } )

    /*** Selection d'une espèce titrée, on initialise la liste des espèces titrantes */
    getEltID( ui.ES_ACIDEBASE_TITRE_SELECT ).on( 'change', getListEspeceTitrante )

    /*** Quand on a sélectionné les deux espèces on active le bouton info */
    let data_info = {
        buttons: [ '#' + ui.ES_BT_VALID, '#' + ui.ES_BT_DSPINFO_AC ],
        mark: true,
        pass: false,
        feedback: "*_feedback",
        validator: { 'fct': updSaisieSelect.bind( G ) }
    }
    
    getEltID( ui.ES_ACIDEBASE_TITRANT_SELECT ).on( 'change', data_info, frm.validButtons.bind( frm ) );
    const data_action = {
        fields: ['#' + ui.ES_ACIDEBASE_TITRANT_SELECT, '#' + ui.ES_ACIDEBASE_TITRE_SELECT ],
        action: (()=>{$("#"+ui.ES_BT_DSPINFO_AC).prop('disabled',false)})
    }
    getEltID( ui.ES_ACIDEBASE_TITRANT_SELECT ).on( 'change', data_action, frm.actionFields.bind( frm ) );

    /** Selection d'une réaction    */
    getEltID( ui.ES_AUTREDOS_SELECT ).on( 'change', data_info, function( e ) {
        changeOxSelect( G )
        setDosageOxValues( G )
        frm.validButtons.bind( frm )( e )
    } )

    // Choix pH excipient
    getEltID( ui.ES_FORM ).on( 'change', dspPH )

    /**  Validation        */
    getEltID( ui.ES_BT_VALID ).on( 'click', function() {
        eventValidation( G )
    } )

    /** Affichage de l'aide */
    getEltID( ui.ES_BT_DSPINFO_AC ).on( "click", null, { 'arg': G, fct: initDataInfo }, dspInfo );
    getEltID( ui.ES_BT_DSPINFO_OX ).on( "click", null, initDataInfo, dspInfo );

    /*
        getElt( 'a[data-toggle="tab"]' ).on( 'shown.bs.tab', function( e ) {
            if ( $( e.target ).attr( "href" ) == "#especes" )
                $( '.title' ).text( 'Espèces' );
            else if ( isDefined( G ) )
                $( '.title' ).html( G.title );
            else
                $( '.title' ).html( new uString( $( e.target ).attr( "href" ).substring( 1 ) ).capitalize().val );
        } );
    */
}

export { setEvents }