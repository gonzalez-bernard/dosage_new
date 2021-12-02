import {iCanvasImage, iCanvasRect, iCanvasText} from "./interfaces"
import {Becher, Phmetre, Conductimetre, Potentiometre, Burette, Flacon, Canvas, Graphx, Dosage, Tooltip} from "./classes"

type tColor = {
  color: string
}

// structure objet Canvas
type tOCANVAS = {
  x: number
  y: number
  w: number
  h: number
  fill: string
  zindex: number
  origin: {x:number, y:number}
  abs_x: number
  abs_y: number
  height: number
  addChild: (arg: iCanvasImage | iCanvasText | iCanvasRect) => void
  clone: (tPoint) => iCanvasImage
  dragAndDrop: (boolean) => void
  rotateTo: (number) => void
  bind: (name:string, callback:() => void) => void
  animate: (iPoint, object) => void
}

// structure becher
type tBECHER = {
  w: number
  h: number,
  x: number,
  y: number
  //color: string | tColor,
  image: string | iCanvasImage,
  fVolumeContenu: number
  contenu: string | iCanvasImage
}

// Structure flacon
type tFLACON = {
  w: number
  h: number,
  x: number,
  y: number
  color: string,
  image: string | iCanvasImage,
  label: string,
  contenu?: string | iCanvasImage
  id?: number
  image_contenu?: iCanvasImage
} 

type tAGITATEUR = {
  w: number
  h: number,
  x: number,
  y: number
  image: string | iCanvasImage,
  contenu?: string | iCanvasImage
  id?: number
  zindex?: number
}

type tAPPAREIL = {
  x: number
  y: number
  w: number
  h: number
  fill: string
  zindex: number
  origin: {x:number, y:number}
  abs_x: number
  abs_y: number
  offsetX: number
  offsetY: number 
  fond: iCanvasImage
  value: string
  image: iCanvasImage | string
}

type tBURETTE = {
  x: number
  y: number
  w: number
  h: number
  fill?: string
  color: string | tColor,
  openImage: string
  closeImage: string
  graduationImage: string
  graduationX: number
  graduationY: number
  graduationW: number
  graduationH: number
  graduationMenisque: string
  graduationLabel: number
  volume: number // volume initial
  echelle: number // volume d'une graduation
  debit: number // volume minimal versé
}

type tTOOLTIP = {
  x: number
  y: number
  w: number
  h: number
  border: number
  color: string
  txt: string
  //dspText: (string) => void
}

type tReactif = {
  nom?: string;
  nomc?: string
  acide?: string
  base?: string
  type?: number
  vol: number
  id?: number
  conc: number
  pka?: number
  indics?: string
  formule?: string
  color?: tColor
}


type tReaction = {
  reaction: {reactifs: string}
  n_reaction: string
  mesure: number
  indic: string
  label: string
  type: string

}

type tEquation = {
  id: number
  params: Record<string,unknown>[]
}

type tColorProduit = {
  currentColor: tColor
  endColor: tColor
  finale: tColor
}

// Objet contenant les éléments du labo
type tLab = {
  becher: Becher
  phmetre: Phmetre
  conductimetre: Conductimetre
  potentiometre : Potentiometre
  burette: Burette
  flacons: Flacon[]
  canvas: Canvas
  tooltip: Tooltip
}

type tKeyboard = {
  getKeysDown: () => number
}

type tGlobalCharts = {
  chartPH: Graphx
  chartCD: Graphx
  chartPT: Graphx
  current?: Graphx
}

type tPoint = {
  x: number;
  y: number;
}

type tValidator = {
  verif: boolean
}

type tEventData = {
  feedback: () => void
  validator: tValidator
  button: []
  callback: () => void
}

// Saisie données
type tSaisieSelect = {
  type: number,
  valid: boolean
}

// Données information
type tDataInfo = {
  title: string
  idContainer: string
  idBtClose?: string
  labelBtClose?: string
  idModal?: string
  msg?: string
  latex?: boolean
  callbacks?: {id: string, fct: () => void}
  setmsg?: () => void
  actionBtClose?: ()=> void
  data: ()=> Dosage
}

type tDataInfoPH = {
  titre: tEspece
  acide: string
  base: string
  titrant: tEspece
  type: number
}

type tEspece = {
  nom: string
  nomc: string
  acide: string
  base: string
  type: number
}

type tInfo = {
  title: string
  msg: string
}

type tDataPH = {
  vol: number;
  ph: number
}

type tDataDPH = {
  vol: number
  dph: number
}

type iGraphOptions = {
  display: boolean
  title: {display: boolean, text: string}
  id: string,
  position: string
  ticks: {stepsize: number}
  min: string
  max: string
  onClick: (evt: Event, elt: unknown) => void
}

type tInfos = {
  title: string             // titre
  idBtClose: string         // id bouton close
  idContainer: string;      // id container
  idModal?: string          // id de la fenêtre modale (défaut = idModal)
  labelBtClose?: string     // label du bouton (défaut = 'quitter')
  actionBtClose?: ()=> void // fonction sur clic fermeture (défaut = undefined)
  msg?: string              // message à afficher (défaut = undefined, cf. fonction de callback)
  setMsg?: () => string     // fonction chargée du calcul du message
  prm?: object                 // paramètres à fournir à setMsg
  latex?: boolean           // vrai si affichage mathématique (défaut = false)
  callbacks?:  ()=> unknown
  data?: object;
}