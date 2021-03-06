import * as cts from "../environnement/constantes.js";
import * as ui from "./html_cts.js";

import {initDosagePH} from "../dosage/dosage_ph.js";
import {initDosageOX} from "../dosage/dosage_ox.js";

import {getValueID, getValue, getEltID} from "../modules/utils/html.js";
import {uString} from "../modules/utils/string.js";
import {mathArrondir} from "../modules/utils/number.js";
import {MNU_DOSAGE} from "../dosage/ui/html_cts.js";

/** Validation des espèces
 *
 * @param {Dosage} G
 * @returns void
 * @public
 * @see especes.data~setDosageAcValues
 * @see especes.data~setDosageOxValues
 * @see dosage_ox~initDosageOX
 * @see dosage_ph~initDosagePH
 * @file especes.data
 * @external especes.events
 */
function eventValidation(G) {
    // type de dosage (acide/base ou autres)
    G.type = getValue("input[name='choice_type']:checked", {type: "int"});

    // initialise espèces et calcule les différents points (volume, pH,...)
    if (G.type == cts.TYPE_ACIDEBASE) {
        setDosageAcValues(G);
        initDosagePH(G);
        G.title = "Dosage " + G.titre.nomc + " par " + G.titrant.nomc;
    } else {
        setDosageOxValues(G);
        initDosageOX(G);
        G.title = new uString(G.label).convertExpoIndice().html;
    }

    // indique que les espèces ont été enregistrées
    G.setState(cts.ETAT_ESPECES, 1);

    // active l'onglet dosage
    getEltID(MNU_DOSAGE).removeClass("disabled disabledTab");
}

/** initialise les valeurs oxydo
 *
 * @param {Dosage} G global
 * @returns void
 * @public
 * @file especes.data.js
 * @external especes.events
 */
function setDosageOxValues(G) {
    // volumes de la solution
    G.titrant.vol = 0;
    G.titre.vol = getValueID(ui.ES_TITRE_VOL, "float");
    G.eau.vol = getValueID(ui.ES_EAU_VOL, "float");
    G.reactif.vol = G.hasReactif ? getValueID(ui.ES_SUPP_VOL, "float") : 0;
    G.exc.vol =
        G.hasExc != null && G.hasExc != 0 ? (G.exc.vol = getValueID(ui.ES_EXC_VOL, "float")) : 0;
    G.solution.vol = G.titre.vol + G.eau.vol + G.reactif.vol + G.exc.vol;

    // Concentrations
    G.titre.conc = getValueID(ui.ES_TITRE_CONC, "float");
    G.titrant.conc = getValueID(ui.ES_TITRANT_CONC, "float");
    G.reactif.conc = G.hasReactif ? getValueID(ui.ES_SUPP_CONC, "float") : 0;
    G.exc.conc = G.hasExc ? getValueID(ui.ES_EXC_CONC, "float") : 0;

    // Divers
    G.equation.id = getValueID(ui.ES_AUTREDOS_SELECT, "int") - 1;
    const r = G.listOxydo[G.equation.id];
    G.mesure = r.mesure;
    G.indics = new uString(r.indic).strListToArray().getArray();
    G.label = r.label;
    G.typeDetail = parseInt(r.type);

    // equation
    var eq = [];
    if (G.hasReactif) {
        eq.push(JSON.parse(G.eqs[G.equation.id][0]));
        eq.push(JSON.parse(G.eqs[G.equation.id][1]));
        var s = r.reaction[0].reactifs.split(",");
        G.reactif.formule = s[1];
    } else {
        eq.push(JSON.parse(G.eqs[G.equation.id]));
    }

    G.equation.params = eq;

    G.ph = G.hasExc ? -Math.log10(G.exc.conc) : eq[0]["pH"];

    // initialise couleurs
    G.titre.color = cts.COLORS[eq[0].colors[0]];
    G.titrant.color = cts.COLORS[eq[0].colors[1]];
    G.colProduit.endColor = cts.COLORS[eq[0].colors[2]];
    if (eq[0].colors.length > 3) G.colProduit.currentColor = cts.COLORS[eq[0].colors[3]];
}

/** initialise les valeurs acide-base
 *
 * @param {Dosage} G
 * @file especes.data.js
 */
function setDosageAcValues(G) {
    G.titre.id = getValueID(ui.ES_ACIDEBASE_TITRE_SELECT, "int") - 1;
    G.titrant.id = getValueID(ui.ES_ACIDEBASE_TITRANT_SELECT, "int") - 1;
    G.titre = G.listAcideBase[G.titre.id];
    G.titrant = G.listAcideBase[G.titrant.id];

    G.titrant.vol = 0;
    G.titre.vol = getValueID(ui.ES_TITRE_VOL, "float");
    G.titre.conc = getValueID(ui.ES_TITRE_CONC, "float");
    G.titrant.conc = getValueID(ui.ES_TITRANT_CONC, "float");
    G.eau.vol = getValueID(ui.ES_EAU_VOL, "float");
    G.solution.vol = G.titre.vol + G.eau.vol;
    G.mesure = 3;
    G.indics = new uString(G.titre.indics).strListToArray().getArray();
}

/** Extrait la charge à partir de la formule
 *
 * @param {string} str chaine formule chimique
 * @param {string} exp motif exposant
 * @returns {number}
 * @public
 * @file especes.data.js
 */
function getCharge(str, exp = "'") {
    const reg = new RegExp(exp + "([\\d\\+\\-]*)" + exp);
    let v = str.match(reg);
    if (v == null || v.length === 0) return 0;
    let c = v[1];
    if (c == "+") return 1;
    else if (c == "-") return -1;
    c = v[1].substr(v[1].length - 1, 1) + v[1].slice(0, -1);
    return Number(c);
}

/** Calcule le pH à partir du formulaire
 *
 * @returns {string|boolean}
 * @public
 * @file especes.data.js
 */
function getPH() {
    const c = getValueID(ui.ES_EXC_CONC, "float");
    const vex = getValueID(ui.ES_EXC_VOL, "float");
    const vt = getValueID(ui.ES_TITRE_VOL, "float");
    const ve = getValueID(ui.ES_EAU_VOL, "float");

    if (c > 0 && vex > 0 && vt > 0) {
        let ph = mathArrondir(-Math.log10((c * vex) / (vex + vt + ve)), 3).toString();
        return ph;
    }
    return false;
}

export {setDosageAcValues, setDosageOxValues, getCharge, getPH, eventValidation};
