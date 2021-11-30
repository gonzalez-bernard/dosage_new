import { ChartType } from "../node_modules/chart.js/dist/chart.js";
import { tBECHER, tBURETTE, tColor, tColorProduit, tDataDPH, tDataPH, tEquation, tGlobalCharts, tKeyboard, tLab, tOCANVAS, tPoint, tReactif, tReaction } from "./types.js";
import {iBecher, iCanvasText, iCanvasImage, iCanvasRect, iFlacon, iAppareil} from "./interfaces"

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
    lst_acide: Record<string, unknown>[];
    lst_oxydo: Record<string, unknown>[];
    lst_equation: Record<string, unknown>[];
    listAcideBase: tReactif[];
    listOxydo: tReaction[];
    eqs: string[];
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
    inconnu: unknown;
    charts: tGlobalCharts;
    title: string;
    typeDetail: number;
    indics: number[];
    hasReactif: boolean;
    hasExc: number;
    label: string;
    lab: tLab
    setState(name: number, action: number): void;
    test(name: string, action: number): boolean;
    get(name: string): unknown;
    set(name: string, value: unknown): void;
    initLists(data:Record<string, unknown>): void;
}

declare class Becher implements iBecher {
    canvas: Canvas;
    sbecher: tBECHER;
    volume: number;
    contenu: iCanvasImage;
    fVolumeContenu: number;
    x: number;
    y: number;
    w: number;
    h: number;
    image: string;
    value?: unknown;
    fond: iCanvasImage;
    setColor(col: tColor | string): tColor;
    remplir(debit: number, volume: number, mode: number): void;
    showDetail(mode: number): void;
    reset(mode: number): void;
}

declare class Appareil implements iAppareil {
    fill: string;
    zindex: number;
    origin: {x: number; y: number};
    abs_x: number;
    abs_y: number;
    canvas: Canvas;
    etat: number;
    unite: string;
    offsetX: number;
    offsetY: number;
    image: iCanvasImage | string;
    value: string;
    fond: iCanvasImage;
    dispose: (becher: Becher) => void;
    setText: (string) => void;
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
    contenu: iCanvasImage;
    burette_o: {abs_y: number; height: number};
    burette_f: {abs_y: number; height: number};
    liquide: iCanvasImage;
    graduation: Record<string, unknown>;
    menisque: Record<string, unknown>;
    txtgrad: iCanvasText[];
    vidange: (number, Becher) => void;
    reset: () => void;
    leave: (label: string) => void;
}

declare class Tooltip {
    dspText: (string) => void;
}

type tCanvasDisplay = {
    text: (iCanvasText) => iCanvasText;
    image: (iCanvasImage) => iCanvasImage;
    rectangle: (iCanvasRect) => iCanvasRect;
};
declare class Canvas {
    width: number;
    height: number;
    background: {set: (string) => void};
    keyboard: tKeyboard;
    display: tCanvasDisplay;
    mouse: {cursor: (string) => void};
    redraw: () => void;
    addChild: (a: object) => void;
    bind: (label: string, callback: () => void) => void;
}

declare class Flacon implements iFlacon {
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
    image: iCanvasImage | string;
    fond: iCanvasImage;
    label: string;
    id: number;
    contenu: iCanvasImage | string;
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
}

declare class Graph {
    canvas: string;
    chart: Record<string, unknown>;
    data: Record<string, unknown>[];
    selectedIndicePoint: number;
    old_selectedIndicePoint: number;
    activePoints: unknown[];
    info: string;
}

declare class Graphx extends Graph {
    data_theorique: unknown[];
    data_derive_theorique: unknown[];
    pentes: number[];
    indiceTangentes: number[];
    type: number;
    createChart: (type: ChartType|string, dataset: unknown, options?: unknown) => void
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
    setEvent: (event: string, callback: (evt: Event, elt? : unknown[]) => boolean) => void   
    changeData: (data: object[]) => void
    removeData: (number)=> void
    getChartByProp: (id:string, prop:string) => number
    clearData: (number) => void
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

export {Becher, Dosage, Canvas, Phmetre, Potentiometre, Conductimetre, Burette, Flacon, Graphx, EventForm, Element, Input, Label, Form, Graph, Tooltip}
