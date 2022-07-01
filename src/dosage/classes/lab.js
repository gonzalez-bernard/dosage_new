// @ts-nocheck
/**
 * Classe lab
 *
 */

import { initBecher as _initBecher } from "../ui/becher.js";
// @ts-ignore
import { initTooltip as _initTooltip, Tooltip } from "../ui/tooltip.js";
import { initBurette as _initBurette } from "../ui/burette.js";
import { initFlacon as _initFlacon, set_drag, setPosFlacons } from "../ui/flacon.js";
import { initPhmetre as _initPhmetre } from "../ui/phmetre.js";
import { initConductimetre as _initConductimetre } from "../ui/conductimetre.js";
import { initPotentiometre as _initPotentiometre } from "../ui/potentiometre.js";

// @ts-ignore

/** @typedef {import('../../../types/classes').Canvas} Canvas
    @typedef {import('../../../types/classes').Phmetre} Phmetre 
    @typedef {import('../../../types/classes').Conductimetre} Conductimetre
    @typedef {import('../../../types/classes').Potentiometre} Potentiometre
    @typedef {import('../../../types/classes').Becher} Becher
    @typedef {import('../../../types/classes').Burette} Burette
    @typedef {import('../../../types/classes').Flacon} Flacon
    @typedef {import('../../../types/classes').Tooltip} Tooltip
*/

class Lab {

    /*  
    becher; tooltip; flacons; phmetre; conductimetre; potentiometre
    */

    constructor() {
        /** @type {Canvas} */
        this.canvas = undefined
        /** @type {Becher} */
        this.becher = {}
        /** @type {Tolltip} */
        this.tooltip = {}
        this.labo = {}
        /** @type {Burette} */
        this.burette = {}
        /** @type {Flacon[]} */
        this.flacons = []
        /** @type {Phmetre} */
        this.phmetre = {}
        /** @type {Conductimetre} */
        this.conductimetre = {}
        /** @type {Potentiometre} */
        this.potentiometre = {}
    }

    /**
     *
     * @param {Canvas} canvas
     * @param {string} background
     */
    setCanvas(canvas, background, labo) {
        // @ts-ignore
        // eslint-disable-next-line no-undef
        this.canvas = oCanvas.create({
            canvas: canvas,
            fps: 40,
            background: background,
        });

        this.canvas.width = labo.CANVAS.width;
        this.canvas.height = labo.CANVAS.height;
        this.labo = labo;
    }

    setBackground(img) {
        this.canvas.background.set(img);
    }

    initBecher(dosage) {
        this.becher = _initBecher(dosage, this.canvas, this.labo.BECHER);
    }

    initTooltip() {
        this.tooltip = _initTooltip(this.canvas);
    }

    initBurette(dosage) {
        // @ts-ignore
        this.burette = _initBurette(dosage, this);
    }

    initFlacon(dosage) {
        this.flacons = _initFlacon(
            dosage,
            this.canvas,
            // @ts-ignore
            this.tooltip,
            this.becher,
            this.labo.FLACON
        );
    }

    initPhmetre(dosage) {
        // @ts-ignore
        this.phmetre = _initPhmetre(dosage, this);
    }

    initConductimetre(dosage) {
        // @ts-ignore
        this.conductimetre = _initConductimetre(dosage, this);
    }

    initPotentiometre(dosage) {
        // @ts-ignore
        this.potentiometre = _initPotentiometre(dosage, this);
    }

    setDragFlacons(etat) {
        set_drag(this.flacons, etat)
    }

    setPosFlacons() {
        setPosFlacons(this.flacons)
    }

    /** Réinitialise
    * 
    * @file gDosage.events
    */
    reset(gDosage) {

        // réinitialise la burette
        this.burette.reset();

        // réinitialise le bécher
        this.becher.reset(gDosage.solution.vol);

        this.burette.canvas.redraw();

        // actualise l'affichage
        this.phmetre.setText(gDosage.sph);
        this.conductimetre.setText(gDosage.scond);
        this.potentiometre.setText(gDosage.spot)

        // positionne les flacons
        this.setPosFlacons()

        // supprime l'indicateur
        gDosage.indic = null

        // réactive drag flacons
        this.setDragFlacons(true)
    }
}

export { Lab };
