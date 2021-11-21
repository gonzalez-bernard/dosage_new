import {isNumeric, isColor, isObject} from "../../../modules/utils/type.js"
import * as e from "../../../modules/utils/errors.js"

/**
 * @class Burette
 * @classdesc Construit l'objet Burette
 * @param {tBURETTE} burette structure
 * @param {Canvas} canvas 
 */

class Burette {
  constructor(burette, canvas){
    
    this.canvas = canvas
    this.burette = burette
    this.vol_verse = 0
    this.volume = burette.volume        // volume en cours
    this.echelle = burette.echelle      // volume d'une division
    this.debit = burette.debit          // volume minimal versé
    this.grad_size = 0.659*burette.h    // taille ensemble graduation
    this.div_size = this.grad_size/60   // taille d'une division
    this.grad_offset = 105*burette.h/1190 - burette.h/2  // distance entre haut burette et niveau zéro liquide
    this.vol_size = this.div_size/this.echelle  // taille d'un mL 
    this.vol_max = 60 * this.echelle    // volume max
    this.graddiv_size = burette.graduationH/20   // taille d'une division du zoom
    this.vidage = 0 // 0 = burette fermée, 1 = burette ouverte, 2 = burette vide 
    
    // fond
    this.fond = canvas.display.image({
      x: burette.x,
      y: burette.y,
      origin: {x:"center", y:"center"},
      height: burette.h,
      width: burette.w,
      image: burette.closeImage
    })

    // burette ouverte
    this.burette_o = this.fond.clone({x:0,y:0,image:burette.openImage})

    // burette fermée
    this.burette_f = this.fond.clone({x:0,y:0})

    // contenu
    this.contenu = canvas.display.rectangle({
      x: -2,
      y: this.grad_offset + (this.vol_max - this.volume) *  this.vol_size,
      origin: {x:"center",y:"top"},
      width: burette.w -19,
      height: this.volume/this.vol_max * 0.71*burette.h ,
      fill: burette.color,
      zindex: "back"
    })

    // liquide qui coule
    this.liquide = canvas.display.rectangle({
      x: this.burette_f.x-3,
      y: this.burette_f.y + this.burette_f.height/2 - 2,
      width: 2,
      height: 0,
      fill: burette.color
    })
  
    this.fond.addChild(this.contenu)
    this.fond.addChild(this.burette_f)
    this.contenu.zindex = "back"

    // détails
    this.graduation = canvas.display.image({
      x: burette.graduationX,
      y: burette.graduationY,
      origin: {x:"center", y:"center"},
      height: burette.graduationH,
      width: burette.graduationW,
      image: burette.graduationImage
    })

    // menisque et graduation
    this.menisque = canvas.display.image({
      x: 0,
      y: this.graduation.height/2,
      origin: {x:"center", y:"bottom"},
      height: this.grad_size,
      width:burette.graduationW-6,
      image: burette.graduationMenisque
    })

    this.txtgrad = []
    for (var i =0; i<3; i++){
      this.txtgrad[i] = canvas.display.text({
        x: burette.graduationW / 2,
        y: - 0.45*burette.graduationH*(1 - i) - 5,
        origin: {x:20, y:"center"},
        size: 14,
        text: (burette.graduationLabel + 10*i).toString(),
        fill: "#00000"
      })
      this.graduation.addChild(this.txtgrad[i])
    }
    this.graduation.addChild(this.menisque)
  }

  /** Simule le vidage de la burette et le remplissage du bécher
   * 
   * @param {number} debit - volume élémentaire
   * @param {Becher} becher - becher
   * @returns void
   * @public
   * @file burette.js
   */
  vidange(debit, becher) {
    
    if (! isNumeric(debit)) throw new TypeError(e.ERROR_NUM)
    if (! isObject(becher)) throw new TypeError(e.ERROR_OBJ)

    var o = this
    
    this.liquide.y = this.burette_f.y + this.burette_f.height/2 - 2
    this.liquide.height = 0
    this.fond.removeChild(this)
    this.fond.addChild(this.burette_o)
    this.fond.addChild(this.liquide)

    // animation
    this.canvas.setLoop(function(){
      // vidange
      if (o.vidage == 1){
        o.contenu.y -= -debit *  o.vol_size,
        o.contenu.height -= debit *  o.vol_size
        o.vol_verse += debit
        o.volume -= debit
        o.liquide.height = Math.min(o.liquide.height + 5,2 + becher.contenu.abs_y - 
         (o.burette_o.abs_y + o.burette_o.height/2))

         // remplissage du bécher
        becher.remplir(debit,0,1)
        o.canvas.redraw()
        
        // fin de la vidange
        if (o.contenu.height <= 0){
          o.vidage = 2;
        }

      }
      // vidange fermé
      if (o.vidage == 0){
        o.liquide.y += 5
        o.liquide.height = Math.max(2, o.liquide.height-5)
        if (o.liquide.abs_y >= becher.fond.abs_y + becher.fond.height - 5){
          o.vidage = 0
          o.canvas.timeline.stop()
        }
      }  
      }).start()
  }

  /**
   * On quitte la burette, remise en état
   * @param {string} o - 'burette_o' ou 'burette_f'
   * @returns void
   * @public
   * @file burette.js
   */ 
  leave(o){
   
    this.canvas.mouse.cursor('default')
    this.canvas.removeChild(this.graduation)
    this.vidage = 0
    if(o == 'burette_o'){
      this.fond.removeChild(o)
      this.fond.removeChild(this.burette_o)
      this.fond.addChild(this.burette_f)
    }
    this.canvas.redraw()
  }

  /** Affiche un détail (niveau)
   * 
   * @returns void
   * @public
   * @file burette.js
   */
  showDetails(){
    this.canvas.mouse.cursor('pointer')
    if(this.canvas.mouse.y-this.fond.y-this.contenu.y < 40 && this.vol_verse > 1){
        this.graduation.y = this.fond.y + this.contenu.y
         // volume
        var min = this.vol_verse - this.vol_verse % (this.echelle*10)
        for (var i = 0 ; i<3 ; i++){
          this.txtgrad[i].text = min + (10*this.echelle*i)
        }
        var max = min + 20*this.echelle  // valeur maximale affichée
        var delta = max - this.vol_verse +0.5   // écart entre max et volume réel
        this.menisque.height = 2*delta*this.graddiv_size
        this.canvas.addChild(this.graduation)
      }
  }

  /**  Modifie la couleur du contenu du bécher
   *
   * Le paramètre doit avoir le format suivant "#xxxxxx","#xxxxxxxx" ou rgba(r,v,b,a)
   * @param {string} color  couleur
   * @returns void
   * @public
   * @file burette.js
   */
  setColor(color){
  if (color == undefined || ! isColor(color)) throw new TypeError(e.ERROR_COLOR)
  this.contenu.fill = color
  this.canvas.redraw()
  
  }

  /** Réinitialise la burette
   * 
   * @returns void
   * @public
   * @file burette.js
   */
  reset(){
    this.vol_verse = 0
    this.volume = this.burette.volume
    this.contenu.y =  this.grad_offset + (this.vol_max - this.volume) * this.vol_size,
    this.contenu.height = this.volume/this.vol_max * 0.71*this.burette.h 
  }
}

export {Burette}