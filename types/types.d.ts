import { ChartTypeRegistry } from "chart.js"
import {Becher, Phmetre, Conductimetre, Potentiometre, Burette, Flacon, Canvas, Graphx, Dosage, Tooltip, ChartX} from "./classes"

type tEtat = {
  ESPECES_INIT: number,
  APPAREIL_ACTIF: number,
  INDIC_ON: number,
  GRAPH_TYPE: number
  DATA_INIT: number
  DERIVEE_EXP: number
  TANGENTE: number
  PERPENDICULAIRE: number
  MOVE_TANGENTE: number
  GRAPH_SAVE: number
  THEORIQUE: number
  PROBLEM: number
}

// structure objet Canvas
type tOCANVAS  = {
  x: number
  y: number
  w: number
  h: number
  fill: string
  zindex: number|string
  origin: {x:number|string, y:number|string}
  abs_x: number
  abs_y: number
  width: number
  height: number
  rotation: number 
}

type tCanvasImage = {
  x: number
  y: number
  width: number
  height: number
  image: string
  origin?: {x:string|number, y: string|number}
  id?: string
  fill?: string
  zindex?: number | string
}

type tCanvasRect = {
  x: number
  y: number
  width: number
  height: number
  origin?: {x:string|number, y: string|number}
  fill: string
  zindex? : number | string
  borderRadius?: number
  opacity?: number
}

type tCanvasText = {
  x: number
  y: number
  origin?: {x:string|number, y: string|number}
  fill: string
  zindex? : number | string
  size: number
  text: string
  align?: string 
}

// structure becher
type tBECHER = {
  w: number
  h: number,
  x: number,
  y: number
  color: string,
  image: string,
  fVolumeContenu: number
  contenu: string
}

// Structure flacon
type tFLACON = {
  w: number
  h: number,
  x: number,
  y: number
  color: string,
  image: string,
  label: string,
} 

type tAGITATEUR = {
  w: number
  h: number,
  x: number,
  y: number
  image: string
  id?: number
  zindex?: number
}

type tAPPAREIL = {
  x: number
  y: number
  w: number
  h: number
  fill?: string
  zindex: number
  origin: {x?:number|string, y?:number|string}
  abs_x?: number
  abs_y?: number
  offsetX: number
  offsetY: number 
  value: string
  image: string
}

type tBURETTE = {
  x: number
  y: number
  w: number
  h: number
  fill?: string
  color: string,
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
  /**
   * type : type de réactifs 0 : monoacide acide fort, 1 : monoacide faible, 2: polyacide fort
   * 3: polyacide faible, 4: base forte, 5: base faible
   */
  type: number
  vol: number
  conc: number
  
  nom?: string;
  nomc?: string
  acide?: string
  base?: string
  
  id?: number
  pka?: number
  indics: string
  formule?: string
  color: string | ""
}

type tField = {
  precision: string
  value: number
}

type tInconnu = {
  field: tField[]
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
  currentColor: string
  endColor: string
  finale: string
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
  getKeysDown: () => [number]
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
  image?: string
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
  onClick: (evt: tEvent, elt: unknown) => void
}

type tGraphChart = {
  data: any
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

type tDataset = {
  label: string;
  data: {}[]
  //yAxisID: string;
  other: {}
  options: {}
  setEvent: (event:string, callback:(evt:tEvent)=>void)=>void
}

type tGraphID = {
  data: []  
  visible: boolean  // indique si courbe visible
  save: boolean     // indique si courbe à mémoriser
  type: number    // 1 = ph, 2 = cd, 3 = pt
}

type tEvent = {}

type tHTMLImageElement = {}