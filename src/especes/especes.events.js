// @ts-nocheck
/*****************************************
 *  EVENTS  
 * ****************************************/
import * as ui from "./html_cts.js"
import {cts} from"../environnement/constantes.js"
import {gDosages, gEspeces} from "../environnement/globals.js"
import { setDosageOxValues, eventValidation } from "./especes.data.js"
import { getElt, getValue, getEltID } from "../modules/utils/html.js"
import { inputValidSaisie, updSaisieSelect, getListEspeceTitrante, changeOxSelect, initDataInfo } from "./especes.ui.js"
import { Form } from "../modules/utils/form.js"
import { dspInfo } from "../infos/infos.js";

// test
var frm = new Form( ui.ES_FORM )

/**
 * 
 * @param {Dosage} G global
 * @returns void
 * @public
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
    $(document.body).on( 'change', "#"+ui.ES_ACIDEBASE_TITRE_SELECT , getListEspeceTitrante )

    /*** Quand on a sélectionné les deux espèces on active le bouton info */
    let data_info = {
        buttons: [ '#' + ui.ES_BT_VALID, '#' + ui.ES_BT_dspINFO_AC ],
        mark: true,
        pass: false,
        feedback: "*_feedback",
        validator: { 'fct': updSaisieSelect.bind( G ) }
    }
    
    getEltID( ui.ES_ACIDEBASE_TITRANT_SELECT ).on( 'change', data_info, frm.validButtons.bind( frm ) );
    let data_action = {
        fields: ['#' + ui.ES_ACIDEBASE_TITRANT_SELECT, '#' + ui.ES_ACIDEBASE_TITRE_SELECT ],
        action: (()=>{$("#"+ui.ES_BT_dspINFO_AC).prop('disabled',false)})
    }
    getEltID( ui.ES_ACIDEBASE_TITRANT_SELECT ).on( 'change', data_action, frm.actionFields.bind( frm ) );

    /** Selection d'une réaction    */
    getEltID( ui.ES_AUTREDOS_SELECT ).on( 'change', data_info, function( e ) {
        const G = gDosages.getCurrentDosage()
        changeOxSelect( G, gEspeces )
        setDosageOxValues( G, gEspeces )
        frm.validButtons.bind( frm )( e )
    } )

    data_action = {
        fields: ['#' + ui.ES_AUTREDOS_SELECT],
        action: (()=>{$("#"+ui.ES_BT_dspINFO_AC).prop('disabled',false)})
    }
    getEltID( ui.ES_AUTREDOS_SELECT ).on( 'change', data_action, frm.actionFields.bind( frm ) );

    // Choix pH excipient
    //getEltID( ui.ES_FORM ).on( 'change', dspPH )

    /**  Validation        */
    getEltID( ui.ES_BT_VALID ).on( 'click', function() {
        eventValidation( gDosages.getCurrentDosage(), gEspeces)
    } )

    /** Affichage de l'aide */
    getEltID( ui.ES_BT_dspINFO_AC ).on( "click", null, { 'arg': G, fct: initDataInfo }, dspInfo );
    getEltID( ui.ES_BT_dspINFO_OX ).on( "click", null, { 'arg': G, fct: initDataInfo }, dspInfo );

}

export { setEvents}