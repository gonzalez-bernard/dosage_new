

interface iCanvasImage extends tOCANVAS {
  image: string | HTMLImageElement
  height: number
  width: number

}

interface iCanvasText extends tOCANVAS{
  font: string
  height: number
  width: number
  size: number
  style: string
  text: string
  align: string
}

interface iCanvasRect extends tOCANVAS{
  stop: () => void
  fadeTo: (duree: number, type_in: string, type_out:string, callback: ()=>void) => iCanvasRect
  fadeOut: (type_in: string, type_out:string, callback: ()=>void) => iCanvasRect
}


// structure appareil


// appareil de mesure, interface de la classe Appareil
interface iAppareil {
  canvas: Canvas
  unite: string
  etat: number
  value: string
  zindex: number
  origin: {x:number, y:number}
  offsetX: number
  offsetY: number 
  fond: iCanvasImage
  dispose:(becher: Becher, x:number, y:number) => void
  setText: (string) => void
}
// phmetre 

// Structure burette
interface iBurette extends tBURETTE {
  canvas: Canvas
  unite: string
  burette: tBURETTE
  vol_verse: number   // volume versé
  echelle: number     // volume d'une division
  grad_size: number   // taille ensemble graduation
  div_size: number    // taille d'une division
  grad_offset: number // distance entre haut burette et niveau zéro liquide
  vol_size: number    // taille d'un mL
  graddiv_size: number  // taille d'une division du zoom
  vidage: number      //0 = burette fermée, 1 = burette ouverte, 2 = burette vide 
  contenu: iCanvasImage // rectangle pour simuler le contenu
  burette_o: iCanvasImage   // image burette ouverte
  burette_f: iCanvasImage   // image burette fermée
  liquide: iCanvasImage   // image liquide qui coule 
  graduation: iCanvasImage  // image détail
  menisque: iCanvasImage  // menisque et graduation
  txtgrad: iCanvasText  // texte graduation
}


// interface pour classe Becher
interface iBecher extends tBECHER{
  canvas: Canvas
  sbecher: tBECHER
  contenu: iCanvasImage
  fond: iCanvasImage
  //becher_image: iCanvasImage
  //color: tColor
  setColor(col: tColor): void
  remplir (debit: number, volume: number, mode: number): void
  showDetail(mode: number): void
  reset(mode: number): void  
}


// interface pour classe
interface iFlacon extends tFLACON{
  canvas: Canvas
  ox: number,
  oy: number
  verse: number
  vidage: number
  angle: number
  fond: iCanvasImage
  flacon_image: iCanvasImage
  contenu_flacon: iCanvasImage
  text_flacon: iCanvasText
  liquide: tOCANVAS
  length?: number
}


