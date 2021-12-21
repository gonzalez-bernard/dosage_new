import {cts} from"../environnement/constantes.js";
import * as ui from "./html_cts.js";
import {gDosages} from "../environnement/globals.js"
import { getValueID, getValue, getEltID } from "../modules/utils/html.js";
import { uString } from "../modules/utils/string.js";
import { mathArrondir } from "../modules/utils/number.js";
import { MNU_DOSAGE } from "../dosage/ui/html_cts.js";
import { getData } from "../data.js"
import { initDosage} from "../dosage/dosage.js"
import { parseObjectType } from "../modules/utils/type.js";


/**
 * @typedef { import ( '../../types/classes' ).Dosage } Dosage 
 * @typedef { import ( '../../types/classes' ).Especes } Especes 
 */

/** Validation des espèces
 *
 * @param {Especes} E
 * @returns void
 * @file especes.data
 * @external especes.events
 */
function eventValidation( E ) {
    
    const G = gDosages.getCurrentDosage()
        
    // type de dosage (acide/base ou autres)
    G.type = getValue( "input[name='choice_type']:checked", { type: "int" } );

    // initialise espèces et calcule les différents points (volume, pH,...)
    if ( G.type == cts.TYPE_ACIDEBASE ) {
        setDosageAcValues( G, E );
        G.title = "Dosage " + G.titre.nomc + " par " + G.titrant.nomc;
    } else {
        setDosageOxValues( G, E );
        G.title = new uString( G.label ).convertExpoIndice().html;
    }
    initDosage( gDosages )

    // indique que les espèces ont été enregistrées
    G.setState( cts.ETAT_ESPECES, 1 );

    // active l'onglet dosage
    getEltID( MNU_DOSAGE ).removeClass( "disabled disabledTab" );
}

/** initialise les valeurs oxydo
 *
 * @param {Dosage} G global
 * @returns void
 * @public
 * @file especes.data.js
 * @external especes.events
 */
function setDosageOxValues( G, E ) {
    // volumes de la solution
    G.titrant.vol = 0;
    G.titre.vol = getValueID( ui.ES_TITRE_VOL, "float" );
    G.eau.vol = getValueID( ui.ES_EAU_VOL, "float" );
    G.reactif.vol = G.hasReactif ? getValueID( ui.ES_SUPP_VOL, "float" ) : 0;
    G.exc.vol =
        G.hasExc != null && G.hasExc != 0 ? ( G.exc.vol = getValueID( ui.ES_EXC_VOL, "float" ) ) : 0;
    G.solution.vol = G.titre.vol + G.eau.vol + G.reactif.vol + G.exc.vol;

    // Concentrations
    G.titre.conc = getValueID( ui.ES_TITRE_CONC, "float" );
    G.titrant.conc = getValueID( ui.ES_TITRANT_CONC, "float" );
    G.reactif.conc = G.hasReactif ? getValueID( ui.ES_SUPP_CONC, "float" ) : 0;
    G.exc.conc = G.hasExc ? getValueID( ui.ES_EXC_CONC, "float" ) : 0;

    // Divers
    G.equation.id = getValueID( ui.ES_AUTREDOS_SELECT, "int" ) - 1;
    const r = E.listOxydo[ G.equation.id ];
    G.mesure = r.mesure;
    G.indics = new uString( r.indic ).strListToArray().getArray();
    G.label = r.label;
    G.typeDetail = parseInt( r.type );

    // equation
    var eq = [];
    if ( G.hasReactif ) {
        eq.push( JSON.parse( E.eqs[ G.equation.id ][ 0 ] ) );
        eq.push( JSON.parse( E.eqs[ G.equation.id ][ 1 ] ) );
        var s = r.reaction[ 0 ].reactifs.split( "," );
        G.reactif.formule = s[ 1 ];
    } else {
        eq.push( JSON.parse( E.eqs[ G.equation.id ] ) );
    }

    G.equation.params = eq;

    G.ph = G.hasExc ? -Math.log10( G.exc.conc ) : eq[ 0 ][ "pH" ];

    // initialise couleurs
    G.titre.color = cts.COLORS[ eq[ 0 ].colors[ 0 ] ];
    G.titrant.color = cts.COLORS[ eq[ 0 ].colors[ 1 ] ];
    G.colProduit.endColor = cts.COLORS[ eq[ 0 ].colors[ 2 ] ];
    if ( eq[ 0 ].colors.length > 3 ) G.colProduit.currentColor = cts.COLORS[ eq[ 0 ].colors[ 3 ] ];
}

/** initialise les valeurs acide-base
 *
 * @param {Dosage} G
 * @file especes.data.js
 */
function setDosageAcValues( G, E) {
    G.titre.id = getValueID( ui.ES_ACIDEBASE_TITRE_SELECT, "int" ) - 1;
    G.titrant.id = getValueID( ui.ES_ACIDEBASE_TITRANT_SELECT, "int" ) - 1;
    G.titre = E.listAcideBase[ G.titre.id ];
    G.titrant = E.listAcideBase[ G.titrant.id ];
    
    // formatage des valeurs string -> number
    parseObjectType(G.titre, ['@id', 'type'], 'int')
    parseObjectType(G.titrant, ['@id', 'type'], 'int')
 
    G.titrant.vol = 0;
    G.titre.vol = getValueID( ui.ES_TITRE_VOL, "float" );
    G.titre.conc = getValueID( ui.ES_TITRE_CONC, "float" );
    G.titrant.conc = getValueID( ui.ES_TITRANT_CONC, "float" );
    G.eau.vol = getValueID( ui.ES_EAU_VOL, "float" );
    G.solution.vol = G.titre.vol + G.eau.vol;
    G.mesure = cts.MESURE_PH + cts.MESURE_COND;
    G.indics = new uString( G.titre.indics ).strListToArray().getArray();
}

/** Extrait la charge à partir de la formule
 *
 * @param {string} str chaine formule chimique
 * @param {string} exp motif exposant
 * @returns {number}
 * @public
 * @file especes.data.js
 */
function getCharge( str, exp = "'" ) {
    const reg = new RegExp( exp + "([\\d\\+\\-]*)" + exp );
    const v = str.match( reg );
    if ( v == null || v.length === 0 ) return 0;
    let c = v[ 1 ];
    if ( c == "+" ) return 1;
    else if ( c == "-" ) return -1;
    c = v[ 1 ].substr( v[ 1 ].length - 1, 1 ) + v[ 1 ].slice( 0, -1 );
    return Number( c );
}

/** Calcule le pH à partir du formulaire
 *
 * @returns {string|boolean}
 * @public
 * @file especes.data.js
 */
function getPH() {
    const c = getValueID( ui.ES_EXC_CONC, "float" );
    const vex = getValueID( ui.ES_EXC_VOL, "float" );
    const vt = getValueID( ui.ES_TITRE_VOL, "float" );
    const ve = getValueID( ui.ES_EAU_VOL, "float" );

    if ( c > 0 && vex > 0 && vt > 0 ) {
        let ph = mathArrondir( -Math.log10( ( c * vex ) / ( vex + vt + ve ) ), 3 ).toString();
        return ph;
    }
    return false;
}

/** Récupère les espèces à partir de Python
 * 
 * @returns Promise
 */
async function getEspeces() {
    return getData( cts.DATA_GET_ESPECES, cts.DATA_GET_ESPECES_OK )
}


export { getEspeces, setDosageAcValues, setDosageOxValues, getCharge, getPH, eventValidation };