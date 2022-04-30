import {tOCANVAS, tBURETTE, tBECHER, tPoint, tHTMLImageElement} from "./types"
import {Canvas, Becher} from "./classes"

interface iCanvasLoop{
  start: () => void
}
interface iCanvasMouse {
  x: number
  y: number
  cursor: (arg0: string) => void
}

interface iCanvasTimeline {
  stop: () => void
}

interface iCanvasMethods {
  addChild: (arg: iCanvasImage | iCanvasText | iCanvasRect) => void
  clone: (arg0: tPoint) => iCanvasImage
  dragAndDrop: (arg: boolean|{}) => void
  rotateTo: (arg: number) => void
  bind: (name:string, callback:() => void) => void
  animate: (pos:tPoint, options?: {duration: number, easing: string, callback?: (arg:any)=> any}) => iCanvasRect
  scale: (w: number, h: number) => iCanvasImage
  removeChild: (obj: any, arg?: any) => void
  fadeTo: (duree: number, type_in: string, type_out:string, callback?: ()=>void) => iCanvasRect
  fadeOut: (type_in: string, type_out:string, callback?: ()=>void) => iCanvasRect
  stop: () => void
}

export interface iCanvasImage extends iCanvasMethods{
  x: number
  y: number
  width: number
  height: number
  image: string |tHTMLImageElement
  abs_y: number
}

export interface iCanvasText extends tOCANVAS, iCanvasMethods{
  font: string
  size: number
  style: string
  text: string | number
  align: string
}

interface iCanvasRect extends tOCANVAS, iCanvasMethods{
  text: string | number
}


// structure appareil


// appareil de mesure, interface de la classe Appareil
interface iAppareil {
  canvas: Canvas
  unite: string
  etat: number
  value: iCanvasText
  zindex: number
  origin: {x:number|string, y:number|string}
  offsetX: number
  offsetY: number 
  fond: iCanvasImage
  image: string
  dispose:(becher: Becher, x:number, y:number) => void
  setText: (arg: string) => void
}


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
interface iBecher {
  canvas: Canvas
  sbecher: tBECHER
  contenu: iCanvasRect
  fond: iCanvasImage
  setColor(col: string): void
  remplir (debit: number, volume: number, mode: number): void
  showDetail(mode: number): void
  reset(mode: number): void  
}


// interface pour classe
interface iFlacon{
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

// interface pour données formulaire
interface iFrmData{
  mark: boolean;
  pass: boolean
  display: boolean
  buttons: string[]
  callback: ()=>unknown
  validator: object;
}

interface iGraph{
  canvas: string;
  chart: Record<string, unknown>;
  data: Record<string, unknown>[];
  selectedIndicePoint: number;
  old_selectedIndicePoint: number;
  activePoints: unknown[];
  info: string;
}


