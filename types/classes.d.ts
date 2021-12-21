import { ChartType, ChartTypeRegistry } from "../node_modules/chart.js";
import { tBECHER, tBURETTE, tCanvasImage, tColorProduit, tDataDPH, tDataPH, tEquation, tGlobalCharts, tKeyboard, tInconnu, tLab, tOCANVAS, tPoint, tReactif, tReaction, tCanvasRect, tCanvasText, tFLACON, tGraphChart } from "./types.js";
import {iBecher, iCanvasText, iCanvasImage, iCanvasRect, iFlacon, iAppareil, iCanvasTimeline, iCanvasLoop, iCanvasMouse, iGraph} from "./interfaces"

declare class Graphs{
    charts: tGlobalCharts[]
}

declare class Dosages {
    saveGraphs: boolean;
    currentDosage: number;
    items: Dosage[];
    getCurrentDosage: () => Dosage
}

declare class Dosage {
    type: number;
    equation: tEquation;
    titre: tReactif;
    titrant: tReactif;
    solution: tReactif;
    colProduit: tColorProduit;
    etat: number;
    event: number;
    ph: number;
    sph: string;
    cond: number;
    scond: string;
    pot: number;
    spot: string;
    indic: number;
    
    pHs: string[];
    vols: number[];
    dpHs: number[];
    pots: number[];
    conds: number[];
    concs: number[];
    reactif: tReactif;
    exc: tReactif;
    eau: tReactif;
    mesure: number;
    inconnu: tInconnu;
    //charts: tGlobalCharts;
    title: string;
    typeDetail: number;
    indics: number[];
    hasReactif: boolean;
    hasExc: number;
    label: string;
    lab: tLab;
    name: string
    setState(name: number, action: number): void;
    test(name: string, action: number): boolean;
    get(name: string): unknown;
    set(name: string, value: unknown): void;
   
}

declare class Especes {
    lstAcide: object[];
    lstOxydo: Record<string, unknown>[];
    lstEquation: Record<string, unknown>[];
    listAcideBase: tReactif[];
    listOxydo: tReaction[];
    eqs: string[];
    initLists(data:Record<string, unknown>): void;
}

declare class Becher implements iBecher {
    canvas: Canvas;
    sbecher: tBECHER;
    volume: number;
    contenu: iCanvasRect;
    fVolumeContenu: number;
    x: number;
    y: number;
    w: number;
    h: number;
    image: string;
    value?: unknown;
    color: string
    fond: iCanvasImage;
    constructor(sbecher: tBECHER, canvas: Canvas)
    setColor(col: string): void;
    remplir(debit: number, volume: number, mode: number): void;
    showDetail(mode: number): void;
    reset(mode: number): void;
}

declare class Appareil implements iAppareil {
    fill: string;
    zindex: number;
    origin: {x: number|string; y: number|string};
    abs_x: number;
    abs_y: number;
    canvas: Canvas;
    etat: number;
    unite: string;
    offsetX: number;
    offsetY: number;
    image: string;
    mesure: number
    value: iCanvasText;
    fond: iCanvasImage;
    dispose: (becher: Becher) => void;
    setText: (txt: string) => void;
}

declare class Phmetre extends Appareil {}

declare class Conductimetre extends Appareil {}

declare class Potentiometre extends Appareil {}

declare class Agitateur {}

declare class Burette {
    canvas: Canvas;
    burette: tBURETTE;
    vol_verse: number;
    volume: number;
    echelle: number;
    debit: number;
    grad_size: number;
    div_size: number;
    grad_offset: number;
    vol_size: number;
    graddiv_size: number;
    vidage: number;
    fond: iCanvasImage;
    contenu: iCanvasRect;
    burette_o: {abs_y: number; height: number};
    burette_f: {abs_y: number; height: number};
    liquide: iCanvasRect;
    graduation: iCanvasImage;
    menisque: iCanvasImage;
    txtgrad: iCanvasText[];
    vidange: (arg0: number, arg1: Becher) => void;
    reset: () => void;
    leave: (label: string) => void;
}

declare class Tooltip {
    dspText: (arg0?: string) => void;
}

type tCanvasDisplay = {
    text: (arg0: tCanvasText) => iCanvasText;
    image: (arg0: tCanvasImage) => iCanvasImage;
    rectangle: (arg0: tCanvasRect) => iCanvasRect;
};

declare class Canvas {
    width: number;
    height: number;
    background: {set: (arg0: string) => void};
    keyboard: tKeyboard;
    display: tCanvasDisplay;
    mouse: iCanvasMouse;
    timeline: iCanvasTimeline
    redraw: () => void;
    addChild: (a: object) => void;
    removeChild: (b: object) => void
    bind: (label: string, callback: () => void) => void;
    setLoop: (arg: any) => iCanvasLoop
}

declare class Flacon implements iFlacon {
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
    image: string;
    fond: iCanvasImage;
    label: string;
    contenu: iCanvasImage;
    canvas: Canvas;
    ox: number;
    oy: number;
    verse: number;
    vidage: number;
    angle: number;
    flacon_image: iCanvasImage;
    contenu_flacon: iCanvasImage;
    text_flacon: iCanvasText;
    liquide: tOCANVAS;
    length?: number;
    chgText: (txt:string, x:number, y:number) => void
    dispose: (arg: Becher) => void
    vidange: (arg:Becher) => void
}

export class Graph {
    canvas: string;
    chart: object;
    data: Record<string, unknown>[];
    selectedIndicePoint: number;
    old_selectedIndicePoint: number;
    activePoints: unknown[];
    info: string;
    setOption: (label:string, value:object) => object
}

declare class Graphx extends Graph {
    data_theorique: unknown[];
    data_derive_theorique: unknown[];
    pentes: number[];
    indiceTangentes: number[];
    type: number;
    createChart: (type: keyof ChartTypeRegistry, dataset: unknown, options?: unknown) => void
    setType: (type: number) => void;
    setOptions: (G: Dosage) => void;
    setDatas: (data: []) => void;
    initDataTheorique: () => void;
    display: () => void;
    dspTangente: (chartID: number, elt: Record<string, unknown>, idTangente: number) => void;
    addTangente: (num: number, pts: tPoint[]) => void;
    delTangente: (index: number) => void;
    movTangente: (evt: Event, indice: number, points: tPoint[], idx: number) => void;
    dspDerivee: () => void;
    _initDerivee: (data: tDataPH[], derive: tDataDPH[]) => tDataPH[];
    _initOptions: (data: unknown[]) => void;
    dspCourbeTheorique: (etat?: number) => void;
    dspPerpendiculaire: (etat?: number) => number;
    _getPerpendiculaire: (p0: tPoint, p1: tPoint, pente: number, factor: number) => void;
    _calcPente: (indice_1: number, indice_2: number, points: unknown[]) => number;
    setEvent: (event: string, callback: (evt: Event, elt? : unknown[]) => any) => void   
    changeData: (data: object[]) => void
    removeData: (arg: number)=> void
    getChartByProp: (id:string, prop:string) => number
    clearData: (arg: number) => void
}

declare class EventForm{
}

declare class Element{
    _elt: string  // identifiant du type de l'élément (ex : label)
    name: string  // nom 
    id: string  // ID
    style: string  // paramètres de style
    class: string  // nom des classes
    _text: string  // texte à afficher entre balises
    _childs: Element[]  // objet enfant
    _attributes: string[]  // tableau des attributs (ex disabled ou required)
    _role: string  // indique l'attribut role
    _tabIndex: number // indice tabulation
    _ext: object[] // complète les balises du style data-
    _div: string
 
}

declare class Form extends Element{
    _action: string  // indique l'action à executer
}

declare class Label extends Element{
    _label: object  // texte label pour input
}

declare class Input extends Element{
    _label: object  // texte label pour input
    _feedback: object
}

export {Becher, Dosage, Dosages, Especes, Canvas, Phmetre, Potentiometre, Conductimetre, Burette, Flacon, Graphx, EventForm, Element, Input, Label, Form, Tooltip}
