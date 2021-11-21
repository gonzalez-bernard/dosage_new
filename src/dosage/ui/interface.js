/** interface.js 
 * 
 * @module dosage/ui/interface
 * @description Définit les constantes des objets de l'interface dosage
*/

import {COLORS} from '../../environnement/constantes.js'

const CANVAS = {width:500, height:600}

const BURETTE = {
  x: 80,
  y: 210,
  w: 30,
  h: 400,
  color: "rgba(255,255,255,0.5)",
  openImage: "/img/dosage/burette_grado.png",
  closeImage: "/img/dosage/burette_gradf.png",
  graduationImage: "/img/dosage/burette_graduation.png",
  graduationX: 70,
  graduationY: 250,
  graduationW: 90,
  graduationH: 140,
  graduationMenisque: "/img/dosage/burette_liquide_incolore.png",
  graduationLabel: 30,
  volume: 30, // volume initial
  echelle: 0.5, // volume d'une graduation
  debit: 0.05, // volume minimal versé
};

/**
 * @public
 * @property {number} x
 */
const BECHER = {
  w: 80,
  h: 120,
  x: BURETTE.x - 40,
  y: BURETTE.y + BURETTE.h / 2 + 40,
  color: "rgba(255,0,0,0.7)",
  image: "/img/dosage/becher.png",
  contenu: "/img/dosage/becher_contenu.png",
  fVolumeContenu: 1.22
};

const FLACON = {
  x: 100,
  y: 80,
  w: 40,
  h: 100,
  color: "#FF0000",
  image: "/img/dosage/flacon_.png",
  label: "",
};

const FLACON_IMAGES = ["incolore", "vert", "orange", "jaune", "bleu", "noir", "incolore"];
const FLACON_LABELS = [
  "Phenolphtaléine\nIncolore - Rouge\n[8,0 ... 9,9]",
  "BBT\nJaune - Bleu\n[6,0 ... 7,6]",
  "Rouge de Phénol\nJaune - Rouge\n[6,6 ... 8,4]",
  "Hélianthine\nRouge - Jaune\n[3,1 ... 4,4]",
  "Vert de Bromocrésol\nJaune - Bleu\n[3,8 ... 5,4]",
  "NET",
  "Empois d'Amidon"
];
const FLACON_COLORS = [
  "#ffffff",
  "#0089ff",
  "#ffe925",
  "#ffe925",
  "#0cae01",
  "#111111",
  "#eeeeee"
];

const AGITATEUR = {
  x: BECHER.x - 30,
  y: BECHER.y + BECHER.h,
  w: 150,
  h: 50,
  image: "/img/dosage/agitateur.png",
};

const TOOLTIP = {
  x: 200,
  y: 550,
  w: 320,
  h: 50,
  border: 10,
  color: "rgba(255,255,0,0.7)",
  txt: "tooltip"
};

const PHMETRE = {
  x: 140,
  y: 170,
  w: 120,
  h: 170,
  image: "/img/dosage/phmetre_.png",
  value: "----",
  offsetX: 0,
  offsetY: 75,
  fond: undefined,
  fill: undefined,
  zindex: 0,
  origin: {x:undefined, y:undefined},
  abs_x: undefined,
  abs_y: undefined
};

const CONDUCTIMETRE = {
  x: 320,
  y: 190,
  w: 100,
  h: 150,
  image: "/img/dosage/conductimetre.png",
  value: "0.0",
  offsetX: 20,
  offsetY: 85,
  fond: undefined,
  fill: undefined,
  zindex: 0,
  origin: {x:undefined, y:undefined},
  abs_x: undefined,
  abs_y: undefined
};

const POTENTIOMETRE = {
  x: 320,
  y: 370,
  w: 100,
  h: 150,
  image: "/img/dosage/potentiometre.png",
  value: "0.0",
  offsetX: 10,
  offsetY: 85,
  fond: undefined,
  fill: undefined,
  zindex: 0,
  origin: {x:undefined, y:undefined},
  abs_x: undefined,
  abs_y: undefined
};

const INDICATEURS = [
  {
    nom: "phenolphtaleine",values: ["9.1", COLORS.phi_acide, COLORS.phi_acide, COLORS.phi_base],
  },
  { nom: "BBT", values: ["6.8", COLORS.bbt_acide, COLORS.bbt_virage, COLORS.bbt_base] },
  {
    nom: "Rouge de Phénol",values: ["8.0", COLORS.rp_acide, COLORS.rp_virage, COLORS.rp_base],
  },
  { nom: "Hélianthine", values: ["3.7", COLORS.h_acide, COLORS.h_virage, COLORS.h_base] },
  {
    nom: "Vert de Bromocrésol",values: ["4.6", COLORS.vb_acide, COLORS.vb_virage, COLORS.vb_base],
  },
  {
    nom: "NET",
    values: ["0", COLORS.net_acide, COLORS.net_virage, COLORS.net_base]
  },
  {
    nom: "Empois",
    values: ["0", COLORS.emp_acide, COLORS.emp_virage, COLORS.emp_base]
  }
];

export {CANVAS, BECHER, BURETTE, FLACON, FLACON_COLORS, FLACON_IMAGES, FLACON_LABELS, PHMETRE, CONDUCTIMETRE, INDICATEURS, TOOLTIP, AGITATEUR, POTENTIOMETRE}