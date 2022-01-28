/**
 * tooltip.js
 * 
 * @module dosage/ui/tooltip
 * @description Crée un objet Tooltip
 * ***
 * ***export initTooltip***
 */

import { TOOLTIP } from "./interface.js"
import { isObject } from "../../modules/utils/type.js";
import {ERROR_OBJ} from "../../modules/utils/errors.js"

/**
 * @typedef {import ('../../../types/classes').Canvas} Canvas
 * @typedef {import ('../../../types/types').tTOOLTIP} tTOOLTIP
 * @typedef {import('../../../types/interfaces').iCanvasRect} iCanvasRect
 * @typedef {import('../../../types/interfaces').iCanvasText} iCanvasText
 */

 /**  Création tooltip
  *
  * @class Tooltip
 */
 class Tooltip {
     /**
      * 
      * @param {tTOOLTIP} sTooltip 
      * @param {Canvas} canvas 
      */
     constructor(sTooltip, canvas) {
         if (! isObject(sTooltip) || !isObject(canvas)) throw new TypeError(ERROR_OBJ)
 
         this.canvas = canvas;
         this.sTooltip = sTooltip;
 
         // tooltip
         /** @type {iCanvasRect} */
         this.tooltip = canvas.display.rectangle({
             x: sTooltip.x,
             y: sTooltip.y,
             width: sTooltip.w,
             height: sTooltip.h,
             borderRadius: sTooltip.border == undefined ? 5 : sTooltip.border,
             origin: { x: "left", y: "top" },
             fill: sTooltip.color == undefined ? "#FFFFFF" : sTooltip.color,
             opacity: 0,
             zindex: 2,
         });
 
         // tooltip texte
         /** @type {iCanvasText} */
         this.tooltip_text = canvas.display.text({
             x: 5,
             y: 5,
             text: sTooltip.txt,
             size: 14,
             fill: "#000000",
         });
 
         this.tooltip.addChild(this.tooltip_text);
     }
 
     /** Affiche le message
      * 
      * @param {string} msg message
      * @returns void
      * @public
      * @file tooltip.js
      */
     dspText(msg = "") {
         this.tooltip.stop();
         this.tooltip_text.text = msg;
         if (msg != "") {
             this.tooltip.fadeTo(
                 0.9,
                 "long",
                 "ease-in-out-cubic",
                 function () {return}
             );
         } else {
             this.tooltip.fadeOut("long", "ease-in-out-cubic", function () {return});
         }
         this.canvas.redraw();
     }
 }
 
/** Initie Tooltip
 *
 * @param {Canvas} canvas
 * @returns {Tooltip}
 * @public
 * @file initTooltip.js
 */
function initTooltip( canvas ) {
    if ( !isObject( canvas ) ) throw new TypeError( ERROR_OBJ );

    const tooltip = new Tooltip( TOOLTIP, canvas );
    canvas.addChild( tooltip.tooltip );
    return tooltip;
}

 
export { Tooltip, initTooltip }