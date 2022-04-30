/** flacon.js 
 * 
 * @module dosage/ui/initFlacon
 * @description 
 * - Crée l'objet flacon
 * - Définit les events
 * ***
 * ***export initFlacon, set_drag***
*/

import { FLACON_COLORS, FLACON_IMAGES, FLACON_LABELS, FLACON } from "./interface.js"
import * as txt from "./lang_fr.js";
import { getColor } from "../dosage.js";
import { isObject } from "../../modules/utils/type.js";
import {cts} from"../../environnement/constantes.js"
import * as e from "../../modules/utils/errors.js"

/**
 * @typedef {import('../../../types/classes').Canvas} Canvas 
 * @typedef {import('../../../types/classes').Tooltip} Tooltip 
 * @typedef {import('../../../types/classes').Becher} Becher 
 * @typedef {import('../../../types/types').tFLACON} tFLACON 
 * @typedef {import ('../../../types/classes').Dosage} Dosage
 * @typedef {import('../../../types/interfaces').iCanvasRect} iCanvasRect
 * @typedef {import('../../../types/interfaces').iCanvasImage} iCanvasImage
 * @typedef {import('../../../types/interfaces').iCanvasText} iCanvasText
 */

/**
 * @class Flacon
 * @classdesc Gestion des flacons
 */

  class Flacon {
  
   /**
    * 
    * @param {tFLACON} sFlacon structure
    * @param {Canvas} canvas 
    */
   constructor(sFlacon, canvas) {
 
     this.canvas = canvas
     
     /** @type {number} */
     this.x = sFlacon.x
     /** @type {number} */
     this.y = sFlacon.y
     /** @type {number} */
     this.w = sFlacon.w
     /** @type {number} */
     this.h = sFlacon.h
 
     /** @type {string} */
     this.color = sFlacon.color
 
     /** @type {iCanvasImage} */
     // @ts-ignore
     this.contenu = null
     
     /** @type {string} */
     this.image = sFlacon.image
     /** @type {string} */
     this.label = sFlacon.label
 
     /** @type {number} */
     this.ox = sFlacon.x
     /** @type {number} */
     this.oy = sFlacon.y
     /** @type {number} */
     this.verse = 0
     /** @type {number} */
     this.vidage = 0
     /** @type {number} */
     this.angle = 0
     /** @type {number} */
     this.max = 0;
     
 
     // construit flacon
     /** @type {iCanvasImage} */
     this.fond = canvas.display.image({
       x: sFlacon.x,
       y: sFlacon.y,
       origin: {x:"center",y:"center"},
       width: sFlacon.w,
       height: sFlacon.h,
       image : sFlacon.image,
       id: 'flacon1'
     })
 
     /** @type {iCanvasImage} */
     this.flacon_image = this.fond.clone({x:0, y:0})
 
     // construit contenu
     /** @type {iCanvasImage} */
     this.contenu_flacon = canvas.display.image({
       x: 0,
       y: sFlacon.h/5 -2,
       origin: {x:"center",y:"center"},
       width: sFlacon.w-2,
       height: 2*sFlacon.h/3 -6 ,
       image: sFlacon.image,
       fill: sFlacon.color
     })
 
     // texte 
     /** @type {iCanvasText} */
     this.text_flacon = canvas.display.text({
     x: 0,
     y: sFlacon.h/5,
     origin: {x:"center",y:"center"},
     size: 3,
     text: sFlacon.label,
     align: 'center',
     fill: "#00000"
     })
 
     // liquide qui coule
     /** @type {iCanvasRect} */
     this.liquide = canvas.display.rectangle({
       x: 0,
       y: 0,
       width: 2,
       height: 0,
       fill: sFlacon.color
     })
   
     this.fond.addChild(this.flacon_image)
     this.fond.addChild(this.text_flacon)
     this.fond.addChild(this.liquide)
   }
 
   /**
    * @param {Becher} becher 
    * @returns {boolean}
    * @public
    * @file flacon.js
    */
   vidange(becher){
     // eslint-disable-next-line @typescript-eslint/no-this-alias
     var instance = this
   
     let angle = this.angle*Math.PI/180
     if (Math.abs(this.fond.x + this.fond.height*Math.cos(angle) - becher.sbecher.x) > becher.sbecher.w/2 - 10) 
       return false
     
     // position du goulot
     let x = this.liquide.x
     let y = this.liquide.y
     
     this.liquide.rotateTo(-this.angle)
     this.liquide.height = 0
     
     this.liquide.animate({
       x: 0,
       y: -this.fond.height/2 - 1
     },
     {
       duration: 50,
       easing: "easing-linear",
     })
 
     this.liquide.height = 5
     this.max = (becher.fond.abs_y + becher.fond.height/2 - this.liquide.abs_y)*0.7
 
     // animation
     this.liquide.animate({
       x: -this.max,
       y: -this.max - 50,
     },
     {
       duration: 500,
       easing: "easing-in-cubic",
       callback: function(){
         instance.liquide.x = x
         instance.liquide.y = y
       }
     })
     becher.setColor(getColor(0))
     return true
   }
 
   /** Modifie la taille des caractères et déplace le texte
    * 
    * @param {*} pointer curseur
    * @param {number} taille 
    * @param {number} pos 
    * @returns void
    * @public
    * @file flacon.js
    */
   chgText(pointer, taille, pos){
     this.canvas.mouse.cursor(pointer)
     this.text_flacon.size = taille
     this.text_flacon.y =  pos
   }
 
   /** Positionne le flacon et initialise G.etat
    * 
    * @param {Becher} becher
    * @returns void
    * @public
    * @file flacon.js
    */
   dispose(becher){
     var o = this.fond
     const _xmin = becher.sbecher.x - 20
     const _xmax =  becher.sbecher.x + becher.sbecher.w
     const _ymin = becher.sbecher.y - 100
     const _ymax = becher.sbecher.y
     
     // vidage non actif on penche le flacon
     if(this.vidage == 1){
       // détecte position flacon par rapport au bécher
       // si dans zone on incline
         if(o.x > _xmin && o.x < _xmax && o.y > _ymin && o.y < _ymax){
           // passage en mode vidage
           this.angle = 225
           o.rotateTo(this.angle)
         } else {
           o.rotateTo(0)
           this.y = this.oy
           this.x = this.ox
           this.fond.y = this.y
           this.fond.x = this.x
         } 
 
         // on remet le flacon en place
       } else if (this.vidage == 2){
           o.rotateTo(0)
           this.y = 520
           this.x = 250
           this.fond.y = this.y
           this.fond.x = this.x
       }
   }
 }
 
 
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
        flacons[i] = new Flacon(sFlacon, canvas);
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
                    G.setState('INDIC',1)
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

export { Flacon, initFlacon, set_drag, setPosFlacons }