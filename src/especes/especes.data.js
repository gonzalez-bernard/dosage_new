import {cts} from"../environnement/constantes.js";
import * as ui from "./html_cts.js";
import {gDosage} from "../environnement/globals.js"
import { getValueID, getValue, getEltID } from "../modules/utils/html.js";
import { uString } from "../modules/utils/string.js";
import { mathArrondir } from "../modules/utils/number.js";
import { getData } from "../data.js"
import { parseObjectType } from "../modules/utils/type.js";


/**
 * @typedef { import ( '../../types/classes' ).Dosage } Dosage 
 * @typedef { import ( '../../types/classes' ).Especes } Especes 
 */

/** initialise les valeurs oxydo
 *
 * @param {Dosage} dosage dosage en cours
 * @returns void
 * @public
 * @file especes.data.js
 * @external especes.events
 */
function setDosageOxValues( dosage, E ) {
    // volumes de la solution
    dosage.titrant.vol = 0;
    dosage.titre.vol = getValueID( ui.ES_TITRE_VOL, "float" );
    dosage.eau.vol = getValueID( ui.ES_EAU_VOL, "float" );
    dosage.reactif.vol = dosage.hasReactif ? getValueID( ui.ES_SUPP_VOL, "float" ) : 0;
    dosage.exc.vol =
        dosage.hasExc != null && dosage.hasExc != 0 ? ( dosage.exc.vol = getValueID( ui.ES_EXC_VOL, "float" ) ) : 0;
    dosage.solution.vol = dosage.titre.vol + dosage.eau.vol + dosage.reactif.vol + dosage.exc.vol;

    // Concentrations
    dosage.titre.conc = getValueID( ui.ES_TITRE_CONC, "float" );
    dosage.titrant.conc = getValueID( ui.ES_TITRANT_CONC, "float" );
    dosage.reactif.conc = dosage.hasReactif ? getValueID( ui.ES_SUPP_CONC, "float" ) : 0;
    dosage.exc.conc = dosage.hasExc ? getValueID( ui.ES_EXC_CONC, "float" ) : 0;

    // Divers
    dosage.equation.id = getValueID( ui.ES_AUTREDOS_SELECT, "int" ) - 1;
    const r = E.listOxydo[ dosage.equation.id ];
    dosage.mesure = r.mesure;
    dosage.indics = new uString( r.indic ).strListToArray().getArray();
    dosage.label = r.label;
    dosage.typeDetail = parseInt( r.type );

    // equation
    var eq = [];
    if ( dosage.hasReactif ) {
        eq.push( JSON.parse( E.eqs[ dosage.equation.id ][ 0 ] ) );
        eq.push( JSON.parse( E.eqs[ dosage.equation.id ][ 1 ] ) );
        var s = r.reaction[ 0 ].reactifs.split( "," );
        dosage.reactif.formule = s[ 1 ];
    } else {
        eq.push( JSON.parse( E.eqs[ dosage.equation.id ] ) );
    }

    dosage.equation.params = eq;

    dosage.ph = dosage.hasExc ? -Math.log10( dosage.exc.conc ) : eq[ 0 ][ "pH" ];

    // initialise couleurs
    dosage.titre.color = cts.COLORS[ eq[ 0 ].colors[ 0 ] ];
    dosage.titrant.color = cts.COLORS[ eq[ 0 ].colors[ 1 ] ];
    dosage.colProduit.endColor = cts.COLORS[ eq[ 0 ].colors[ 2 ] ];
    if ( eq[ 0 ].colors.length > 3 ) dosage.colProduit.currentColor = cts.COLORS[ eq[ 0 ].colors[ 3 ] ];
}

/** initialise les valeurs acide-base
 *
 * @param {Dosage} dosage
 * @file especes.data.js
 */
function setDosageAcValues( dosage, E) {
    dosage.titre.id = getValueID( ui.ES_ACIDEBASE_TITRE_SELECT, "int" ) - 1;
    dosage.titrant.id = getValueID( ui.ES_ACIDEBASE_TITRANT_SELECT, "int" ) - 1;
    dosage.titre = E.listAcideBase[ dosage.titre.id ];
    dosage.titrant = E.listAcideBase[ dosage.titrant.id ];
    
    // formatage des valeurs string -> number
    parseObjectType(dosage.titre, ['@id', 'type'], 'int')
    parseObjectType(dosage.titrant, ['@id', 'type'], 'int')
 
    dosage.titrant.vol = 0;
    dosage.titre.vol = getValueID( ui.ES_TITRE_VOL, "float" );
    dosage.titre.conc = getValueID( ui.ES_TITRE_CONC, "float" );
    dosage.titrant.conc = getValueID( ui.ES_TITRANT_CONC, "float" );
    dosage.eau.vol = getValueID( ui.ES_EAU_VOL, "float" );
    dosage.solution.vol = dosage.titre.vol + dosage.eau.vol;
    dosage.mesure = cts.MESURE_PH + cts.MESURE_COND;
    dosage.indics = new uString( dosage.titre.indics ).strListToArray().getArray();
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


export { getEspeces, setDosageAcValues, setDosageOxValues, getCharge, getPH};