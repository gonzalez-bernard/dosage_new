/** initFlacon.js 
 * 
 * @module dosage/ui/initFlacon
 * @description 
 * - Crée l'objet flacon
 * - Définit les events
 * ***
 * ***export initFlacon, set_drag***
*/

import * as cFlacon from "./classes/flacon.js";
import { FLACON, FLACON_COLORS, FLACON_IMAGES, FLACON_LABELS } from "./interface.js"
import {G} from "../../environnement/globals.js";
import * as txt from "./lang_fr.js";
import { getColor } from "../dosage.js";
import { isObject } from "../../modules/utils/type.js";
import * as cts from "../../environnement/constantes.js"
import * as e from "../../modules/utils/errors.js"

/** Autorise ou interdit le déplacement des flacons
 * 
 * @param {Flacon[]} flacons tableau d'objets flacons
 * @param {boolean} state état 
 */
function set_drag(flacons, state) {
    for (let i = 0; i < 7; i++) {
        flacons[i].fond.dragAndDrop(state)
    }
}

/** Crée les flacons
 * 
 * Définit les events
 * 
 * @param {Canvas} canvas 
 * @param {Tooltip} tooltip 
 * @param {Becher} becher 
 * @param {tFLACON} sFlacon
 * @returns {Flacon[]} tableau des flacons
 */
function initFlacon(canvas, tooltip, becher, sFlacon) {

    if (!isObject(canvas) || !isObject(tooltip) || !isObject(becher)) throw new TypeError(e.ERROR_OBJ)

    // Crée les flacons
    var flacons = [];
    let x = sFlacon.x


    for (let i = 0; i < 7; i++) {
        sFlacon.x += 45;
        sFlacon.image = "./img/dosage/flacon_" + FLACON_IMAGES[i] + ".png";
        sFlacon.color = FLACON_COLORS[i];
        sFlacon.label = FLACON_LABELS[i];
        sFlacon.id = i;
        flacons[i] = new cFlacon.Flacon(sFlacon, canvas);
        canvas.addChild(flacons[i].fond);

        if (G.indics.indexOf(i) != -1) {
            // survol flacon
            flacons[i].fond.bind("mouseenter", function () {
                flacons[i].chgText("pointer", 12, 65);
                if (! G.indic)
                    tooltip.dspText(txt.DO_FLACON);
                else
                    tooltip.dspText(txt.DO_FLACON_ERR);
            });

            // quitte survol
            flacons[i].fond.bind("mouseleave", function (e) {
                flacons[i].chgText("default", 3, flacons[i].flacon_image.height / 5);
                tooltip.dspText();
            });

            // vidage si flacon retourné, on teste qu'un indicateur n'a pas déjà été mis
            flacons[i].fond.bind("mousedown", function (e) {
                // si indicateur déjà versé
                if (G.etat & cts.ETAT_INDIC) return
                if (flacons[i].vidage == 1 && e.detail == 1) {
                    flacons[i].vidange(becher);
                    // positionne indicateur
                    G.etat = G.etat | cts.ETAT_INDIC
                    G.indic = i;

                    // initialise couleurs
                    G.titre.color =
                        becher.setColor(getColor(0));

                    flacons[i].dispose(becher);
                    set_drag(flacons, false)

                    canvas.redraw();
                } else 
                    set_drag(flacons, true)

            });

            // Remise en état du flacon
            flacons[i].fond.bind("dblclick", function (e) {
                //G.indic = i;
                if (G.etat & cts.ETAT_INDIC) return
                flacons[i].dispose(becher);
                canvas.redraw();
                e.stopPropagation();
            });

            // Déplacement du flacon
            flacons[i].fond.dragAndDrop({

                start: function (e) {
                },
                move: function () {
                    if ((G.type == cts.TYPE_ACIDEBASE && i < 5) || (G.type == cts.TYPE_OXYDO && i >= 5)) {
                        flacons[i].chgText("default", 3, flacons[i].flacon_image.height / 5);
                    }
                },
                end: function () { },
            });
        }

    }

    sFlacon.x = x

    return flacons;
}

export { initFlacon, set_drag }