/**
 * Classe lab
 *
 */

import {initBecher as _initBecher} from "../ui/becher.js";
// @ts-ignore
import {initTooltip as _initTooltip, Tooltip} from "../ui/tooltip.js";
import {initBurette as _initBurette} from "../ui/burette.js";
import {initFlacon as _initFlacon} from "../ui/flacon.js";
import {initPhmetre as _initPhmetre} from "../ui/phmetre.js";
import {initConductimetre as _initConductimetre} from "../ui/conductimetre.js";
import {initPotentiometre as _initPotentiometre} from "../ui/potentiometre.js";

// @ts-ignore

/** @typedef {import('../../../types/classes').Canvas} Canvas */

class Lab {

  /*  
  becher; tooltip; flacons; phmetre; conductimetre; potentiometre
  */

    constructor() {

      this.canvas = undefined
      this.becher = {} 
      this.tooltip = {}
      this.labo = {}
      this.burette = {}
      this.flacons = []
      this.phmetre = {}
      this.conductimetre = {}
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
}

export {Lab};
