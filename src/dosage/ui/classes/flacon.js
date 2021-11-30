/**
 * @class Flacon
 * @classdesc Gestion des flacons
 */

import {getColor} from "../../dosage.js"

/**
 * @typedef {import('../../../../types/classes').Canvas} Canvas
 * @typedef {import('../../../../types/classes').Becher} Becher
 * @typedef {import('../../../../types/types').tFLACON} tFLACON
 */

 class Flacon {
 
  /**
   * 
   * @param {tFLACON} sFlacon structure
   * @param {Canvas} canvas 
   */
  constructor(sFlacon, canvas) {
    this.x = sFlacon.x
    this.y = sFlacon.y
    this.w = sFlacon.w
    this.h = sFlacon.h
    this.color = sFlacon.color
    this.contenu = sFlacon.contenu
    this.image = sFlacon.image
    this.label = sFlacon.label
    this.canvas = canvas
    this.ox = sFlacon.x
    this.oy = sFlacon.y
    this.verse = 0
    this.vidage = 0
    this.angle = 0
    this.id = sFlacon.id
   
    // construit flacon
    this.fond = canvas.display.image({
      x: sFlacon.x,
      y: sFlacon.y,
      origin: {x:"center",y:"center"},
      width: sFlacon.w,
      height: sFlacon.h,
      image : sFlacon.image,
      id: 'flacon1'
    })

    this.flacon_image = this.fond.clone({x:0, y:0})

    // construit contenu
    this.contenu_flacon = canvas.display.image({
      x: 0,
      y: sFlacon.h/5 -2,
      origin: {x:"center",y:"center"},
      width: sFlacon.w-2,
      height: 2*sFlacon.h/3 -6 ,
      image: sFlacon.image_contenu,
      fill: sFlacon.color
    })

    // texte 
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
    //var dosage = JSON.parse(sessionStorage.getItem("dosage"))
    var o = this.fond
    if(this.vidage == 0){
      if(o.x > becher.sbecher.x){
        this.angle = 225
        o.rotateTo(this.angle)
        this.vidage = 1   // en attente de vidage
      }
    } else {
      this.vidage = 0     // flacon vertical
      o.rotateTo(0)
      o.x = this.ox
      o.y = this.oy
    }
  }
}

export {Flacon}