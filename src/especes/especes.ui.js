// @ts-nocheck
/** especes.ui.js 
 * @module especes/especes.ui
 * @description 
 * - Initialise les espèces et le formulaire
 * - Gestion des events du formulaire
 * ***
 * ***export updEspeces***
 */

import * as txt from "./lang_fr.js"
import * as cts from "../environnement/constantes.js"
import * as ui from "./html_cts.js"

import { G, getGlobal } from "../environnement/globals.js"

import { getElt, getValue, getEltID, getValueID, setValueID } from "../modules/utils/html.js"
import { formSetOptions } from "../modules/utils/form.js"
import { isInInterval } from "../modules/utils/number.js"
import { uString } from "../modules/utils/string.js"
import { isArray } from "../modules/utils/type.js"

import { getInfoPH, getInfoOX } from "./especes.infos.js";
import { getCharge, getPH, getEspeces } from "./especes.data.js"
import { setEvents } from "./especes.events.js"
import { html } from "./html.js"
import { DOS_DIV_INFO } from "../dosage/ui/html_cts.js"

getEltID( ui.ES_ACIDEBASE_TITRANT_SELECT ).trigger( 'focus' )

/** Met à jour les listes déroulantes
 * 
 * @param {Dosage} G
 * @return void
 * @public
 * @file especes.ui.js
 * @external especes.events
 */
function updSaisieSelect( G ) {

    // si dosage acido-basique
    if ( getValue( "input[name='choice_type']:checked" ) == '1' ) {
        if ( getValueID( ui.ES_ACIDEBASE_TITRE_SELECT ) == null ) {
            getEltID( ui.ES_ACIDEBASE_TITRE_SELECT ).trigger( "focus" )
        } else if ( getValueID( ui.ES_ACIDEBASE_TITRANT_SELECT ) == null ) {
            getEltID( ui.ES_ACIDEBASE_TITRANT_SELECT ).trigger( "focus" )
        }
        G.set( 'type', cts.TYPE_ACIDEBASE )
        getEltID( ui.ES_BT_DSPINFO_AC ).removeAttr( 'disabled' )

        // dosage oxydo
    } else {
        if ( getValueID( ui.ES_AUTREDOS_SELECT ) == null ) {
            getEltID( ui.ES_AUTREDOS_SELECT ).trigger( "focus" )
                //msg = txt.ES_MSG_REACTION_SELECT
        }

        G.set( 'type', cts.TYPE_OXYDO )
        getEltID( ui.ES_BT_DSPINFO_OX ).removeAttr( 'disabled' )
    }
}

/** Initialise l'objet utilisé par dspInfo avec les données saisies
 * 
 * @param {Dosage} G
 * @returns {tDataInfo} objet utilisé par dspInfo
 * @public
 * @see especes.infos~getInfoPH
 * @see especes.infos~getInfoOX
 * @file especes.ui.js
 * @external especes.events
 */
function initDataInfo( G ) {

    const initDataInfo = {
        idmodal: "id_es_modal",
        idcontainer: ui.ES_DIV_INFO,
        title: "Especes",
        labelbtclose: txt.ES_BTCLOSE_LABEL,
        idbtclose: "dos_info_close",
        data: getGlobal,
        latex: true,
    }

    if (G.etat & cts.ETAT_DOS){
        initDataInfo.idcontainer = DOS_DIV_INFO
        initDataInfo.idmodal = "id_dos_modal"
    }
        

    let infos
    if ( G.type == cts.TYPE_ACIDEBASE ) {
        const _G = initDataInfo.data()
        infos = getInfoPH( _G )
    } else
        infos = getInfoOX( initDataInfo.data() )

    initDataInfo.msg = infos.msg
    initDataInfo.title = infos.title
    return initDataInfo
}

/** Affiche le pH
 * 
 * @public
 * @see especes.data~getPH
 * @file especes.ui.js 
 * @external especes.events
 */
function dspPH() {
    getEltID( ui.ES_EXC_PH).text( txt.ES_EXC_PH + getPH() )
}

/** Rafraîchit le formulaire
 * 
 * @returns void
 */
function resetForm(){

    // active les listes et le choix du type
    getEltID( ui.ES_ACIDEBASE_TITRE_SELECT ).prop( 'disabled', false ).val(1)
    getEltID( ui.ES_ACIDEBASE_TITRANT_SELECT ).prop( 'disabled', false )
    getEltID( ui.ES_AUTREDOS_SELECT ).prop( 'disabled', false ).val(1)
    getElt( "input[name='choice_type']:radio" ).prop( 'disabled', false )

    // Désactive le bouton de validation
    getEltID( ui.ES_BT_VALID ).prop( 'disabled', true )

    // cache formulaire supplémentaire
    getEltID( ui.ES_SUPP ).hide()

    // cache formulaire excipient
    getEltID( ui.ES_EXC ).hide()

    setValueID(ui.ES_TITRE_CONC, 0.01)
}

/** action lors du changement de sélection des réactions oxydo
 * 
 * @param {Dosage} G
 * @returns void
 * @public
 * @see especes.data~getCharge
 * @file especs.ui.js
 * @external especes.events
 */
function changeOxSelect( G ) {
    const r = G.listOxydo[ getValueID( ui.ES_AUTREDOS_SELECT, "int" ) - 1 ]
    let reac = r.reaction

    G.hasReactif = false
    G.hasExc = 0

    // test si réaction retour dans ce cas on positionne le flag hasRéactif
    if ( r.n_reaction == "2" ) {
        G.hasReactif = true

        reac = reac[ 0 ]

        // met en forme la formule
        var f = new uString( reac.reactifs.split( "," )[ 1 ] ).convertExpoIndice( true ).html
        getEltID( ui.ES_SUPP_FORMULE ).html( f )

        // affiche formulaire supplémentaire
        getEltID( ui.ES_SUPP ).show()
    } else {
        //
    }
    // test si excipient, positionne le flag hasExc et affiche ou efface le champ
    const reacs = reac.reactifs.split( "," )

    if ( reacs.length > 2 ) {
        G.hasExc = getCharge( reacs[ 2 ] ) // égale à la charge électrique
        if ( G.hasExc != 0 )
            getEltID( ui.ES_EXC ).show()
    }
}

/** Cache affichage concentration pour problème
 * 
 * G.inconnu est un tableau d'objet ou un objet
 * @param {Dosage} G
 * @returns void
 * @see _updEspece
 * @file especes.ui.js 
 * @external problem.ui
 */
function updEspeces( G ) {
    // si type acide-base on sélectionne le bon formulaire
    if ( G.type == 1 ) {
        getEltID( ui.ES_ACIDEBASE ).show()
        getEltID( ui.ES_AUTREDOS ).hide()
        getEltID( "type_ac" ).prop( "checked", true )
    } else {
        getEltID( ui.ES_ACIDEBASE ).hide()
        getEltID( ui.ES_AUTREDOS ).show()
        getEltID( "type_ox" ).prop( "checked", true )
    }

    // reset formulaire
    resetForm()
    getElt( "input[name='choice_type']:radio" ).prop( 'disabled', true )

    // on initialise les champs du formulaires
    if ( isArray( G.inconnu[ 'field' ] ) ) {
        for ( let o in G.inconnu[ 'field' ] ) {
            _updEspece( G.inconnu[ 'field' ][ o ] )
        }
    } else {
        _updEspece( G.inconnu[ 'field' ].name )
    }
}

/** Initialise la liste de l'espèce titrante en fonction du choix de l'espèce titrée
 * 
 * @returns void
 * @file especes.ui.js
 * @external especes.events
 */
function getListEspeceTitrante() {

    const id = this.selectedIndex
    const titre_value = parseInt( this.value )

    // si pas de titrant défini
    const titrant_value = getValueID( ui.ES_ACIDEBASE_TITRANT_SELECT, 'int' )
    if ( ( titre_value < 10 && titrant_value >= 10 ) || ( titre_value >= 10 && titrant_value < 10 ) )
        return

    const type =  id >= 16 ? "acide" : "base"  
    let html = _setListAcidebase( G.lst_acide, type )

    // insère dans le DOM
    getEltID( ui.ES_ACIDEBASE_TITRANT_SELECT ).html( html ).trigger( "focus" );
}

/** Valide la saisie des champs du formulaire
 * 
 * @param {object} obj  ayant généré l'événement
 * @return {boolean} vrai si saisie valide
 * @file especes.ui.js
 * @external especes.events
 */
function inputValidSaisie( obj ) {

    const v = parseFloat( obj.value )

    // On teste si le champ courant valide les contraintes particulières
    // test les champs concentrations et volumes
    let min, max
    if ( obj.id.search( 'con' ) != -1 ) {
        if ( obj.id == ui.ES_SUPP_CONC ) {
            min = cts.CONC_RMIN;
            max = cts.CONC_RMAX
        } else if ( obj.id == ui.ES_EXC_CONC ) {
            min = cts.CONC_EMIN;
            max = cts.CONC_EMAX
        } else {
            min = cts.CONC_MIN;
            max = cts.CONC_MAX
        }
    } else if ( obj.id.search( 'vol' ) != -1 ) {
        if ( obj.id == ui.ES_SUPP_VOL || obj.id == ui.ES_EXC_VOL ) {
            min = cts.VOL_RMIN;
            max = cts.VOL_RMAX
        } else if ( obj.id == ui.ES_EAU_VOL ) {
            min = cts.VOL_EMIN;
            max = cts.VOL_EMAX
        } else {
            min = cts.VOL_MIN;
            max = cts.VOL_MAX
        }
    }
    return isInInterval( v, min, max, false )
}

/** Initialise le formulaire
  
  Récupère les listes d'espèces à partir du fichier
  @param {HTMLElement|String} html
  @param {Dosage} G variable global
  @use _setListAcidebase, _setListOxydo, initLists
  @file especes.ui.js
  @external intro.ui.js
  @returns void
*/
function initEspeces( G ) {

    // Contenu html
    let _html = '';

    // Affichage global
    try {
        getEltID( ui.ESPECES ).html( html );

        // Appel au serveur si nécessaire pour récupérer liste des especes
        if ( G.lst_acide.length > 0 ) {
            // construit la liste d'options
            _html = _setListAcidebase( G.lst_acide, "all" )
            getEltID( ui.ES_ACIDEBASE_TITRANT_SELECT ).html( _html )
        } else
            getEspeces().then( function( data ) {
                // enregistre les listes
                G.initLists( data )

                // construit la liste d'options
                _html = _setListAcidebase( data.list_acidebase, "all" )
                getEltID( ui.ES_ACIDEBASE_TITRE_SELECT ).html( _html );

                // @todo A supprimer
                getEltID( ui.ES_ACIDEBASE_TITRE_SELECT, 'option[value=1]' ).attr( 'selected', 'selected' ).change()
                getEltID( ui.ES_ACIDEBASE_TITRANT_SELECT, 'option[value=1]' ).attr( 'selected', 'selected' )

                _html = _setListOxydo( data.list_autredos, 'all' );
                getEltID( ui.ES_AUTREDOS_SELECT ).html( _html );

            } )

        // Events
        setEvents( G )

    } catch ( e ) {
        console.error( e )
    }
    
    // initialise en mode acide-base
    G.setState( cts.TYPE_ACIDEBASE, 1 )

}

/** Active ou désactive l'onglet
 * 
 * @param {boolean} display indique si on active ou non 
 */
 function dspTabEspeces(display){
    if (display){
        getEltID( ui.MNU_ESPECES ).addClass( 'active' )
        getEltID( ui.ESPECES ).addClass( 'active show' )
    } else {
        getEltID( ui.MNU_ESPECES ).removeClass( 'active' )
        getEltID( ui.ESPECES ).removeClass( 'active show' )
    }
}

/** FONCTIONS LOCALES */

/** Actualise et désactive les champs pour les problèmes
 * 
 * @param {{name: string, value: number}} f précise nom du champ et valeur
 * @returns void  
 * @private
 * @file especes.ui.js
 */
function _updEspece( f ) {

    switch ( f.name ) {
        case 'ci': // concentration titré
            setValueID( ui.ES_TITRE_CONC, f.value )
            getEltID( ui.ES_TITRE_CONC ).attr( 'type', 'password' ).attr( 'disabled', 'true' )
            break
        case 'stitre': // sélection titré
            if ( G.type == 1 ) {
                getEltID( ui.ES_ACIDEBASE_TITRE_SELECT ).val( f.value )
                getEltID( ui.ES_ACIDEBASE_TITRE_SELECT ).prop( 'disabled', true )
                
            } else {
                getEltID( ui.ES_AUTREDOS_SELECT ).val( f.value )
                getEltID( ui.ES_AUTREDOS_SELECT ).prop( 'disabled', true )

                // actualise le formulaire
                changeOxSelect(G)
            }
            break
        case 'stitrant': // sélection titrant
            if ( G.type == 1 ) {
                getEltID( ui.ES_ACIDEBASE_TITRANT_SELECT ).val( f.value )
                getEltID( ui.ES_ACIDEBASE_TITRANT_SELECT ).prop( 'disabled', true )
                
            } else {
                getEltID( ui.ES_AUTREDOS_SELECT ).val( f.value )
                getEltID( ui.ES_AUTREDOS_SELECT ).prop( 'disabled', true )
            }
            break
    }
}

/************************************************ */

/** Initialise la liste de sélection des espèces
 * 
 * @param {object[]} listAcideBase liste des items
 * @param {string} type (all | acide | base)
 * @return {String}
 * @private
 * @file especes.ui.js
 */
function _setListAcidebase( listAcideBase, type ) {
    let html = "<option disabled selected value>" + txt.ES_LABEL_SELECT + "</option>"
    if ( type == "all" ) {
        html += formSetOptions( listAcideBase[ cts.TYPE_ES_MONOACIDEFORT ], txt.ES_LABEL_AF )
        html += formSetOptions( listAcideBase[ cts.TYPE_ES_POLYACIDEFORT ], txt.ES_LABEL_PAF )
        html += formSetOptions( listAcideBase[ cts.TYPE_ES_MONOACIDEFAIBLE ], txt.ES_LABEL_Af )
        html += formSetOptions( listAcideBase[ cts.TYPE_ES_POLYACIDEFAIBLE ], txt.ES_LABEL_PAf )
        html += "<option>----------------</option>"
        html += formSetOptions( listAcideBase[ cts.TYPE_ES_MONOBASEFORTE ], txt.ES_LABEL_BF )
        html += formSetOptions( listAcideBase[ cts.TYPE_ES_MONOBASEFAIBLE ], txt.ES_LABEL_Bf )
    } else if ( type == "acide" ) {
        html += formSetOptions( listAcideBase[ cts.TYPE_ES_MONOACIDEFORT ], txt.ES_LABEL_AF )
    } else if ( type == "base" )
        html += formSetOptions( listAcideBase[ cts.TYPE_ES_MONOBASEFORTE ], txt.ES_LABEL_BF )

    return html
}

/************************************************ */

/** Initialise la liste de sélection des espèces
 * 
 * @param {object[]} lst_dosages liste des items
 * @param {string} type (all | acide | base)
 * @return {String}
 * @private
 * @file especes.ui.js
 */
var _setListOxydo = function( lst_dosages, type ) {
    let html = "<option disabled selected value>" + txt.ES_LABEL_SELECT + "</option>"
    if ( type == "all" ) {
        html += formSetOptions( lst_dosages )
    }
    return html
}

/************************************************ */

export { updEspeces, inputValidSaisie, updSaisieSelect, getListEspeceTitrante, changeOxSelect, dspPH, initDataInfo, initEspeces, resetForm, dspTabEspeces }