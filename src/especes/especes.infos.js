import * as t from "../infos/lang_fr.js"
import * as cts from "../environnement/constantes.js"
import { uString } from "../modules/utils/string.js"
import { setDosageAcValues } from "./especes.data.js"

/**
 * @typedef {import ('../../types/classes').Dosage} Dosage
 * @typedef {import ('../../types/types').tInfo} tInfo 
 */

/** Construit le message d'information à partir des données
 * 
 * @param {Dosage} data données
 * @returns {tInfo} 
 * @file especes.infos.js
 */
function getInfoPH(data) {

    let info1, infoText, infoTitle

    // initialise espèces si réaction acido-basique
    if (data.type == cts.TYPE_ACIDEBASE) {
        setDosageAcValues(data)
    }

    // récupère titre et infos
    const titre_name = data.titre.nom;
    const titrant_name = data.titrant.nom;
    const titre_namec = data.titre.nomc;
    const titrant_namec = data.titrant.nomc;
    const titre_couple = new uString(data.titre.acide + "/" + data.titre.base).convertExpoIndice().html
    const titrant_couple = new uString(data.titrant.acide + "/" + data.titrant.base).convertExpoIndice().html;
    let titre_type = data.titre.type < 4 ? t.ACIDE : t.BASE;
    const titrant_type = titre_type == t.ACIDE ? t.BASE : t.ACIDE;
    titre_type = [2, 3, 6, 7].includes(data.titre.type) ? t.POLY + titre_type : t.MONO + titre_type;
    titre_type = [1, 3, 5, 7].includes(data.titre.type) ? titre_type + t.FAIBLE : titre_type + t.FORT;
    infoTitle = t.TITRAGE + titre_namec + t.BY + titrant_namec;
    info1 = t.INFO1a + titre_type + " : " + titre_name + t.AND;
    info1 += t.LE + titrant_type + " : " + titrant_name + ".</p>";
    info1 += t.INFO1b + titre_couple + t.AND + titrant_couple;

    infoText = "<b>" + info1 + "</b><hr/><p><b>" + t.HOWTO + "</b></p><p>";
    infoText += t.infoText

    return { 'title': infoTitle, 'msg': infoText }
}

/** Récupère le titre et les informations à partir de l'identifiant
 *
 * @param {Dosage} data données
 * @returns {tInfo} 
 * @public
 * @file especes.infos.js
*/
function getInfoOX(data) {
    
    let info1, info2, infoText, infoTitle

    // récupère infoTitle, info1 et info2
    infoTitle = t.infoTitle[data.equation.id]
    info1 = t.info1[data.equation.id]
    info2 = t.info2[data.equation.id]

    // définition paramètres
    let defaults = { idModal: "idModal", equation: [] };
    let eqs = { ...defaults, ...data.equation };

    // contruit le texte à afficher
    infoText = new uString(info1).convertExpoIndice().html + "<p>"
    if (eqs.params.length == 1) {
        infoText += "<b>" + eqs.params[0].equationEquilibre
    } else {
        infoText += t.TXT1 + "<b>" + eqs.params[0].equationEquilibre + "</b><p>" + t.TXT2 + "<b>" +
            eqs.params[1].equationEquilibre
    }
    infoText += "</b></p>" + new uString(info2).convertExpoIndice(true, false).html

    return { 'title': infoTitle, 'msg': infoText }
}

export { getInfoPH, getInfoOX }