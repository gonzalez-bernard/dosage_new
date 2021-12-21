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
import { FLACON_COLORS, FLACON_IMAGES, FLACON_LABELS, FLACON } from "./interface.js"
import * as txt from "./lang_fr.js";
import { getColor } from "../dosage.js";
import { isObject } from "../../modules/utils/type.js";
import {cts} from"../../environnement/constantes.js"
import * as e from "../../modules/utils/errors.js"

/**
 * @typedef {import('../../../types/classes').Flacon} Flacon
 * @typedef {import('../../../types/classes').Canvas} Canvas 
 * @typedef {import('../../../types/classes').Tooltip} Tooltip 
 * @typedef {import('../../../types/classes').Becher} Becher 
 * @typedef {import('../../../types/types').tFLACON} tFLACON 
 * @typedef {import ('../../../types/classes').Dosage} Dosage
   
 */

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

/** Positionne les flacons
 * 
 * @param {Flacon[]} flacons 
 * @return void
 */
function setPosFlacons(flacons){
    let x = FLACON.x+45
    for (let i = 0; i < 7; i++) {
        flacons[i].fond.x = x
        flacons[i].fond.y = FLACON.y
        x += 45
    }
}

/** Crée les flacons
 * 
 * Définit les events
 * 
 * @param {Dosage} G
 * @param {Canvas} canvas 
 * @param {Tooltip} tooltip 
 * @param {Becher} becher 
 * @param {tFLACON} sFlacon
 * @returns {Flacon[]} tableau des flacons
 */
function initFlacon(G, canvas, tooltip, becher, sFlacon) {

    if (!isObject(canvas) || !isObject(tooltip) || !isObject(becher)) throw new TypeError(e.ERROR_OBJ)

    // Crée les flacons
    /** @type {Flacon[]} flacons */
    const flacons = [];
    let x = sFlacon.x


    for (let i = 0; i < 7; i++) {
        sFlacon.x += 45;
        sFlacon.image = "./img/dosage/flacon_" + FLACON_IMAGES[i] + ".png";
        sFlacon.color = FLACON_COLORS[i];
        sFlacon.label = FLACON_LABELS[i];
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
            flacons[i].fond.bind("mouseleave", function () {
                flacons[i].chgText("default", 3, flacons[i].flacon_image.height / 5);
                tooltip.dspText();
            });

            // vidage si flacon retourné, on teste qu'un indicateur n'a pas déjà été mis
            flacons[i].fond.bind("mousedown", function () {
                // si flacon sur portoir
                if (flacons[i].vidage == 0 && (G.indic == -1 || G.indic == null)){
                    set_drag(flacons, true)
                    flacons[i].vidage = 1
                } 
                    
                // flacon penché, on vidange
                else if (flacons[i].vidage == 2 ) {
                    flacons[i].vidange(becher);
                    // positionne indicateur
                    G.etat = G.etat | cts.ETAT_INDIC
                    G.indic = i;
              
                    // initialise couleurs
                    G.titre.color = "black"
                    becher.setColor(getColor(0));
        
                }                        

            })

            // Remise en état du flacon
            flacons[i].fond.bind("dblclick", function () {
                // si flacon en route on le penche si dans zone active
                if (flacons[i].vidage == 1){
                    flacons[i].dispose(becher);
                    flacons[i].vidage = 2
                   
                // flacon penché on le remet en place
                } else if (flacons[i].vidage == 2){
                    flacons[i].dispose(becher);
                    flacons[i].vidage = 0
                    if (G.indic != -1)
                      set_drag(flacons, false)
                }
            });

            // Déplacement du flacon
            flacons[i].fond.dragAndDrop({
                
                move: function () {
                    if ((G.type == cts.TYPE_ACIDEBASE && i < 5) || (G.type == cts.TYPE_OXYDO && i >= 5)) {
                        flacons[i].chgText("default", 3, flacons[i].flacon_image.height / 5);
                    }
                }                
            });
        }
    }

    sFlacon.x = x

    return flacons;
}

export { initFlacon, set_drag, setPosFlacons }