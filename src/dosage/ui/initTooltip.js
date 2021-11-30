/**
 * tooltip.js
 * 
 * @module dosage/ui/tooltip
 * @description Crée un objet Tooltip
 * ***
 * ***export initTooltip***
 */

import * as cTooltip from "./classes/tooltip.js";
import { TOOLTIP } from "./interface.js"
import { isObject } from "../../modules/utils/type.js";
import {ERROR_OBJ} from "../../modules/utils/errors.js"

/**
 * @typedef {import ('../../../types/classes').Canvas} Canvas
 * @typedef {import ('../../../types/classes').Tooltip} Tooltip 
 */

/** Initie Tooltip
 *
 * @param {Canvas} canvas
 * @returns {Tooltip}
 * @public
 * @file initTooltip.js
 */
function initTooltip( canvas ) {
    if ( !isObject( canvas ) ) throw new TypeError( ERROR_OBJ );

    const tooltip = new cTooltip.Tooltip( TOOLTIP, canvas );
    canvas.addChild( tooltip.tooltip );
    return tooltip;
}

export { initTooltip }